import { useEffect } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { AddrZero, booxMap, Bytes32Zero } from "../../../../common";
import { usePublicClient } from "wagmi";
import { Hex, hexToString } from "viem";
import { Cashflow, CashflowRecordsProps, defaultCashflow } from "../../FinStatement";
import { getFinData, getTopBlkOf, setFinData } from "../../../../../api/firebase/finInfoTools";
import { addrToUint } from "../../../../common/toolsKit";
import { ArbiscanLog, decodeArbiscanLog, getNewLogs } from "../../../../../api/firebase/arbiScanLogsTool";

export type UsdOutflowSum = {
  totalAmt: bigint;
  upgradeCashier: bigint;
  reimburseExp: bigint;
  advanceExp: bigint;
  distributeUsd: bigint;
  flag: boolean;
}

export const defUsdOutflowSum: UsdOutflowSum = {
  totalAmt: 0n,
  upgradeCashier: 0n,
  reimburseExp: 0n,
  advanceExp: 0n,
  distributeUsd: 0n,
  flag: false,
}

export const defUsdOutflowSumArr: UsdOutflowSum[] = [
  defUsdOutflowSum, defUsdOutflowSum, defUsdOutflowSum, defUsdOutflowSum
]

export const sumArrayOfUsdOutflow = (arr: Cashflow[]) => {
  
  let sum: UsdOutflowSum = {...defUsdOutflowSum};

  if (arr.length > 0) {
    arr.forEach(v => {
      sum.totalAmt += v.amt;
  
      switch (v.typeOfIncome) {
        case 'ReimburseExp':
          sum.reimburseExp += v.amt;
          break;
        case 'AdvanceExp': 
          sum.advanceExp += v.amt;
          break;
        case 'DistributeUsd': 
          sum.distributeUsd += v.amt;
          break;
        case 'UpgradeCashier':
          sum.upgradeCashier += v.amt;
          break;
      }
    }); 
  }

  sum.flag = true;

  return sum;
}

export const updateUsdOutflowSum = (arr: Cashflow[], startDate:number, endDate:number ) => {
  
  let sum: UsdOutflowSum[] = [...defUsdOutflowSumArr];

  if (arr.length > 0 ) {
    sum[1] = sumArrayOfUsdOutflow(arr.filter(v => v.timestamp < startDate));
    sum[2] = sumArrayOfUsdOutflow(arr.filter(v => v.timestamp >= startDate && v.timestamp <= endDate));
    sum[3] = sumArrayOfUsdOutflow(arr.filter(v => v.timestamp <= endDate));  
  }
  
  console.log('range:', startDate, endDate);
  console.log('usdOutflow:', sum);
  return sum;
}

export function UsdOutflow({setRecords}:CashflowRecordsProps) {
  const { gk, boox } = useComBooxContext();
  
  const client = usePublicClient();

  useEffect(()=>{

    const getUsdOutflow = async () => {

      if (!gk || !boox) return;

      const cashier = boox[booxMap.Cashier];

      let logs = await getFinData(gk, 'usdOutflow');

      const toBlkNum = await client.getBlockNumber();
      console.log('toBlkNum of UsdOutflow: ', toBlkNum);

      let fromBlkNum = (await getTopBlkOf(gk, 'usdOutflow')) + 1n;
      console.log('fromBlk of usdOutflow: ', fromBlkNum);

      let arr: Cashflow[] = [];

      let rawLogs = await getNewLogs(gk, 'Cashier', cashier, 'TransferUsd', fromBlkNum);

      let abiStr = 'event TransferUsd(address indexed to, uint indexed amt, bytes32 indexed remark)';

      type TypeOfTransferUsdLog = ArbiscanLog & {
        eventName: string, 
        args: {
          to: Hex,
          amt: bigint,
          remark: Hex,
        }
      }

      let transferUsdLogs = rawLogs?.map(log => decodeArbiscanLog(log, abiStr) as TypeOfTransferUsdLog);

      console.log('transferUsdLogs: ', transferUsdLogs);

      let len = transferUsdLogs.length;
      let cnt = 0;

      while (cnt < len) {
        let log = transferUsdLogs[cnt];

        let item:Cashflow = { ...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: hexToString(log.args.remark ?? Bytes32Zero, {size:32}),
          amt: log.args.amt ?? 0n,
          ethPrice: addrToUint(cashier),
          usd: log.args.amt ?? 0n,
          addr: log.args.to ?? AddrZero,
          acct: 0n,
        };
        
        arr.push(item);

        cnt++;
      }

      rawLogs = await getNewLogs(gk, 'Cashier', cashier, 'ReceiveUsd', fromBlkNum);

      abiStr = 'ReceiveUsd(address indexed from, uint256 indexed amt, bytes32 indexed remark)';

      type TypeOfGasIncomeUsdLog = ArbiscanLog & {
        eventName: string, 
        args: {
          from: Hex,
          amt: bigint,
          remark: Hex,
        }
      }

      let upgradeLogs = rawLogs?.map(log => decodeArbiscanLog(log, abiStr) as TypeOfGasIncomeUsdLog);
      if (upgradeLogs) {
        upgradeLogs = upgradeLogs.filter(v => v.args.from.toLowerCase() == gk.toLowerCase());
      }

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
          ethPrice: addrToUint(log.args.from),
          usd: log.args.amt ?? 0n,
          addr: log.args.from,
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
          amt: bigint,
        }
      }

      let distributeUsdLogs = rawLogs?.map(log => decodeArbiscanLog(log, abiStr) as TypeOfDistributeUsdLog);

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
          ethPrice: addrToUint(cashier),
          usd: log.args.amt ?? 0n,
          addr: AddrZero,
          acct: 0n,
        };
        
        arr.push(item);

        cnt++;
      }

      console.log('arr in usdOutflow:', arr);

      if (arr.length > 0) {
        
        arr = arr.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
        arr = arr.map((v, i) => ({...v, seq: i}));
        console.log('add arr into usdOutflow:', arr);

        await setFinData(gk, 'usdOutflow', arr, toBlkNum);
        
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

    if (boox && client) getUsdOutflow();

  },[gk, boox, client, setRecords]);

  return (
    <></>
  );

} 