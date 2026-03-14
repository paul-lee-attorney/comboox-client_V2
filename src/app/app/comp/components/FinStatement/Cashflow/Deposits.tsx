import { useEffect } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { usePublicClient } from "wagmi";
import { Cashflow, CashflowRecordsProps } from "../../FinStatement";
import { getFinData } from "../../../../../api/firebase/finInfoTools";


export type DepositsSum = {
  totalAmt: bigint;
  sumInUsd: bigint;
  consideration: bigint;
  considerationInUsd: bigint;
  balance: bigint;
  balanceInUsd: bigint;
  custody: bigint;
  custodyInUsd: bigint;
  distribution: bigint;
  distributionInUsd: bigint;
  pickup: bigint;
  pickupInUsd: bigint;
  flag: boolean;
}

export const defDepositsSum:DepositsSum = {
  totalAmt: 0n,
  sumInUsd: 0n,
  consideration: 0n,
  considerationInUsd: 0n,
  balance: 0n,
  balanceInUsd: 0n,
  custody: 0n,
  custodyInUsd: 0n,
  distribution: 0n,
  distributionInUsd: 0n,
  pickup: 0n,
  pickupInUsd: 0n,
  flag: false,
}

export const defDepositsSumArr:DepositsSum[] = [
  defDepositsSum, defDepositsSum, defDepositsSum, defDepositsSum
] 

export const sumArrayOfDeposits = (arr: Cashflow[]) => {

  let sum: DepositsSum = {...defDepositsSum};

  if (arr.length > 0) {
    arr.forEach(v => {
      switch (v.typeOfIncome) {
        case 'Pickup':
          sum.totalAmt -= v.amt;
          sum.sumInUsd -= v.usd;
          sum.pickup += v.amt;
          sum.pickupInUsd += v.usd;
          break;
        case 'DepositConsiderationOfSTDeal':
        case 'CloseBidAgainstOffer':
        case 'DepositConsiderationOfSwap': 
        case 'DepositConsiderOfRejectedDeal':
          sum.totalAmt += v.amt;
          sum.sumInUsd += v.usd;
          sum.consideration += v.amt;
          sum.considerationInUsd += v.usd;
          break;
        case 'DepositBalanceOfOTCDeal': 
        case 'DepositBalanceOfPayInCap':
        case 'DepositBalanceOfSwap':
        case 'DepositBalanceOfBidOrder':
        case 'DepositBalanceOfRejectedDeal':
          sum.totalAmt += v.amt;
          sum.sumInUsd += v.usd;
          sum.balance += v.amt;
          sum.balanceInUsd += v.usd;
          break;
        case 'CustodyValueOfBidOrder':
          sum.totalAmt += v.amt;
          sum.sumInUsd += v.usd;
          sum.custody += v.amt;
          sum.custodyInUsd += v.usd;
          v.acct = BigInt(v.acct / 2n**40n);
          break;
        case 'CloseOfferAgainstBid': 
          sum.custody -= v.amt;
          sum.custodyInUsd -= v.usd;
          sum.consideration += v.amt;
          sum.considerationInUsd += v.usd;
          break;
        case 'RefundValueOfBidOrder':
          sum.custody -= v.amt;
          sum.custodyInUsd -= v.usd;
          sum.balance += v.amt;
          sum.balanceInUsd += v.usd;
          break;
        case 'CloseInitOfferAgainstBid':
          sum.totalAmt -= v.amt;
          sum.sumInUsd -= v.usd;
          sum.custody -= v.amt;
          sum.custodyInUsd -= v.usd;
          break;
        case 'DistributeProfits':
          sum.totalAmt += v.amt;
          sum.sumInUsd += v.usd;
          sum.distribution += v.amt;
          sum.distributionInUsd += v.usd;
          break;
      }
    });
  }

  sum.flag = true;

  return sum;
}

export const updateDepositsSum = (arr: Cashflow[], startDate:number, endDate:number) => {
  
  let sum: DepositsSum[] = [...defDepositsSumArr];

  if (arr.length > 0 ) {
    sum[1] = sumArrayOfDeposits(arr.filter(v => v.timestamp < startDate));
    sum[2] = sumArrayOfDeposits(arr.filter(v => v.timestamp >= startDate && v.timestamp <= endDate));
    sum[3] = sumArrayOfDeposits(arr.filter(v => v.timestamp <= endDate));  
  }
  
  return sum;
}

export function Deposits({ setRecords}:CashflowRecordsProps ) {
  const { gk } = useComBooxContext();
  
  const client = usePublicClient();

  useEffect(()=>{

    const getDeposits = async ()=>{

      if (!gk) return;

      let logs = await getFinData(gk, 'deposits');

      if (logs && logs.length > 0) {
        logs = logs.map((v,i) => ({...v, seq:i}));
        setRecords(logs);
      }

    }

    getDeposits();

  }, [gk, client, setRecords]);

  return (
    <>
    </>
  );
} 