import { useEffect, } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { AddrZero, Bytes32Zero } from "../../../../common";
import { usePublicClient } from "wagmi";
import { Cashflow, CashflowRecordsProps, defaultCashflow } from "../../FinStatement";
import { getFinData, setFinData, } from "../../../../../api/firebase/finInfoTools";
import { EthPrice, getPriceAtTimestamp, retrieveMonthlyEthPriceByTimestamp } from "../../../../../api/firebase/ethPriceTools";
import { ftHis } from "./FtCbpflow";
import { ArbiscanLog, decodeArbiscanLog, getNewLogs, getTopBlkOf, setTopBlkOf } from "../../../../../api/firebase/arbiScanLogsTool";
import { Hex } from "viem";

export type FtEthflowSum = {
  totalEth: bigint;
  totalEthInUsd: bigint;
  refuelEth: bigint;
  refuelEthInUsd: bigint;
  withdrawEth: bigint;
  withdrawEthInUsd: bigint;
  flag: boolean;
}

export const defFtEthflowSum:FtEthflowSum = {
  totalEth: 0n,
  totalEthInUsd: 0n,
  refuelEth: 0n,
  refuelEthInUsd: 0n,
  withdrawEth: 0n,
  withdrawEthInUsd: 0n,
  flag: false,
}

export const defFtEthflowSumArr:FtEthflowSum[] = [
  defFtEthflowSum, defFtEthflowSum, defFtEthflowSum, defFtEthflowSum
] 


export const sumArrayOfFtEthflow = (arr: Cashflow[]) => {
  let sum: FtEthflowSum = {...defFtEthflowSum};

  if (arr.length > 0) {
    arr.forEach(v => {
      switch (v.typeOfIncome) {            
        case 'WithdrawEth':
          sum.totalEth -= v.amt;
          sum.withdrawEth += v.amt;
  
          sum.totalEthInUsd -= v.usd;
          sum.withdrawEthInUsd += v.usd;
  
          break;
        case 'RefuelEth':
          sum.totalEth += v.amt;
          sum.refuelEth += v.amt;
  
          sum.totalEthInUsd += v.usd;
          sum.refuelEthInUsd += v.usd;
  
          break;
      }
    });  
  }

  sum.flag = true;

  return sum;
}

export const updateFtEthflowSum = (arr: Cashflow[], startDate:number, endDate:number) => {
  
  let sum: FtEthflowSum[] = [...defFtEthflowSumArr];

  if (arr.length > 0 ) {
    sum[1] = sumArrayOfFtEthflow(arr.filter(v => v.timestamp < startDate));
    sum[2] = sumArrayOfFtEthflow(arr.filter(v => v.timestamp >= startDate && v.timestamp <= endDate));
    sum[3] = sumArrayOfFtEthflow(arr.filter(v => v.timestamp <= endDate));  
  }
  
  // console.log('ftCbpflow range:', startDate, endDate);
  // console.log('ftEthflow:', sum);
  return sum;
}

export function FtEthflow({ setRecords }:CashflowRecordsProps ) {
  const { gk, keepers } = useComBooxContext();
  
  const client = usePublicClient();

  useEffect(()=>{

    const getFtCashflow = async ()=>{

      if (!gk || !keepers) return;

      let logs = await getFinData(gk, 'ftEthflow');
      
      let fromBlkNum = (await getTopBlkOf(gk, 'ftEthflow')) + 1n;
      console.log('fromBlk of ftEthflow: ', fromBlkNum);
      
      let arr:Cashflow[] = [];
      let ethPrices: EthPrice[] | undefined = [];

      const appendItem = (newItem: Cashflow, refPrices:EthPrice[]) => {

        if (newItem.amt > 0n) {

          let mark = getPriceAtTimestamp(newItem.timestamp * 1000, refPrices);
          newItem.ethPrice = 10n ** 25n / mark.centPrice;
          newItem.usd = newItem.amt * newItem.ethPrice / 10n ** 9n;
  
          arr.push(newItem);
        }

      } 

      let rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[0], 'Refuel', fromBlkNum);

      let abiStr = 'event Refuel(address indexed buyer, uint indexed amtOfEth, uint indexed amtOfCbp)';

      type TypeOfRefuelLog = ArbiscanLog & {
        eventName: string, 
        args: {
          buyer: Hex,
          amtOfEth: bigint,
          amtOfCbp: bigint
        }
      }

      let refuelLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRefuelLog);

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[1], 'Refuel', fromBlkNum);
      refuelLogs = [...refuelLogs, ...rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRefuelLog)];

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[2], 'Refuel', fromBlkNum);
      refuelLogs = [...refuelLogs, ...rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRefuelLog)];

      console.log('refuelLogs: ', refuelLogs);

      let len = refuelLogs.length;
      let cnt = 0;
      
      while(cnt < len) {

        let log = refuelLogs[cnt];
     
        let item:Cashflow = {...defaultCashflow,
          seq:0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'RefuelEth',
          amt: log.args.amtOfEth ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: log.args.buyer ?? AddrZero,
          acct: 0n,
        }

        if (item.amt > 0) {
          if (ethPrices.length < 1 || 
            item.timestamp * 1000 < ethPrices[0].timestamp ||
            item.timestamp * 1000 > ethPrices[ethPrices.length - 1].timestamp  ) {
              ethPrices = await retrieveMonthlyEthPriceByTimestamp(item.timestamp);
              if (!ethPrices) return;
              else console.log('ethPrices: ', ethPrices);
          }

          appendItem(item, ethPrices);
        }

        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[0], 'WithdrawIncome', fromBlkNum);

      abiStr = 'event WithdrawIncome(address indexed owner, uint indexed amt)';

      type TypeOfWithdrawIncomeLog = ArbiscanLog & {
        eventName: string, 
        args: {
          owner: Hex,
          amt: bigint
        }
      }

      let withdrawEthLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfWithdrawIncomeLog);

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[1], 'WithdrawIncome', fromBlkNum);
      withdrawEthLogs = [...withdrawEthLogs, ...rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfWithdrawIncomeLog)];

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[2], 'WithdrawIncome', fromBlkNum);
      withdrawEthLogs = [...withdrawEthLogs, ...rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfWithdrawIncomeLog)];

      console.log('withdrawEthLogs: ', withdrawEthLogs);
      
      len = withdrawEthLogs.length;
      cnt = 0;

      while(cnt < len) {

        let log = withdrawEthLogs[cnt];
     
        let item:Cashflow = {...defaultCashflow,
          seq:0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'WithdrawEth',
          amt: log.args.amt ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: log.args.owner ?? AddrZero,
          acct: 0n,
        }

        if (item.amt > 0) {
          if (ethPrices.length < 1 || 
            item.timestamp * 1000 < ethPrices[0].timestamp ||
            item.timestamp * 1000 > ethPrices[ethPrices.length - 1].timestamp  ) {
              ethPrices = await retrieveMonthlyEthPriceByTimestamp(item.timestamp);
              if (!ethPrices) return;
              else console.log('ethPrices: ', ethPrices);
          }

          appendItem(item, ethPrices);
        }

        cnt++;
      }

      console.log('arr in ftEthflow:', arr);

      if (arr.length > 0) {
        arr = arr.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
        arr = arr.map((v, i) => ({...v, seq:i}));
        console.log('arr added into FtEthflow:', arr);

        await setFinData(gk, 'ftEthflow', arr);

        let toBlkNum = arr[arr.length - 1].blockNumber;
        await setTopBlkOf(gk, 'ftEthflow', toBlkNum);
        console.log('updated topBlk Of ftEthflow: ', toBlkNum);        

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

    getFtCashflow();

  }, [gk, client, keepers, setRecords]);

  return (
  <>
  </>
  );
} 