import { useEffect } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { AddrZero, Bytes32Zero } from "../../../../common";
import { usePublicClient } from "wagmi";
import { ethers } from "ethers";
import { Cashflow, CashflowRecordsProps, defaultCashflow } from "../../FinStatement";
import { getFinData, setFinData } from "../../../../../api/firebase/finInfoTools";
import { EthPrice, getPriceAtTimestamp, retrieveMonthlyEthPriceByTimestamp } from "../../../../../api/firebase/ethPriceTools";
import { ArbiscanLog, decodeArbiscanLog, getNewLogs, getTopBlkOf, setTopBlkOf } from "../../../../../api/firebase/arbiScanLogsTool";
import { Hex } from "viem";

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

      let fromBlkNum = (await getTopBlkOf(gk, 'deposits')) + 1n;
      console.log('fromBlk of deposits: ', fromBlkNum);
      
      let arr: Cashflow[] = [];
      let ethPrices: EthPrice[] | undefined = [];

      const appendItem = (newItem: Cashflow, refPrices: EthPrice[]) => {
        if (newItem.amt > 0n) {

          let mark = getPriceAtTimestamp(newItem.timestamp * 1000, refPrices);
          newItem.ethPrice = 10n ** 25n / mark.centPrice;
          newItem.usd = newItem.amt * mark.centPrice / 10n ** 9n;
          
          arr.push(newItem);
        }
      } 

      let rawLogs = await getNewLogs(gk, 'GeneralKeeper', gk, 'PickupDeposit', fromBlkNum);

      let abiStr = 'event PickupDeposit(address indexed to, uint indexed caller, uint indexed amt)';

      type TypeOfPickupDepositLog = ArbiscanLog & {
        eventName: string, 
        args: {
          to: Hex,
          caller: bigint,
          amt: bigint
        }
      }

      let pickupLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfPickupDepositLog);
      console.log('pickupLogs: ', pickupLogs);

      let len = pickupLogs.length;
      let cnt = 0;

      while(cnt < len) {

        let log = pickupLogs[cnt];

        let item:Cashflow = {...defaultCashflow,
          seq:0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'Pickup',
          amt: log.args.amt ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: log.args.to ?? AddrZero,
          acct: log.args.caller ?? 0n,
        }
    
        if (ethPrices.length < 1 || 
          item.timestamp * 1000 < ethPrices[0].timestamp ||
          item.timestamp * 1000 > ethPrices[ethPrices.length - 1].timestamp  ) {
            ethPrices = await retrieveMonthlyEthPriceByTimestamp(item.timestamp);
            if (!ethPrices) return;
            else console.log('ethPrices: ', ethPrices);
        }

        appendItem(item, ethPrices);
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

      let depositLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfSaveToCofferLog);

      console.log('depositLogs: ', depositLogs);

      len = depositLogs.length;
      cnt = 0;

      while(cnt < len) {

        let log = depositLogs[cnt];

        let item:Cashflow = {...defaultCashflow,
          seq:0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: ethers.decodeBytes32String(log.args.reason ?? Bytes32Zero),
          amt: log.args.value ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: AddrZero,
          acct: log.args.acct ?? 0n,
        }

        if (ethPrices.length < 1 || 
          item.timestamp * 1000 < ethPrices[0].timestamp ||
          item.timestamp * 1000 > ethPrices[ethPrices.length - 1].timestamp  ) {
            ethPrices = await retrieveMonthlyEthPriceByTimestamp(item.timestamp);
            if (!ethPrices) return;
            else console.log('ethPrices: ', ethPrices);
        }
  
        appendItem(item, ethPrices);
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

      let custodyLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfReleaseCustodyLog);
      console.log('custodyLogs: ', custodyLogs);

      len = custodyLogs.length;
      cnt = 0;

      while(cnt < len) {

        let log = custodyLogs[cnt];
     
        let item:Cashflow = {...defaultCashflow,
          seq:0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: ethers.decodeBytes32String(log.args.reason ?? Bytes32Zero),
          amt: log.args.amt ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: AddrZero,
          acct: log.args.to ?? 0n,
        }

        if (ethPrices.length < 1 || 
          item.timestamp * 1000 < ethPrices[0].timestamp ||
          item.timestamp * 1000 > ethPrices[ethPrices.length - 1].timestamp  ) {
            ethPrices = await retrieveMonthlyEthPriceByTimestamp(item.timestamp);
            if (!ethPrices) return;
            else console.log('ethPrices: ', ethPrices);
        }

        appendItem(item, ethPrices);
        cnt++;
      }

      console.log('arr in deposits:', arr);

      if (arr.length > 0) {
        arr = arr.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
        arr = arr.map((v, i) => ({...v, seq:i}));
        console.log('arr added into Deposits:', arr);

        await setFinData(gk, 'deposits', arr);

        let toBlkNum = arr[arr.length - 1].blockNumber;
        await setTopBlkOf(gk, 'deposits', toBlkNum);
        console.log('updated topBlk Of deposits: ', toBlkNum);

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

    getDeposits();

  }, [gk, client, setRecords]);

  return (
    <>
    </>
  );
} 