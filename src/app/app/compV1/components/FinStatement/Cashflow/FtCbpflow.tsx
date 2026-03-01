import { useEffect, } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { AddrOfRegCenter, AddrOfTank, AddrZero, Bytes32Zero, } from "../../../../common";
import { usePublicClient } from "wagmi";
import { HexParser } from "../../../../common/toolsKit";
import { Cashflow, CashflowRecordsProps, defaultCashflow } from "../../FinStatement";
import { getFinData,  setFinData, } from "../../../../../api/firebase/finInfoTools";
import { EthPrice, getPriceAtTimestamp, retrieveMonthlyEthPriceByTimestamp } from "../../../../../api/firebase/ethPriceTools";
import { ArbiscanLog, decodeArbiscanLog, getNewLogs, getTopBlkOf, setTopBlkOf } from "../../../../../api/firebase/arbiScanLogsTool";
import { Hex } from "viem";
import { rate } from "../../../../fuel_tank/ft";

export type FtCbpflowSum = {
  totalCbp: bigint;
  totalCbpInUsd: bigint;
  addCbp: bigint;
  addCbpInUsd: bigint;
  withdrawCbp: bigint;
  withdrawCbpInUsd: bigint;
  refuelCbp: bigint;
  refuelCbpInUsd: bigint;
  flag: boolean;
}

export const defFtCbpflowSum:FtCbpflowSum = {
  totalCbp: 0n,
  totalCbpInUsd: 0n,
  addCbp: 0n,
  addCbpInUsd: 0n,
  withdrawCbp: 0n,
  withdrawCbpInUsd: 0n,
  refuelCbp: 0n,
  refuelCbpInUsd: 0n,
  flag: false,
}

export const defFtCbpflowSumArr:FtCbpflowSum[] = [
  defFtCbpflowSum, defFtCbpflowSum, defFtCbpflowSum, defFtCbpflowSum
] 

export const sumArrayOfFtCbpflow = (arr: Cashflow[]) => {

  let sum: FtCbpflowSum = { ...defFtCbpflowSum };

  if (arr.length > 0) {
    arr.forEach(v => {

      switch (v.typeOfIncome) {
        case 'AddCbp':
          sum.totalCbp += v.amt;
          sum.addCbp += v.amt;
          
          sum.totalCbpInUsd += v.usd;
          sum.addCbpInUsd += v.usd;
  
          break;
  
        case 'WithdrawCbp':
          sum.totalCbp -= v.amt;
          sum.withdrawCbp += v.amt;
  
          sum.totalCbpInUsd -= v.usd;
          sum.withdrawCbpInUsd += v.usd;
  
          break;
  
        case 'RefuelCbp':
          sum.totalCbp -= v.amt;
          sum.refuelCbp += v.amt;
  
          sum.totalCbpInUsd -= v.usd;
          sum.refuelCbpInUsd += v.usd;
  
          break;
      }  
    });
  }

  sum.flag = true;
  
  return sum;
}

export const ftHis = [
  HexParser("0x1ACCB0C9A87714c99Bed5Ed93e96Dc0E67cC92c0"), 
  HexParser("0xFE8b7e87bb5431793d2a98D3b8ae796796403fA7"),
  HexParser("0xCf7E78D11d579f9E1a5704fAB8769844cD8C8e6b"),
];

export const updateFtCbpflowSum = (arr: Cashflow[], startDate:number, endDate:number) => {
  
  let sum: FtCbpflowSum[] = [...defFtCbpflowSumArr];

  if (arr.length > 0 ) {
    sum[1] = sumArrayOfFtCbpflow(arr.filter(v => v.timestamp < startDate));
    sum[2] = sumArrayOfFtCbpflow(arr.filter(v => v.timestamp >= startDate && v.timestamp <= endDate));
    sum[3] = sumArrayOfFtCbpflow(arr.filter(v => v.timestamp <= endDate));  
  }
  
  return sum;
}

export function FtCbpflow({setRecords}:CashflowRecordsProps ) {
  const { gk, keepers } = useComBooxContext();
  
  const client = usePublicClient();

  useEffect(()=>{

    const getFtCashflow = async ()=>{

      if (!gk || !keepers) return;

      const cbpRate = await rate();

      let logs = await getFinData(gk, 'ftCbpflow');

      let fromBlkNum = (await getTopBlkOf(gk, 'ftCbpflow')) + 1n;
      console.log('fromBlk of FtCbpflow: ', fromBlkNum);

      let arr: Cashflow[] = [];
      let ethPrices: EthPrice[] | undefined = [];
  
      const appendItem = (newItem: Cashflow, refPrices:EthPrice[]) => {
        if (newItem.amt > 0n) {

          let mark = getPriceAtTimestamp(newItem.timestamp * 1000, refPrices);

          let fixRateBlk = client.chain.id == 42161
            ? 348998163n : 165090995n;

          if (newItem.blockNumber > fixRateBlk) {
            newItem.ethPrice = cbpRate * 10n ** 3n;
            newItem.usd = newItem.amt * newItem.ethPrice / 10n ** 9n;  
          } else {
            newItem.ethPrice = 10n ** 25n / mark.centPrice;
            newItem.usd = newItem.amt * newItem.ethPrice / 10n ** 9n;
          }
  
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

      let addCbpLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfTransferLog);

      addCbpLogs = addCbpLogs?.filter((v) => 
          v.args.from.toLowerCase() == gk.toLowerCase() &&
          (v.args.to?.toLowerCase() == ftHis[0].toLowerCase() ||
          v.args.to?.toLowerCase() == ftHis[1].toLowerCase() ||
          v.args.to?.toLowerCase() == ftHis[2].toLowerCase() ||
          v.args.to?.toLowerCase() == AddrOfTank)
      );

      console.log('addCbpLogs: ', addCbpLogs);
    
      let len = addCbpLogs.length;
      let cnt = 0;
    
      while (cnt < len) {
        let log = addCbpLogs[cnt];
    
        let item:Cashflow = {...defaultCashflow,
          seq:0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'AddCbp',
          amt: log.args.value ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: log.args.to ?? AddrZero,
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

      let deprecateLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfTransferLog);

      deprecateLogs = deprecateLogs?.filter((v) => 
          v.args.from.toLowerCase() == `0x${'FE8b7e87bb5431793d2a98D3b8ae796796403fA7'}`.toLowerCase() &&
          v.args.to?.toLowerCase() == gk.toLowerCase()
      );
    
      console.log('deprecateLogs: ', deprecateLogs);

      len = deprecateLogs.length;
      cnt = 0;
    
      while (cnt < len) {
        let log = deprecateLogs[cnt];
    
        let item:Cashflow = {...defaultCashflow,
          seq:0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'WithdrawCbp',
          amt: log.args.value ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: log.args.from ?? AddrZero,
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

      rawLogs = await getNewLogs(gk, 'FuelTank', AddrOfTank, 'WithdrawFuel', fromBlkNum);

      abiStr = 'event WithdrawFuel(address indexed owner, uint indexed amt)';

      type TypeOfWithdrawFuelLog = ArbiscanLog & {
        eventName: string, 
        args: {
          owner: Hex,
          amt: bigint
        }
      }

      let withdrawCbpLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfWithdrawFuelLog);

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[0], 'WithdrawFuel', fromBlkNum);
      withdrawCbpLogs = [...withdrawCbpLogs, ... rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfWithdrawFuelLog)];

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[1], 'WithdrawFuel', fromBlkNum);
      withdrawCbpLogs = [...withdrawCbpLogs, ... rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfWithdrawFuelLog)];

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[2], 'WithdrawFuel', fromBlkNum);
      withdrawCbpLogs = [...withdrawCbpLogs, ... rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfWithdrawFuelLog)];

      console.log('withdrawCbpLogs: ', withdrawCbpLogs);

      len = withdrawCbpLogs.length;
      cnt = 0;

      while(cnt < len) {

        let log = withdrawCbpLogs[cnt];
    
        let item:Cashflow = {...defaultCashflow,
          seq:0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'WithdrawCbp',
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

      let refuelLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRefuelLog);

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[0], 'Refuel', fromBlkNum);
      refuelLogs = [...refuelLogs, ...rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRefuelLog)];

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[1], 'Refuel', fromBlkNum);
      refuelLogs = [...refuelLogs, ...rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRefuelLog)];

      rawLogs = await getNewLogs(gk, 'FuelTank', ftHis[2], 'Refuel', fromBlkNum);
      refuelLogs = [...refuelLogs, ...rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRefuelLog)];

      console.log('refuelLogs: ', refuelLogs);

      len = refuelLogs.length;
      cnt = 0;

      while(cnt < len) {

        let log = refuelLogs[cnt];
     
        let item = {...defaultCashflow,
          seq:0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'RefuelCbp',
          amt: log.args.amtOfCbp ?? 0n,
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

      console.log('arr in ftCbpflow:', arr);

      if (arr.length > 0) {
        arr = arr.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
        arr = arr.map((v, i) => ({...v, seq:i}));
        console.log('arr added into FtCbpflow:', arr);

        await setFinData(gk, 'ftCbpflow', arr);

        let toBlkNum = arr[arr.length - 1].blockNumber;
        await setTopBlkOf(gk, 'ftCbpflow', toBlkNum);
        console.log('updated topBlk Of ftCbpflow: ', toBlkNum);        

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