import { useEffect } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { AddrOfRegCenter, AddrOfTank, AddrZero, Bytes32Zero, FirstUser, keepersMap, SecondUser } from "../../../../common";
import { usePublicClient } from "wagmi";
import { Cashflow, CashflowRecordsProps, defaultCashflow } from "../../FinStatement";
import { getFinData, setFinData, } from "../../../../../api/firebase/finInfoTools";
import { EthPrice, getPriceAtTimestamp, retrieveMonthlyEthPriceByTimestamp } from "../../../../../api/firebase/ethPriceTools";
import { ftHis } from "./FtCbpflow";
import { ArbiscanLog, decodeArbiscanLog, getNewLogs, getTopBlkOf, setTopBlkOf } from "../../../../../api/firebase/arbiScanLogsTool";
import { Hex } from "viem";
import { rate } from "../../../../fuel_tank/ft";

export type CbpOutflowSum = {
  totalAmt: bigint;
  sumInUsd: bigint;
  newUserAward: bigint;
  newUserAwardInUsd: bigint;
  startupCost: bigint;
  startupCostInUsd: bigint;
  fuelSold: bigint;
  fuelSoldInUsd: bigint;
  gmmTransfer: bigint;
  gmmTransferInUsd: bigint;
  bmmTransfer: bigint;
  bmmTransferInUsd: bigint;
  flag: boolean;
}

export const defCbpOutflowSum:CbpOutflowSum = {
  totalAmt: 0n,
  sumInUsd: 0n,
  newUserAward: 0n,
  newUserAwardInUsd: 0n,
  startupCost: 0n,
  startupCostInUsd: 0n,
  fuelSold: 0n,
  fuelSoldInUsd: 0n,
  gmmTransfer: 0n,
  gmmTransferInUsd: 0n,
  bmmTransfer: 0n,
  bmmTransferInUsd: 0n,
  flag: false
}

export const defCbpOutflowSumArr:CbpOutflowSum[] = [
  defCbpOutflowSum, defCbpOutflowSum, defCbpOutflowSum, defCbpOutflowSum
]

const sumArrayOfCbpOutflow = (arr: Cashflow[]) => {

  let sum: CbpOutflowSum = {...defCbpOutflowSum};

  if (arr.length > 0) {
    arr.forEach(v => {
      sum.totalAmt += v.amt;
      sum.sumInUsd += v.usd;
  
      switch (v.typeOfIncome) {
        case 'NewUserAward': 
          sum.newUserAward += v.amt;
          sum.newUserAwardInUsd += v.usd;
          break;
        case 'StartupCost': 
          sum.startupCost += v.amt;
          sum.startupCostInUsd += v.usd;
          break;
        case 'FuelSold':
          sum.fuelSold += v.amt;
          sum.fuelSoldInUsd += v.usd;
          break;
        case 'GmmTransfer':
          sum.gmmTransfer += v.amt;
          sum.gmmTransferInUsd += v.usd;
          break;
        case 'BmmTransfer':
          sum.bmmTransfer += v.amt;
          sum.bmmTransferInUsd += v.usd;
          break;
      }
    });  
  }

  sum.flag = true;

  return sum;
}

export const updateCbpOutflowSum = (arr: Cashflow[], startDate:number, endDate:number) => {
  
  let sum: CbpOutflowSum[] = [...defCbpOutflowSumArr];

  if (arr.length > 0 ) {
    sum[1] = sumArrayOfCbpOutflow(arr.filter(v => v.timestamp < startDate));
    sum[2] = sumArrayOfCbpOutflow(arr.filter(v => v.timestamp >= startDate && v.timestamp <= endDate));
    sum[3] = sumArrayOfCbpOutflow(arr.filter(v => v.timestamp <= endDate));  
  }
  
  return sum;
}

export function CbpOutflow({setRecords}:CashflowRecordsProps ) {
  const { gk, keepers } = useComBooxContext();
  
  const client = usePublicClient();
 
  useEffect(()=>{

    const getEthOutflow = async ()=>{

      if ( !gk || !keepers ) return;

      const cbpRate = await rate();

      let logs = await getFinData(gk, 'cbpOutflow');

      let fromBlkNum = (await getTopBlkOf(gk, 'cbpOutflow')) + 1n;
      console.log('fromBlk of CbpOutflow: ', fromBlkNum);
      
      let arr: Cashflow[] = [];
      let ethPrices: EthPrice[] | undefined = [];

      const appendItem = (newItem: Cashflow, refPrices:EthPrice[]) => {
        if (newItem.amt > 0n) {
          const mark = getPriceAtTimestamp(newItem.timestamp * 1000, refPrices);

          let fixRateBlk = client.chain.id == 42161
            ? 348998163n : 165090995n;

          if (newItem.blockNumber > fixRateBlk) {
            newItem.ethPrice = cbpRate * 10n ** 3n;
            newItem.usd = newItem.amt * newItem.ethPrice / 10n ** 9n;  
          } else {
            newItem.ethPrice = 10n ** 25n / mark.centPrice;
            newItem.usd = newItem.amt * mark.centPrice / 10n ** 9n;
          }
          
          console.log('newItme.ethPrice', newItem.ethPrice);
          console.log('newItme.usd', newItem.usd);

          arr.push(newItem);
        }
      }

      let rawLogs = await getNewLogs(gk, 'RegCenter', AddrOfRegCenter, 'Transfer', fromBlkNum);

      let abiStr = 'event Transfer(address indexed from, address indexed to, uint256 indexed value)';

      type TypeOfTransferLog = ArbiscanLog & {
        eventName: string, 
        args: {
          from: Hex,
          to: Hex,
          value: bigint
        }
      }

      let newUserAwardLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfTransferLog);

      newUserAwardLogs = newUserAwardLogs.filter(v => 
        v.args.from.toLowerCase() == AddrZero &&
        v.args.to?.toLowerCase() != gk.toLowerCase()
      );

      console.log('newUserAwardlogs: ', newUserAwardLogs);

      let len = newUserAwardLogs.length;
      let cnt = 0;

      while (cnt < len) {
        let log = newUserAwardLogs[cnt];
        // let blkNo = log.blockNumber;
        // let blk = await client.getBlock({blockNumber: blkNo});
    
        let item:Cashflow = {...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'NewUserAward',
          amt: log.args.value ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: log.args.to ?? AddrZero,
          acct: 0n,
        }
        
        if (item.addr.toLowerCase() == FirstUser.toLowerCase() ||
          item.addr.toLowerCase() == SecondUser.toLowerCase()) {
          item.typeOfIncome = 'StartupCost';
        } 

        if (ethPrices.length < 1 || 
          item.timestamp * 1000 < ethPrices[0].timestamp ||
          item.timestamp * 1000 > ethPrices[ethPrices.length - 1].timestamp  ) {
            ethPrices = await retrieveMonthlyEthPriceByTimestamp(item.timestamp);
            if (!ethPrices) return;
        }

        appendItem(item, ethPrices);
        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'FuelTank', AddrOfTank, 'Refuel', fromBlkNum);

      abiStr = 'event Refuel(address indexed buyer, uint indexed amtOfEth, uint indexed amtOfCbp)';

      type TypeOfRefuelLog = ArbiscanLog & {
        eventName: string, 
        args: {
          buyer: Hex,
          amtOfEth: bigint,
          amtOfCbp: bigint
        }
      }

      let fuelSoldLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRefuelLog);

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[0], 'Refuel', fromBlkNum);
      fuelSoldLogs = [...fuelSoldLogs, ...rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRefuelLog)];

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[1], 'Refuel', fromBlkNum);
      fuelSoldLogs = [...fuelSoldLogs, ...rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRefuelLog)];

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[2], 'Refuel', fromBlkNum);
      fuelSoldLogs = [...fuelSoldLogs, ...rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRefuelLog)];

      console.log('fuelSoldLogs: ', fuelSoldLogs);
    
      len = fuelSoldLogs.length;
      cnt = 0;
    
      while (cnt < len) {
        let log = fuelSoldLogs[cnt];
    
        let item:Cashflow = {...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'FuelSold',
          amt: log.args.amtOfCbp ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: log.args.buyer ?? AddrZero,
          acct: 0n,
        }
        
        if (ethPrices.length < 1 || 
          item.timestamp * 1000 < ethPrices[0].timestamp ||
          item.timestamp * 1000 > ethPrices[ethPrices.length - 1].timestamp  ) {
            ethPrices = await retrieveMonthlyEthPriceByTimestamp(item.timestamp);
            if (!ethPrices) return;
        }

        appendItem(item, ethPrices);
        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'GMMKeeper', keepers[keepersMap.GMMKeeper], 'TransferFund', fromBlkNum);
      abiStr = 'event TransferFund(address indexed to, bool indexed isCBP, uint indexed amt, uint seqOfMotion, uint caller)';

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
    
      gmmTransferLogs = gmmTransferLogs.filter(v => 
          v.args.isCBP == true &&
          v.args.to?.toLowerCase() != AddrOfTank.toLowerCase() &&
          v.args.to?.toLowerCase() != ftHis[0].toLowerCase() &&
          v.args.to?.toLowerCase() != ftHis[1].toLowerCase() &&
          v.args.to?.toLowerCase() != ftHis[2].toLowerCase() );

      console.log('gmmTransferCbpLogs: ', gmmTransferLogs);

      len = gmmTransferLogs.length;
      cnt = 0;

      while (cnt < len) {
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
        
        if (ethPrices.length < 1 || 
          item.timestamp * 1000 < ethPrices[0].timestamp ||
          item.timestamp * 1000 > ethPrices[ethPrices.length - 1].timestamp  ) {
            ethPrices = await retrieveMonthlyEthPriceByTimestamp(item.timestamp);
            if (!ethPrices) return;
        }

        appendItem(item, ethPrices);
        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'BMMKeeper', keepers[keepersMap.BMMKeeper], 'TransferFund', fromBlkNum);

      let bmmTransferLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfTransferFundLog);

      bmmTransferLogs = bmmTransferLogs?.filter(v => v.args.isCBP == true);
      console.log('bmmTransferCbpLogs: ', bmmTransferLogs);

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

        if (ethPrices.length < 1 || 
          item.timestamp * 1000 < ethPrices[0].timestamp ||
          item.timestamp * 1000 > ethPrices[ethPrices.length - 1].timestamp  ) {
            ethPrices = await retrieveMonthlyEthPriceByTimestamp(item.timestamp);
            if (!ethPrices) return;
        }

        appendItem(item, ethPrices);
        cnt++;
      }

      console.log('arr in cbpOutflow:', arr);

      if (arr.length > 0) {

        arr = arr.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
        arr = arr.map((v, i) => ({...v, seq:i}));
        console.log('arr added into cbpOutflow:', arr);

        await setFinData(gk, 'cbpOutflow', arr);

        let toBlkNum = arr[arr.length - 1].blockNumber;
        await setTopBlkOf(gk, 'cbpOutflow', toBlkNum);
        console.log('updated topBlk Of cbpOutflow: ', toBlkNum);        

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

    getEthOutflow();

  }, [ gk, client, keepers, setRecords]);

  return (
    <>
    </>
  );
} 