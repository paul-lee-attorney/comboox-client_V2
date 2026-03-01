import { useEffect } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { AddrZero, booxMap, Bytes32Zero } from "../../../../common";
import { usePublicClient } from "wagmi";
import { Hex, hexToString } from "viem";
import { Cashflow, CashflowRecordsProps, defaultCashflow } from "../../FinStatement";
import { getFinData, setFinData, } from "../../../../../api/firebase/finInfoTools";
import { addrToUint } from "../../../../common/toolsKit";
import { ArbiscanLog, decodeArbiscanLog, getNewLogs, getTopBlkOf, setTopBlkOf } from "../../../../../api/firebase/arbiScanLogsTool";

export type UsdEscrowSum = {
  totalAmt: bigint;
  forward: bigint;
  escrow: bigint;
  consideration: bigint;
  balance: bigint;
  distribution: bigint;
  pickup: bigint;
  flag: boolean;
}

export const defUsdEscrowSum: UsdEscrowSum = {
  totalAmt: 0n,
  forward: 0n,
  escrow: 0n,
  consideration: 0n,
  balance: 0n,
  distribution: 0n,
  pickup: 0n,
  flag: false,
}

export const defUsdEscrowSumArr: UsdEscrowSum[] = [
  defUsdEscrowSum, defUsdEscrowSum, defUsdEscrowSum, defUsdEscrowSum
]

export const sumArrayOfUsdEscrow = (arr: Cashflow[]) => {
  
  let sum: UsdEscrowSum = {...defUsdEscrowSum};

  if (arr.length > 0) {
    arr.forEach(v => {  
      switch (v.typeOfIncome) {
        case 'PickupUsd':
          sum.totalAmt -= v.amt;
          sum.pickup += v.amt;
          break;
        case 'PayOffSwap': 
        case 'PayOffRejectedDeal':
        case 'PayOffShareTransferDeal':
        case 'PayOffCapIncreaseDeal':
          sum.forward += v.amt;
          break;
        case 'CloseBidAgainstOffer':
        case 'CloseOfferAgainstBid': 
        case 'CloseBidAgainstInitOffer':
        case 'CloseInitOfferAgainstBid':
          sum.totalAmt -= v.amt;
          sum.consideration += v.amt;
          break;
        case 'CustodyValueOfBid':
          sum.totalAmt += v.amt;
          sum.escrow += v.amt;
          break;
        case 'RefundValueOfBidOrder':
        case 'RefundBalanceOfBidOrder':
          sum.totalAmt -= v.amt;
          sum.balance += v.amt;
          break;
        case 'DistributeUsd':
          sum.totalAmt += v.amt;
          sum.distribution += v.amt;
          break;
      }
    }); 
  }

  sum.flag = true;

  return sum;
}

export const updateUsdEscrowSum = (arr: Cashflow[], startDate:number, endDate:number ) => {
  
  let sum: UsdEscrowSum[] = [...defUsdEscrowSumArr];

  if (arr.length > 0 ) {
    sum[1] = sumArrayOfUsdEscrow(arr.filter(v => v.timestamp < startDate));
    sum[2] = sumArrayOfUsdEscrow(arr.filter(v => v.timestamp >= startDate && v.timestamp <= endDate));
    sum[3] = sumArrayOfUsdEscrow(arr.filter(v => v.timestamp <= endDate));  
  }
  
  console.log('range:', startDate, endDate);
  console.log('usdEscrow:', sum);
  return sum;
}

export function UsdEscrow({setRecords}:CashflowRecordsProps) {
  const { gk, boox, keepers } = useComBooxContext();
  
  const client = usePublicClient();

  useEffect(()=>{

    const getUsdEscrow = async () => {

      if (!gk || !boox || !keepers) return;

      const cashier = boox[booxMap.ROI];

      let logs = await getFinData(gk, 'usdEscrow');

      let fromBlkNum = (await getTopBlkOf(gk, 'usdEscrow')) + 1n;
      console.log('fromBlk of usdEscrow: ', fromBlkNum);

      let arr: Cashflow[] = [];

      let rawLogs = await getNewLogs(gk, 'Cashier', cashier, 'ForwardUsd', fromBlkNum);

      let abiStr = 'event ForwardUsd(address indexed from, address indexed to, uint indexed amt, bytes32 remark)';

      type TypeOfCashierLog = ArbiscanLog & {
        eventName: string, 
        args: {
          from: Hex,
          to: Hex,
          amt: bigint,
          remark: Hex
        }
      }

      let forwardUsdLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfCashierLog);
      console.log('forwardUsdLogs: ', forwardUsdLogs);

      let len = forwardUsdLogs.length;
      let cnt = 0;

      while (cnt < len) {
        let log = forwardUsdLogs[cnt];

        let item:Cashflow = { ...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: hexToString(log.args.remark ?? Bytes32Zero, {size:32}),
          amt: log.args.amt ?? 0n,
          ethPrice: addrToUint(log.args.from ?? AddrZero),
          usd: log.args.amt ?? 0n,
          addr: log.args.to ?? AddrZero,
          acct: 0n,
        };
        
        arr.push(item);

        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'Cashier', cashier, 'ReleaseUsd', fromBlkNum);

      abiStr = 'event ReleaseUsd(address indexed from, address indexed to, uint indexed amt, bytes32 remark)';

      let releaseUsdLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfCashierLog);
      console.log('releaseUsdLogs: ', releaseUsdLogs);

      len = releaseUsdLogs.length;
      cnt = 0;

      while (cnt < len) {
        let log = releaseUsdLogs[cnt];

        let item:Cashflow = { ...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: hexToString(log.args.remark ?? Bytes32Zero, {size:32}),
          amt: log.args.amt ?? 0n,
          ethPrice: addrToUint(log.args.from ?? AddrZero),
          usd: log.args.amt ?? 0n,
          addr: log.args.to ?? AddrZero,
          acct: 0n,
        };
        
        arr.push(item);

        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'Cashier', cashier, 'CustodyUsd', fromBlkNum);

      abiStr = 'event CustodyUsd(address indexed from, address indexed to, uint indexed amt, bytes32 remark)';

      let custodyUsdLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfCashierLog);

      console.log('custodyUsdLogs: ', custodyUsdLogs);

      len = custodyUsdLogs.length;
      cnt = 0;

      while (cnt < len) {

        let log = custodyUsdLogs[cnt];

        let item:Cashflow = { ...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: hexToString(log.args.remark ?? Bytes32Zero, {size:32}),
          amt: log.args.amt ?? 0n,
          ethPrice: addrToUint(log.args.from ?? AddrZero),
          usd: log.args.amt ?? 0n,
          addr: cashier,
          acct: 0n,
        };
        
        arr.push(item);

        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'Cashier', cashier, 'DistributeUsd', fromBlkNum);

      abiStr = 'event DistributeUsd(uint indexed amt)';

      type TypeOfDistributeUsdLog = ArbiscanLog & {
        eventName: string, 
        args: {
          amt: bigint
        }
      }

      let distributeUsdLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfDistributeUsdLog);

      console.log('distributeUsdLogs: ', distributeUsdLogs);

      len = distributeUsdLogs.length;
      cnt = 0;

      while (cnt < len) {

        let log = distributeUsdLogs[cnt];

        let item:Cashflow = { ...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'DistributeUsd',
          amt: log.args.amt ?? 0n,
          ethPrice: 0n,
          usd: log.args.amt ?? 0n,
          addr: cashier,
          acct: 0n,
        };
        
        arr.push(item);

        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'Cashier', cashier, 'PickupUsd', fromBlkNum);

      abiStr = 'event PickupUsd(address indexed msgSender, uint indexed caller, uint indexed value)';

      type TypeOfPickupUsdLog = ArbiscanLog & {
        eventName: string, 
        args: {
          msgSender: Hex,
          caller: bigint,
          value: bigint
        }
      }

      let pickupUsdLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfPickupUsdLog);

      console.log('pickupUsdLogs: ', pickupUsdLogs);

      len = pickupUsdLogs.length;
      cnt = 0;

      while (cnt < len) {

        let log = pickupUsdLogs[cnt];

        let item:Cashflow = { ...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'PickupUsd',
          amt: log.args.value ?? 0n,
          ethPrice: 0n,
          usd: log.args.value ?? 0n,
          addr: log.args.msgSender ?? AddrZero,
          acct: log.args.caller ?? 0n,
        };
        
        arr.push(item);

        cnt++;
      }

      console.log('arr in usdEscrow:', arr);

      if (arr.length > 0) {
        
        arr = arr.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
        arr = arr.map((v, i) => ({...v, seq: i}));
        console.log('add arr into usdEscrow:', arr);

        await setFinData(gk, 'usdEscrow', arr);

        let toBlkNum = arr[arr.length - 1].blockNumber;
        await setTopBlkOf(gk, 'usdEscrow', toBlkNum);
        console.log('updated topBlk Of usdEscrow: ', toBlkNum);        
        
        if (logs) {
          logs = logs.concat(arr);
        } else {
          logs = arr;
        }
      } 
      
      if (logs && logs.length > 0) {
        logs = logs.map((v,i) => ({...v, seq:i}));
        setRecords(logs);
      }
      
    }

    if (boox && client) getUsdEscrow();

  },[gk, boox, client, keepers, setRecords]);

  return (
    <></>
  );

} 