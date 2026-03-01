import { useEffect } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { AddrZero, booxMap, Bytes32Zero, HexType, keepersMap } from "../../../../common";
import { usePublicClient } from "wagmi";
import { decodeEventLog, Hex } from "viem";
import { Cashflow, CashflowRecordsProps, defaultCashflow } from "../../FinStatement";
import { getFinData, setFinData, } from "../../../../../api/firebase/finInfoTools";
import { registerOfSharesABI, usdRomKeeperABI } from "../../../../../../../generated-v1";
import { getShare, parseSnOfShare } from "../../../ros/ros";
import { addrToUint, HexParser } from "../../../../common/toolsKit";
import { ArbiscanLog, decodeArbiscanLog, getNewLogs, getTopBlkOf, setTopBlkOf } from "../../../../../api/firebase/arbiScanLogsTool";
import { ethers } from "ethers";

export type UsdInflowSum = {
  totalAmt: bigint;
  upgradeCashier: bigint;
  capital: bigint;
  premium: bigint;
  gas: bigint;
  flag: boolean;
}

export const defUsdInflowSum: UsdInflowSum = {
  totalAmt: 0n,
  upgradeCashier: 0n,
  capital: 0n,
  premium: 0n,
  gas:0n,
  flag: false,
}

interface ReleaseUsdLog {
  txHash: HexType;
  blockNumber: bigint;
  from: HexType;
  amt: bigint;
}

export const defUsdInflowSumArr: UsdInflowSum[] = [
  defUsdInflowSum, defUsdInflowSum, defUsdInflowSum, defUsdInflowSum
]

export const sumArrayOfUsdInflow = (arr: Cashflow[]) => {
  
  let sum: UsdInflowSum = {...defUsdInflowSum};

  if (arr.length > 0) {
    arr.forEach(v => {
      sum.totalAmt += v.amt;
  
      switch (v.typeOfIncome) {
        case 'PayInCap':
          sum.capital += v.amt;
          break;
        case 'PayInPremium': 
          sum.premium += v.amt;
          break;
        case 'UpgradeCashier':
          sum.upgradeCashier += v.amt;
          break;
        case 'GasIncome':
          sum.gas += v.amt;
          break;
      }
    }); 
  }

  sum.flag = true;

  return sum;
}

export const csHis = [
  HexParser("0x8871e3Bb5Ac263E10e293Bee88cce82f336Cb20a"),
];

export const updateUsdInflowSum = (arr: Cashflow[], startDate:number, endDate:number ) => {
  
  let sum: UsdInflowSum[] = [...defUsdInflowSumArr];

  if (arr.length > 0 ) {
    sum[1] = sumArrayOfUsdInflow(arr.filter(v => v.timestamp < startDate));
    sum[2] = sumArrayOfUsdInflow(arr.filter(v => v.timestamp >= startDate && v.timestamp <= endDate));
    sum[3] = sumArrayOfUsdInflow(arr.filter(v => v.timestamp <= endDate));  
  }
  
  console.log('range:', startDate, endDate);
  console.log('usdInflow:', sum);
  return sum;
}

export function UsdInflow({setRecords}:CashflowRecordsProps) {
  const { gk, boox, keepers } = useComBooxContext();
  
  const client = usePublicClient();

  useEffect(()=>{

    const getUsdInflow = async () => {

      if (!gk || !boox || !keepers) return;

      const cashier = boox[booxMap.ROI];
      const usdRomKeeper = keepers[keepersMap.UsdROMKeeper];
      const ros = boox[booxMap.ROS];

      let logs = await getFinData(gk, 'usdInflow');

      let fromBlkNum = (await getTopBlkOf(gk, 'usdInflow')) + 1n;
      console.log('fromBlk of usdInflow: ', fromBlkNum);

      let arr: Cashflow[] = [];

      const appendPayInCapLog = async (log:ReleaseUsdLog, paid:bigint, acct:number) => {
        
        let blkNo = log.blockNumber;
        let blk = await client.getBlock({blockNumber: blkNo});

        let itemOfCap:Cashflow = { ...defaultCashflow,
          seq: 0,
          blockNumber: blkNo,
          timestamp: Number(blk.timestamp),
          transactionHash: log.txHash,
          typeOfIncome: 'PayInCap',
          amt: paid,
          ethPrice: addrToUint(log.from ?? AddrZero) ,
          usd: paid,
          addr: log.from ?? AddrZero,
          acct: BigInt(acct),
        };

        arr.push(itemOfCap);

        let premium = log.amt - paid;

        if (premium > 0n) {

          let itemOfPremium:Cashflow = { ...itemOfCap,
            typeOfIncome: 'PayInPremium',
            amt: premium,
            ethPrice: addrToUint(log.from ?? AddrZero),
            usd: premium,
          };
  
          arr.push(itemOfPremium);
        } 
      }

      let rawLogs = await getNewLogs(gk, 'Cashier', cashier, 'ReceiveUsd', fromBlkNum);

      let abiStr = 'event ReceiveUsd(address indexed from, uint indexed amt)';

      type TypeOfReceiveUsdLog = ArbiscanLog & {
        eventName: string, 
        args: {
          from: Hex,
          amt: bigint
        }
      }

      let payInCapLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfReceiveUsdLog);

      rawLogs = await getNewLogs(gk, 'Cashier', csHis[0], 'ReceiveUsd', fromBlkNum);
      payInCapLogs = [...payInCapLogs, ...rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfReceiveUsdLog)];

      console.log('payInCapLogs: ', payInCapLogs);

      let len = payInCapLogs.length;
      let cnt = 0;

      while (cnt < len) {
        let log = payInCapLogs[cnt];

        let input:ReleaseUsdLog = {
          txHash: log.transactionHash ?? Bytes32Zero,
          blockNumber: BigInt(log.blockNumber),
          from: log.args.from ?? Bytes32Zero,
          amt: log.args.amt ?? 0n
        }

        let receipt = await client.getTransactionReceipt({
          hash: log.transactionHash ?? Bytes32Zero
        });

        let usdRomKeeperLog = receipt.logs
          .filter(v => v.address === usdRomKeeper.toLowerCase())
          .map(v => {
            try {
              return decodeEventLog({
                abi: usdRomKeeperABI,
                eventName: 'PayInCapital',
                data: v.data,
                topics: v.topics,
              });
            } catch {
              return null;
            }
          }).filter(Boolean)
          .find(v => v?.eventName == 'PayInCapital');
        
        if (usdRomKeeperLog) {
          let paid = (usdRomKeeperLog?.args.paid ?? 0n) * 100n;
          let acct =  (await getShare(ros, (usdRomKeeperLog?.args.seqOfShare.toString() ?? '0')))
              .head.shareholder;

          await appendPayInCapLog(input, paid, acct);
        } 

        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'Cashier', cashier, 'ReceiveUsdWithRemark', fromBlkNum);

      abiStr = 'ReceiveUsd(address indexed from, uint256 indexed amt, bytes32 indexed remark)';

      type TypeOfGasIncomeUsdLog = ArbiscanLog & {
        eventName: string, 
        args: {
          from: Hex,
          amt: bigint,
          remark: Hex,
        }
      }

      let gasIncomeUsdLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfGasIncomeUsdLog);
      gasIncomeUsdLogs = gasIncomeUsdLogs.filter(v => ethers.decodeBytes32String(v.args.remark) == "CollectUSDCForRefuelCBP");

      console.log('gasIncomeUsdLogs: ', gasIncomeUsdLogs);

      len = gasIncomeUsdLogs.length;
      cnt = 0;

      while (cnt < len) {

        let log = gasIncomeUsdLogs[cnt];

        let item:Cashflow = { ...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'GasIncome',
          amt: log.args.amt ?? 0n,
          ethPrice: addrToUint(log.args.from),
          usd: log.args.amt ?? 0n,
          addr: log.args.from,
          acct: 0n,
        };

        arr.push(item);
      }


      rawLogs = await getNewLogs(gk, 'Cashier', cashier, 'ReleaseUsd', fromBlkNum);

      abiStr = 'event ReleaseUsd(address indexed from, address indexed to, uint indexed amt, bytes32 remark)';

      type TypeOfUsdLog = ArbiscanLog & {
        eventName: string, 
        args: {
          from: Hex,
          to: Hex,
          amt: bigint,
          remark: Hex,
        }
      }

      let releaseUsdLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfUsdLog);
      releaseUsdLogs = releaseUsdLogs.filter(v => v.args.to.toLowerCase() == cashier.toLowerCase());

      console.log('releaseUsdLogs: ', releaseUsdLogs);

      len = releaseUsdLogs.length;
      cnt = 0;

      while (cnt < len) {

        let log = releaseUsdLogs[cnt];

        let input:ReleaseUsdLog = {
          txHash: log.transactionHash ?? Bytes32Zero,
          blockNumber: BigInt(log.blockNumber),
          from: log.args.from ?? Bytes32Zero,
          amt: log.args.amt ?? 0n
        }

        let receipt = await client.getTransactionReceipt({
          hash: log.transactionHash ?? Bytes32Zero
        });

        let rosLog = receipt.logs
          .filter(v => v.address === ros.toLowerCase())
          .map(v => {
            try {
              return decodeEventLog({
                abi: registerOfSharesABI,
                eventName: 'IssueShare',
                data: v.data,
                topics: v.topics,
              });
            } catch {
              return null;
            }
          }).filter(Boolean)
          .find(v => v && v.eventName == 'IssueShare' &&
            v.args.paid * BigInt(parseSnOfShare(
              v.args.shareNumber
            ).priceOfPaid) / 100n === log.args.amt
          );

        let paid = (rosLog?.args.paid ?? 0n) * 100n;
        let acct = parseSnOfShare(rosLog?.args.shareNumber ?? Bytes32Zero)
          .shareholder;

        await appendPayInCapLog(input, paid, acct);  

        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'Cashier', cashier, 'ForwardUsd', fromBlkNum);

      abiStr = 'event ForwardUsd(address indexed from, address indexed to, uint indexed amt, bytes32 remark)';

      let forwardUsdLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfUsdLog);
      releaseUsdLogs = releaseUsdLogs.filter(v => v.args.to.toLowerCase() == cashier.toLowerCase());

      console.log('forwardUsdLogs: ', forwardUsdLogs);

      len = forwardUsdLogs.length;
      cnt = 0;

      while (cnt < len) {

        let log = forwardUsdLogs[cnt];

        let input:ReleaseUsdLog = {
          txHash: log.transactionHash ?? Bytes32Zero,
          blockNumber: BigInt(log.blockNumber),
          from: log.args.from ?? Bytes32Zero,
          amt: log.args.amt ?? 0n
        }

        let receipt = await client.getTransactionReceipt({
          hash: log.transactionHash ?? Bytes32Zero
        });

        let rosLog = receipt.logs
          .filter(v => v.address === ros.toLowerCase())
          .map(v => {
            try {
              return decodeEventLog({
                abi: registerOfSharesABI,
                eventName: 'IssueShare',
                data: v.data,
                topics: v.topics,
              });
            } catch {
              return null;
            }
          }).filter(Boolean)
          .find(v => v && v.eventName == 'IssueShare' &&
            v.args.paid * BigInt(parseSnOfShare(
              v.args.shareNumber
            ).priceOfPaid) / 100n === log.args.amt
          );

        let paid = (rosLog?.args.paid ?? 0n) * 100n;
        let acct = parseSnOfShare(rosLog?.args.shareNumber ?? Bytes32Zero)
          .shareholder;

        await appendPayInCapLog(input, paid, acct);  

        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'Cashier', csHis[0], 'TransferUsd', fromBlkNum);

      abiStr = 'event TransferUsd(address indexed to, uint indexed amt)';

      type TypeOfTransferUsdLog = ArbiscanLog & {
        eventName: string, 
        args: {
          to: Hex,
          amt: bigint,
        }
      }

      let upgradeLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfTransferUsdLog);
      releaseUsdLogs = releaseUsdLogs.filter(v => v.args.to.toLowerCase() == cashier.toLowerCase());

      console.log('upgradeLogs: ', upgradeLogs);

      len = upgradeLogs.length;
      cnt = 0;

      while (cnt < len) {

        let log = upgradeLogs[cnt];

        let item:Cashflow = { ...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'UpgradeCashier',
          amt: log.args.amt ?? 0n,
          ethPrice: addrToUint(csHis[0]),
          usd: log.args.amt ?? 0n,
          addr: csHis[0],
          acct: 0n,
        };

        arr.push(item);

        cnt++;
      }      

      console.log('arr in usdInflow:', arr);

      if (arr.length > 0) {
        
        arr = arr.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
        arr = arr.map((v, i) => ({...v, seq: i}));
        console.log('add arr into usdInflow:', arr);

        await setFinData(gk, 'usdInflow', arr);

        let toBlkNum = arr[arr.length - 1].blockNumber;
        await setTopBlkOf(gk, 'usdInflow', toBlkNum);
        console.log('updated topBlk Of usdInflow: ', toBlkNum);        
        
        if (logs) {
          logs = logs.concat(arr);
        } else {
          logs = arr;
        }
      } 
      
      if (logs && logs.length > 0) {
        logs = logs.map((v,i) => ({...v, seq:i}));
        setRecords(logs);
        console.log('logs in usdInflow:', logs);
      }
    }

    getUsdInflow();

  },[gk, boox, client, keepers, setRecords]);

  return (
    <></>
  );

} 