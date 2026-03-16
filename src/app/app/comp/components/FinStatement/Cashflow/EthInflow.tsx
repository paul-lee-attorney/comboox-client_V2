import { useEffect, } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { AddrZero, Bytes32Zero, HexType } from "../../../../common";
import { usePublicClient } from "wagmi";
import { Hex } from "viem";
import { Cashflow, CashflowRecordsProps, defaultCashflow } from "../../FinStatement";
import { getFinData, getTopBlkOf, setFinData, setTopBlkOf } from "../../../../../api/firebase/finInfoTools";
import { EthPrice,  retrieveEthPriceByTimestamp } from "../../../../../api/firebase/ethPriceTools";

import { ArbiscanLog, decodeArbiscanLog, getNewLogs } from "../../../../../api/firebase/arbiScanLogsTool";

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
  const { gk } = useComBooxContext();
  
  const client = usePublicClient();


  useEffect(()=>{

    const getEthInflow = async ()=>{

      if (!gk) return;

      let logs = await getFinData(gk, 'ethInflow');


      const toBlkNum = await client.getBlockNumber();
      console.log('toBlkNum of EthInflow: ', toBlkNum);

      let fromBlkNum = (await getTopBlkOf(gk, 'ethInflow')) + 1n;
      console.log('fromBlk of ethInflow: ', fromBlkNum);

      let arr: Cashflow[] = [];
      let ethPrice: EthPrice | undefined = undefined;
     
      let rawLogs = await getNewLogs(gk, 'GeneralKeeper', gk, 'ReceivedCash', fromBlkNum);

      let abiStr = 'event ReceivedCash(address indexed from, uint indexed amt)';

      type TypeOfReceivedCashLog = ArbiscanLog & {
        eventName: string, 
        args: {
          from: Hex,
          amt: bigint
        }
      }

      let recievedCashLogs: TypeOfReceivedCashLog[] = [];

      if (rawLogs && rawLogs.length > 0) {
        recievedCashLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfReceivedCashLog);
      }
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

      console.log('arr in ethInflow:', arr);
      
      if (arr.length > 0) {
        arr = arr.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
        arr = arr.map((v, i) => ({...v, seq:i}));
        console.log('arr added into EthInflow:', arr);

        await setFinData(gk, 'ethInflow', arr, toBlkNum);

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

  }, [gk, client, setRecords]);

  return (
  <>
  </>
  );
} 