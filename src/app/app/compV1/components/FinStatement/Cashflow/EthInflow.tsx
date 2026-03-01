import { useEffect, } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { AddrZero, booxMap, Bytes32Zero, HexType, keepersMap } from "../../../../common";
import { usePublicClient } from "wagmi";
import { decodeEventLog, Hex } from "viem";
import { Cashflow, CashflowRecordsProps, defaultCashflow } from "../../FinStatement";
import { getFinData, setFinData } from "../../../../../api/firebase/finInfoTools";
import { EthPrice,  retrieveEthPriceByTimestamp } from "../../../../../api/firebase/ethPriceTools";
import { listOfOrdersABI, registerOfSharesABI } from "../../../../../../../generated-v1";
import { getShare, parseSnOfShare } from "../../../ros/ros";
import { briefParser } from "../../../loe/loe";
import { ftHis } from "./FtCbpflow";
import { ArbiscanLog, decodeArbiscanLog, getNewLogs, getTopBlkOf, setTopBlkOf } from "../../../../../api/firebase/arbiScanLogsTool";

export type EthInflowSum = {
  totalAmt: bigint;
  sumInUsd: bigint;
  gas: bigint;
  gasInUsd: bigint;
  capital: bigint;
  capitalInUsd: bigint;
  premium: bigint;
  premiumInUsd: bigint;
  transfer: bigint;
  transferInUsd: bigint;
  flag: boolean;
}

export const defEthInflowSum:EthInflowSum = {
  totalAmt: 0n,
  sumInUsd: 0n,
  gas: 0n,
  gasInUsd: 0n,
  capital: 0n,
  capitalInUsd: 0n,
  premium: 0n,
  premiumInUsd: 0n,
  transfer: 0n,
  transferInUsd: 0n,
  flag: false,
}

export const defEthInflowSumArr:EthInflowSum[] = [
  defEthInflowSum, defEthInflowSum, defEthInflowSum, defEthInflowSum,
] 

export const sumArrayOfEthInflow = (arr: Cashflow[]): EthInflowSum => {
  let sum:EthInflowSum = {...defEthInflowSum};

  if (arr.length > 0) {
    arr.forEach(v => {
      sum.totalAmt += v.amt;
      sum.sumInUsd += v.usd;
  
      switch (v.typeOfIncome) {
        case 'TransferIncome':
          sum.transfer += v.amt;
          sum.transferInUsd += v.usd;
          break;
        case 'GasIncome':
          sum.gas += v.amt;
          sum.gasInUsd += v.usd;
          break;
        case 'PayInCap':
          sum.capital += v.amt;
          sum.capitalInUsd += v.usd;
          break;
        case 'PayInPremium':
          sum.premium += v.amt;
          sum.premiumInUsd += v.usd;
          break;
      }  
    });
  }

  sum.flag = true;

  return sum;
}

export const updateEthInflowSum = (arr: Cashflow[], startDate:number, endDate:number) => {
  
  let sum: EthInflowSum[] = [...defEthInflowSumArr];

  if (arr.length > 0 ) {
    sum[1] = sumArrayOfEthInflow(arr.filter(v => v.timestamp < startDate));
    sum[2] = sumArrayOfEthInflow(arr.filter(v => v.timestamp >= startDate && v.timestamp <= endDate));
    sum[3] = sumArrayOfEthInflow(arr.filter(v => v.timestamp <= endDate));  
  }

  return sum;
}

interface CapLog {
  blockNumber: bigint;
  timeStamp: number;
  txHash: HexType;
  addr: HexType;
  acct: bigint;
  value: bigint;
  paid: bigint;
  premium: bigint;  
}

export function EthInflow({setRecords}:CashflowRecordsProps ) {
  const { gk, keepers, boox } = useComBooxContext();
  
  const client = usePublicClient();


  useEffect(()=>{

    const getEthInflow = async ()=>{

      if (!gk || !keepers || !boox ) return;

      const ros = boox[booxMap.ROS];
      const loo = boox[booxMap.LOO];

      let logs = await getFinData(gk, 'ethInflow');

      let fromBlkNum = (await getTopBlkOf(gk, 'ethInflow')) + 1n;
      console.log('fromBlk of ethInflow: ', fromBlkNum);

      let arr: Cashflow[] = [];
      let ethPrice: EthPrice | undefined = undefined;
     
      const appendCapItems = async (capLog:CapLog) => {
     
        let itemCap:Cashflow = {...defaultCashflow,
          blockNumber: capLog.blockNumber,
          timestamp: capLog.timeStamp,
          transactionHash: capLog.txHash,
          typeOfIncome: 'PayInCap',
          usd: capLog.paid * 10n ** 14n,
          addr: capLog.addr,
          acct: capLog.acct ?? 0n,
        }

        ethPrice = await retrieveEthPriceByTimestamp(itemCap.timestamp);
        if (!ethPrice) return;

        itemCap.ethPrice = 10n ** 9n * BigInt(ethPrice.price);
        itemCap.amt = capLog.paid * 10n ** 14n / BigInt(ethPrice.price);

        let itemPremium:Cashflow = {...itemCap,
          typeOfIncome: 'PayInPremium',
          amt: capLog.value - itemCap.amt,
          usd: capLog.premium * 10n ** 14n,
        }

        arr.push(itemCap);
        arr.push(itemPremium);
      }

      let rawLogs = await getNewLogs(gk, 'GeneralKeeper', gk, 'ReceivedCash', fromBlkNum);

      let abiStr = 'event ReceivedCash(address indexed from, uint indexed amt)';

      type TypeOfReceivedCashLog = ArbiscanLog & {
        eventName: string, 
        args: {
          from: Hex,
          amt: bigint
        }
      }

      let recievedCashLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfReceivedCashLog);
      console.log('recievedCashLogs: ', recievedCashLogs);
    
      recievedCashLogs = recievedCashLogs.filter(v => 
          (v.args.from?.toLowerCase() != ftHis[0].toLowerCase()) && 
          (v.args.from?.toLowerCase() != ftHis[1].toLowerCase()) && 
          (v.args.from?.toLowerCase() != ftHis[2].toLowerCase()));
      console.log('recievedCashLogs: ', recievedCashLogs);

      let len = recievedCashLogs.length;
      let cnt = 0;

      while (cnt < len) {
        let log = recievedCashLogs[cnt];
    
        if (log.args.amt > 0) {

          let item:Cashflow = { ...defaultCashflow,
            seq:0,
            blockNumber: BigInt(log.blockNumber),
            timestamp: Number(log.timeStamp),
            transactionHash: log.transactionHash ?? Bytes32Zero,
            typeOfIncome: 'TransferIncome',
            amt: log.args.amt,
            ethPrice: 0n,
            usd: 0n,
            addr: log.args.from ?? AddrZero,
            acct: 0n,
          }
          
          ethPrice = await retrieveEthPriceByTimestamp(item.timestamp);
          if (!ethPrice) return;

          item.ethPrice = 10n ** 9n * BigInt(ethPrice.price);
          item.usd = item.amt * BigInt(ethPrice.price);
          
          arr.push(item);
        }
 
        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[0], 'Refuel', fromBlkNum);

      abiStr = 'event Refuel(address indexed buyer, uint indexed amtOfEth, uint indexed amtOfCbp)';

      type TypeOfRefuelLog = ArbiscanLog & {
        eventName: string, 
        args: {
          buyer: Hex,
          amtOfEth: bigint,
          amtOfCbp: bigint
        }
      }

      let gasIncomeLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRefuelLog);

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[1], 'Refuel', fromBlkNum);

      gasIncomeLogs = [...gasIncomeLogs, ...rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRefuelLog)];

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[2], 'Refuel', fromBlkNum);

      gasIncomeLogs = [...gasIncomeLogs, ...rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRefuelLog)];

      console.log('gasIncomeLogs: ', gasIncomeLogs);
    
      len = gasIncomeLogs.length;
      cnt = 0;

      while (cnt < len) {
        let log = gasIncomeLogs[cnt];
    
        if (log.args.amtOfEth > 0) {

          let item:Cashflow = {...defaultCashflow,
            seq:0,
            blockNumber: BigInt(log.blockNumber),
            timestamp: Number(log.timeStamp),
            transactionHash: log.transactionHash ?? Bytes32Zero, 
            typeOfIncome: 'GasIncome',
            amt: log.args.amtOfEth ?? 0n,
            ethPrice: 0n,
            usd: 0n,
            addr: log.args.buyer ?? AddrZero,
            acct: 0n,
          }

          ethPrice = await retrieveEthPriceByTimestamp(item.timestamp);
          if (!ethPrice) return;

          item.ethPrice = 10n ** 9n * BigInt(ethPrice.price);
          item.usd = item.amt * BigInt(ethPrice.price);
          
          arr.push(item);          

        }

        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'ROMKeeper', keepers[keepersMap.ROMKeeper], 'PayInCapital', fromBlkNum);

      abiStr = 'event PayInCapital(uint indexed seqOfShare, uint indexed amt, uint indexed valueOfDeal)';

      type TypeOfPayInCapitalLog = ArbiscanLog & {
        eventName: string, 
        args: {
          seqOfShare: bigint,
          amt: bigint,
          valueOfDeal: bigint
        }
      }

      let payInCapLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfPayInCapitalLog);
      console.log('payInCapLogs: ', payInCapLogs);

      len = payInCapLogs.length;
      cnt = 0;

      while(cnt < len) {

        let log = payInCapLogs[cnt];

        let receipt = await client.getTransactionReceipt({
          hash: log.transactionHash ?? Bytes32Zero
        });

        let share = await getShare(ros, (log?.args?.seqOfShare ?? 0n).toString());

        let paid = log?.args?.amt ?? 0n;
        let premium = BigInt(share.head.priceOfPaid - 10000) * paid / 10000n;

        let acct = BigInt(share.head.shareholder);  

        let capLog:CapLog = {
          blockNumber: BigInt(log.blockNumber),
          timeStamp: Number(log.timeStamp),
          txHash: log.transactionHash ?? Bytes32Zero,
          addr: receipt.from,
          acct: acct,
          value: log.args.valueOfDeal ?? 0n,
          paid: paid,
          premium: premium,
        }

        await appendCapItems(capLog);

        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'ROAKeeper', keepers[keepersMap.ROAKeeper], 'PayOffCIDeal', fromBlkNum);

      abiStr = 'event PayOffCIDeal(uint indexed caller, uint indexed valueOfDeal)';

      type TypeOfPayOffCIDealLog = ArbiscanLog & {
        eventName: string, 
        args: {
          caller: bigint,
          valueOfDeal: bigint,
        }
      }

      let payOffCIDealLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfPayOffCIDealLog);
      console.log('payOffCIDealLogs: ', payOffCIDealLogs);

      len = payOffCIDealLogs.length;
      cnt = 0;

      while(cnt < len) {

        let log = payOffCIDealLogs[cnt];

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
          .find(v => v?.eventName == 'IssueShare');

        let paid = rosLog?.args.paid ?? 0n;
        let headOfShare = parseSnOfShare(rosLog?.args.shareNumber ?? Bytes32Zero);
        let premium = BigInt(headOfShare.priceOfPaid - 10000) * paid / 10000n;

        let capLog:CapLog = {
          blockNumber: BigInt(log.blockNumber),
          timeStamp: Number(log.timeStamp),
          txHash: log.transactionHash ?? Bytes32Zero,
          addr: receipt.from,
          acct: log.args.caller ?? 0n,
          value: log.args.valueOfDeal ?? 0n,
          paid: paid,
          premium: premium,
        }

        await appendCapItems(capLog);

        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'LOOKeeper', keepers[keepersMap.LOOKeeper], 'CloseBidAgainstInitOffer', fromBlkNum);

      abiStr = 'event CloseBidAgainstInitOffer(uint indexed buyer, uint indexed amt)';

      type TypeOfCloseBidAgainstInitOfferLog = ArbiscanLog & {
        eventName: string, 
        args: {
          buyer: bigint,
          amt: bigint
        }
      }

      let closeBidAgainstInitOfferLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfCloseBidAgainstInitOfferLog);

      console.log('closeBidAgainstInitOfferLogs: ', closeBidAgainstInitOfferLogs);

      len = closeBidAgainstInitOfferLogs.length;
      cnt = 0;

      while(cnt < len) {

        let log = closeBidAgainstInitOfferLogs[cnt];

        let receipt = await client.getTransactionReceipt({
          hash: log.transactionHash ?? Bytes32Zero
        });

        let looLog = receipt.logs
          .filter(v => v.address === loo.toLowerCase())
          .map(v => {
            try {
              return decodeEventLog({
                abi: listOfOrdersABI,
                eventName: 'DealClosed',
                data: v.data,
                topics: v.topics,
              });
            } catch {
              return null;
            }
          }).filter(Boolean)
          .find(v => v?.eventName == 'DealClosed' && 
            briefParser(v.args.deal).consideration == log.args.amt &&
            briefParser(v.args.deal).seqOfShare == '0'
          );

        let dealBrief = briefParser(looLog?.args.deal ?? Bytes32Zero);
        let paid = dealBrief.paid;
        let premium = (dealBrief.price - 10000n) * paid / 10000n;

        let capLog:CapLog = {
          blockNumber: BigInt(log.blockNumber),
          timeStamp: Number(log.timeStamp),
          txHash: log.transactionHash ?? Bytes32Zero,
          addr: receipt.from,
          acct: log.args.buyer ?? 0n,
          value: log.args.amt ?? 0n,
          paid: paid,
          premium: premium,
        }

        await appendCapItems(capLog);

        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'GeneralKeeper', gk, 'ReleaseCustody', fromBlkNum);

      abiStr = 'event ReleaseCustody(uint indexed from, uint indexed to, uint indexed amt, bytes32 reason)';

      type TypeOfReleaseCustodyLog = ArbiscanLog & {
        eventName: string, 
        args: {
          from: bigint,
          to: bigint,
          amt: bigint,
          reason: Hex,
        }
      }

      let closeInitOfferAgainstBidLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfReleaseCustodyLog);      

      closeInitOfferAgainstBidLogs = closeInitOfferAgainstBidLogs.filter((v:any) => 
          (v.args.reason == '0x436c6f7365496e69744f66666572416761696e73744269640000000000000000'));
      console.log('CloseInitOfferAgainstBidLogs: ', closeInitOfferAgainstBidLogs);

      len = closeInitOfferAgainstBidLogs.length;
      cnt = 0;
      
      while(cnt < len) {

        let log = closeInitOfferAgainstBidLogs[cnt];

        let receipt = await client.getTransactionReceipt({
          hash: log.transactionHash ?? Bytes32Zero
        });

        let looLog = receipt.logs
          .filter(v => v.address === loo.toLowerCase())
          .map(v => {
            try {
              return decodeEventLog({
                abi: listOfOrdersABI,
                eventName: 'DealClosed',
                data: v.data,
                topics: v.topics,
              });
            } catch {
              return null;
            }
          }).filter(Boolean)
          .find(v => v?.eventName == 'DealClosed' && 
            briefParser(v.args.deal).consideration == log.args.amt &&
            briefParser(v.args.deal).seqOfShare == '0'
          );

        let dealBrief = briefParser(looLog?.args.deal ?? Bytes32Zero);
        let paid = dealBrief.paid;
        let premium = (dealBrief.price - 10000n) * paid / 10000n;

        let capLog:CapLog = {
          blockNumber: BigInt(log.blockNumber),
          timeStamp: Number(log.timeStamp),
          txHash: log.transactionHash ?? Bytes32Zero,
          addr: receipt.from,
          acct: log.args.from ?? 0n,
          value: log.args.amt ?? 0n,
          paid: paid,
          premium: premium,
        }

        await appendCapItems(capLog);

        cnt++;
      } 

      console.log('arr in ethInflow:', arr);
      
      if (arr.length > 0) {
        arr = arr.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
        arr = arr.map((v, i) => ({...v, seq:i}));
        console.log('arr added into EthInflow:', arr);

        await setFinData(gk, 'ethInflow', arr);

        let toBlkNum = arr[arr.length - 1].blockNumber;
        await setTopBlkOf(gk, 'ethInflow', toBlkNum);
        console.log('updated topBlk Of ethInflow: ', toBlkNum);        

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

    getEthInflow();

  }, [gk, boox, client, keepers, setRecords]);

  return (
  <>
  </>
  );
} 