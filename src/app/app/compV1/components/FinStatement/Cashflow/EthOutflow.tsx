import { useEffect } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { AddrZero, Bytes32Zero, keepersMap } from "../../../../common";
import { usePublicClient } from "wagmi";
import { HexParser, } from "../../../../common/toolsKit";
import { ethers } from "ethers";
import { Cashflow, CashflowRecordsProps, defaultCashflow } from "../../FinStatement";
import { getFinData, setFinData, } from "../../../../../api/firebase/finInfoTools";
import { EthPrice, retrieveEthPriceByTimestamp } from "../../../../../api/firebase/ethPriceTools";
import { ArbiscanLog, decodeArbiscanLog, getNewLogs, getTopBlkOf, setTopBlkOf } from "../../../../../api/firebase/arbiScanLogsTool";
import { Hex } from "viem";

export type EthOutflowSum = {
  totalAmt: bigint;
  sumInUsd: bigint;
  distribution: bigint;
  distributionInUsd: bigint;
  gmmTransfer: bigint;
  gmmTransferInUsd: bigint;
  gmmExpense: bigint;
  gmmExpenseInUsd: bigint;
  bmmTransfer: bigint;
  bmmTransferInUsd: bigint;
  bmmExpense: bigint;
  bmmExpenseInUsd: bigint;
  flag: boolean;
}

export const defEthOutflowSum:EthOutflowSum = {
  totalAmt: 0n,
  sumInUsd: 0n,
  distribution: 0n,
  distributionInUsd: 0n,
  gmmTransfer: 0n,
  gmmTransferInUsd: 0n,
  gmmExpense: 0n,
  gmmExpenseInUsd: 0n,
  bmmTransfer: 0n,
  bmmTransferInUsd: 0n,
  bmmExpense: 0n,
  bmmExpenseInUsd: 0n,
  flag: false
}

export const defEthOutflowSumArr:EthOutflowSum[] = [
  defEthOutflowSum, defEthOutflowSum, defEthOutflowSum, defEthOutflowSum
] 

export const sumArrayOfEthOutflow = (arr: Cashflow[]) => {
  let sum:EthOutflowSum = {...defEthOutflowSum};

  if (arr.length > 0) {
    arr.forEach(v => {
      sum.totalAmt += v.amt;
      sum.sumInUsd += v.usd;
  
      switch (v.typeOfIncome) {
        case 'GmmTransfer':
          sum.gmmTransfer += v.amt;
          sum.gmmTransferInUsd += v.usd;
          break;
        case 'GmmExpense':
          sum.gmmExpense += v.amt;
          sum.gmmExpenseInUsd += v.usd;
          break;
        case 'BmmTransfer':
          sum.bmmTransfer += v.amt;
          sum.bmmTransferInUsd += v.usd;
          break;
        case 'BmmExpense':
          sum.bmmExpense += v.amt;
          sum.bmmExpenseInUsd += v.usd;
          break;
        case 'Distribution':
          sum.distribution += v.amt;
          sum.distributionInUsd += v.usd;
      }  
    });
  }

  sum.flag = true;

  return sum;
}

export const updateEthOutflowSum = (arr: Cashflow[], startDate:number, endDate:number) => {
  
  let sum: EthOutflowSum[] = [...defEthOutflowSumArr];

  if (arr.length > 0 ) {
    sum[1] = sumArrayOfEthOutflow(arr.filter(v => v.timestamp < startDate));
    sum[2] = sumArrayOfEthOutflow(arr.filter(v => v.timestamp >= startDate && v.timestamp <= endDate));
    sum[3] = sumArrayOfEthOutflow(arr.filter(v => v.timestamp <= endDate));  
  }
  
  return sum;
}

export function EthOutflow({ setRecords}:CashflowRecordsProps ) {
  const { gk, keepers } = useComBooxContext();
  
  const client = usePublicClient();

  useEffect(()=>{

    const getEthOutflow = async ()=>{

      if (!gk || !keepers ) return;

      let logs = await getFinData(gk, 'ethOutflow');

      let fromBlkNum = (await getTopBlkOf(gk, 'ethOutflow')) + 1n;
      console.log('fromBlk of EthOutflow: ', fromBlkNum);
      
      let arr: Cashflow[] = [];
      let ethPrice: EthPrice | undefined = undefined;

      const appendItem = (newItem: Cashflow, refPrices:EthPrice) => {
        if (newItem.amt > 0n) {
              
          newItem.ethPrice = 10n ** 9n * BigInt(refPrices.price);
          newItem.usd = newItem.amt * BigInt(refPrices.price);

          arr.push(newItem);
        }
      } 

      let rawLogs = await getNewLogs(gk, 'GMMKeeper', keepers[keepersMap.GMMKeeper], 'TransferFund', fromBlkNum);

      let abiStr = 'event TransferFund(address indexed to, bool indexed isCBP, uint indexed amt, uint seqOfMotion, uint caller)';

      type TypeOfTransferFundLog = ArbiscanLog & {
        eventName: string, 
        args: {
          to: Hex,
          isCBP: boolean,
          amt: bigint,
          seqOfMotion: bigint,
          caller: bigint,
        }
      }

      let gmmTransferLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfTransferFundLog);

      gmmTransferLogs = gmmTransferLogs.filter(v => v.args.isCBP == false );
      console.log('gmmTransferEthLogs: ', gmmTransferLogs);

      let len = gmmTransferLogs.length;
      let cnt = 0;
      
      while(cnt < len) {

        let log = gmmTransferLogs[cnt];
    
        let item:Cashflow = {...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'GmmTransfer',
          amt: log.args.amt ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: log.args.to ?? AddrZero,
          acct: 0n,
        }

        ethPrice = await retrieveEthPriceByTimestamp(item.timestamp);
        if (!ethPrice) return;

        appendItem(item, ethPrice);
        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'BMMKeeper', keepers[keepersMap.BMMKeeper], 'TransferFund', fromBlkNum);

      let bmmTransferLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfTransferFundLog);

      bmmTransferLogs = bmmTransferLogs?.filter(v => v.args.isCBP == false);
      console.log('bmmEthTransferLogs:', bmmTransferLogs);

      len = bmmTransferLogs.length;
      cnt = 0;

      while(cnt < len) {

        let log = bmmTransferLogs[cnt];
     
        let item:Cashflow = {...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'BmmTransfer',
          amt: log.args.amt ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: log.args.to ?? AddrZero,
          acct: 0n,
        }

        ethPrice = await retrieveEthPriceByTimestamp(item.timestamp);
        if (!ethPrice) return;

        appendItem(item, ethPrice);
        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'GMMKeeper', keepers[keepersMap.GMMKeeper], 'ExecAction', fromBlkNum);
      abiStr = 'event ExecAction(address indexed targets, uint indexed values, bytes indexed params, uint seqOfMotion, uint caller)';

      type TypeOfExecActionLog = ArbiscanLog & {
        eventName: string, 
        args: {
          targets: Hex,
          values: bigint,
          params: Hex,
          seqOfMotion: bigint,
          caller: bigint,
        }
      }

      let gmmExpenseLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfExecActionLog);
      console.log('gmmEthExpLogs: ', gmmExpenseLogs);
      
      len = gmmExpenseLogs.length;
      cnt = 0;

      while(cnt < len) {

        let log = gmmExpenseLogs[cnt];
     
        let item:Cashflow = {...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'GmmExpense',
          amt: log.args.values ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: log.args.targets ?? AddrZero,
          acct: 0n,
        }

        ethPrice = await retrieveEthPriceByTimestamp(item.timestamp);
        if (!ethPrice) return;

        appendItem(item, ethPrice);
        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'BMMKeeper', keepers[keepersMap.BMMKeeper], 'ExecAction', fromBlkNum);

      let bmmExpenseLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfExecActionLog);
      console.log('bmmEthExpLogs: ', bmmExpenseLogs);

      len = bmmExpenseLogs.length;
      cnt = 0;

      while(cnt < len) {

        let log = bmmExpenseLogs[cnt];
     
        let item:Cashflow = {...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'BmmExpense',
          amt: log.args.values ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: log.args.targets ?? AddrZero,
          acct: 0n,
        }

        ethPrice = await retrieveEthPriceByTimestamp(item.timestamp);
        if (!ethPrice) return;

        appendItem(item, ethPrice);
        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'GeneralKeeper', gk, 'SaveToCoffer', fromBlkNum);
      abiStr = 'event SaveToCoffer(uint indexed acct, uint256 indexed value, bytes32 indexed reason)';

      type TypeOfSaveToCofferLog = ArbiscanLog & {
        eventName: string, 
        args: {
          acct: bigint,
          value: bigint,
          reason: Hex,
        }
      }

      let distributionLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfSaveToCofferLog);

      distributionLogs = distributionLogs.filter(v => 
        v.args.reason.toLowerCase() == HexParser(ethers.encodeBytes32String("DistributeProfits")).toLowerCase()
      )

      console.log('distributionLogs: ', distributionLogs);

      len = distributionLogs.length;
      cnt = 0;

      while(cnt < len) {

        let log = distributionLogs[cnt];
     
        let item:Cashflow = {...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: "Distribution",
          amt: log.args.value ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: AddrZero,
          acct: log.args.acct ?? 0n,
        }
    
        ethPrice = await retrieveEthPriceByTimestamp(item.timestamp);
        if (!ethPrice) return;

        appendItem(item, ethPrice);
        cnt++;
      }

      console.log('arr in ethOutflow:', arr);

      if (arr.length > 0) {
        arr = arr.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
        arr = arr.map((v, i) => ({...v, seq:i}));
        console.log('arr added into EthOutflow:', arr);

        await setFinData(gk, 'ethOutflow', arr);

        let toBlkNum = arr[arr.length - 1].blockNumber;
        await setTopBlkOf(gk, 'ethOutflow', toBlkNum);
        console.log('updated topBlk Of ethOutflow: ', toBlkNum);        


        if (logs) {
          logs = logs.concat(arr);
        } else {
          logs = arr;
        }
        
      } 

      if (logs && logs.length > 0) {
        logs = logs.map((v,i) => ({...v, seq:i}));
        setRecords(logs);
        console.log('logs in ethOutflow:', logs);
      }
      
    }

    getEthOutflow();

  }, [gk, client, keepers, setRecords]);

  return (
    <>
    </>
  );
} 