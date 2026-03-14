import { useEffect, } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { usePublicClient } from "wagmi";
import { Cashflow, CashflowRecordsProps, defaultCashflow } from "../../FinStatement";
import { getFinData } from "../../../../../api/firebase/finInfoTools";

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

  return sum;
}

export function FtEthflow({ setRecords }:CashflowRecordsProps ) {
  const { gk } = useComBooxContext();
  
  const client = usePublicClient();

  useEffect(()=>{

    const getFtCashflow = async ()=>{

      if ( !gk ) return;

      let logs = await getFinData(gk, 'ftEthflow');
            
      if (logs && logs.length > 0) {
        logs = logs.map((v,i) => ({...v, seq:i}));
        setRecords(logs);
      }

    }

    getFtCashflow();

  }, [gk, client, setRecords]);

  return (
  <>
  </>
  );
} 