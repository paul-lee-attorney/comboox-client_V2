import { useEffect } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { AddrOfRegCenter, AddrOfTank, AddrZero, Bytes32Zero, keepersMap } from "../../../../common";
import { usePublicClient } from "wagmi";
import { decodeFunctionData, Hex, } from "viem";
import { Cashflow, CashflowRecordsProps, defaultCashflow } from "../../FinStatement";
import { getFinData, getMonthLableByTimestamp, setFinData, updateRoyaltyByItem } from "../../../../../api/firebase/finInfoTools";
import { EthPrice, getPriceAtTimestamp, retrieveMonthlyEthPriceByTimestamp } from "../../../../../api/firebase/ethPriceTools";
import { generalKeeperABI, usdKeeperABI } from "../../../../../../../generated-v1";
import { ArbiscanLog, decodeArbiscanLog, getNewLogs, getTopBlkOf, setTopBlkOf } from "../../../../../api/firebase/arbiScanLogsTool";
import { ftHis } from "./FtCbpflow";
import { rate } from "../../../../fuel_tank/ft";

export type CbpInflowSum = {
  totalAmt: bigint;
  sumInUsd: bigint;
  royalty: bigint;
  royaltyInUsd: bigint;
  transfer: bigint;
  transferInUsd: bigint;
  mint:bigint;
  mintInUsd: bigint;
  flag: boolean;
}

export const defCbpInflowSum: CbpInflowSum = {
  totalAmt: 0n,
  sumInUsd: 0n,
  royalty: 0n,
  royaltyInUsd: 0n,
  transfer: 0n,
  transferInUsd: 0n,
  mint: 0n,
  mintInUsd: 0n,
  flag: false,
}

export const defCbpInflowSumArr: CbpInflowSum[] = [
  defCbpInflowSum, defCbpInflowSum, defCbpInflowSum, defCbpInflowSum
]

export const sumArrayOfCbpInflow = (arr: Cashflow[]) => {
  
  let sum: CbpInflowSum = {...defCbpInflowSum};

  if (arr.length > 0) {
    arr.forEach(v => {
      sum.totalAmt += v.amt;
      sum.sumInUsd += v.usd;
  
      switch (v.typeOfIncome) {
        case 'Royalty':
          sum.royalty += v.amt;
          sum.royaltyInUsd += v.usd;
          break;
        case 'Transfer': 
          sum.transfer += v.amt;
          sum.transferInUsd += v.usd;
          break;
        case 'Mint': 
          sum.mint += v.amt;
          sum.mintInUsd += v.usd;
          break;
      }
    }); 
  }

  sum.flag = true;

  return sum;
}

export const updateCbpInflowSum = (arr: Cashflow[], startDate:number, endDate:number ) => {
  
  let sum: CbpInflowSum[] = [...defCbpInflowSumArr];

  if (arr.length > 0 ) {
    sum[1] = sumArrayOfCbpInflow(arr.filter(v => v.timestamp < startDate));
    sum[2] = sumArrayOfCbpInflow(arr.filter(v => v.timestamp >= startDate && v.timestamp <= endDate));
    sum[3] = sumArrayOfCbpInflow(arr.filter(v => v.timestamp <= endDate));  
  }
  
  console.log('range:', startDate, endDate);
  console.log('cbpInflow:', sum);
  return sum;
}


export function CbpInflow({setRecords}:CashflowRecordsProps) {
  const { gk, keepers } = useComBooxContext();
  
  const client = usePublicClient();

  useEffect(()=>{

    const getCbpInflow = async () => {

      if (!gk || !keepers ) return;

      const cbpRate = await rate();

      const usdKeeper = keepers[keepersMap.UsdKeeper];

      const updateRoyaltyInfo = async (item:Cashflow) => {
        
        let tran = await client.getTransaction({hash: item.transactionHash});
                    
        if (tran.to?.toLowerCase() == gk.toLowerCase()) {

          item.input = tran.input;
          item.api = decodeFunctionData({
            abi: generalKeeperABI,
            data: tran.input,
          }).functionName;

        } else if (tran.to?.toLowerCase() == usdKeeper.toLowerCase()) {

          item.input = tran.input;
          item.api = decodeFunctionData({
            abi: usdKeeperABI,
            data: tran.input,
          }).functionName;

        }

        if (item.api) {
          const monthLab = getMonthLableByTimestamp(item.timestamp);  
          await updateRoyaltyByItem(gk, monthLab, item);
        }

      }

      let logs = await getFinData(gk, 'cbpInflow');
      console.log('obtained FinData of cbpInflow logs:', logs);
      
      let fromBlkNum = (await getTopBlkOf(gk, 'cbpInflow')) + 1n;

      console.log('fromBlk of CbpInflow: ', fromBlkNum);
      console.log('chain ID:', client.chain.id);

      if (logs && client.chain.id == 42161) {
        let len = logs.length; 
        for (let i=0; i<len; i++) {
            const v = logs[i];
            if (v.typeOfIncome == 'Royalty' && v.api == '') {
              await updateRoyaltyInfo(v);
            }
        }
      }

      let arr: Cashflow[] = [];
      let ethPrices: EthPrice[] | undefined = [];

      const appendItem = (newItem: Cashflow, refPrices: EthPrice[]) => {
        if (newItem.amt > 0n && refPrices.length > 0) {

          const mark = getPriceAtTimestamp(newItem.timestamp * 1000, refPrices);
          
          let fixRateBlk = client.chain.id == 42161
            ? 348998163n : 165090995n;

          console.log('fixRateBlk:', fixRateBlk);
          console.log('newItem.blockNumber:', newItem.blockNumber);

          if (newItem.blockNumber > fixRateBlk) {
            newItem.ethPrice = cbpRate * 10n ** 3n;
            newItem.usd = newItem.amt * newItem.ethPrice / 10n ** 9n;  

            console.log('cbpRate:', newItem.ethPrice);          

          } else {

            newItem.ethPrice = mark.centPrice;
            newItem.usd = newItem.amt * mark.centPrice / 10n ** 9n;

            console.log('ethPrice:', newItem.ethPrice);
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

      let transferLogs = rawLogs.map(log => decodeArbiscanLog(log, abiStr) as TypeOfTransferLog);

      transferLogs = transferLogs?.filter((v) => 
          v.args.to.toLowerCase() == gk.toLowerCase() &&
          v.args.from?.toLowerCase() != AddrOfTank.toLowerCase() &&
          v.args.from?.toLowerCase() != ftHis[0].toLowerCase() &&
          v.args.from?.toLowerCase() != ftHis[1].toLowerCase() &&
          v.args.from?.toLowerCase() != ftHis[2].toLowerCase());

      console.log('transferLogs: ', transferLogs);

      let len = transferLogs.length;
      let cnt = 0;

      while (cnt < len) {
        let log = transferLogs[cnt];

        let item:Cashflow = { ...defaultCashflow,
          seq: 0,
          blockNumber: BigInt(log.blockNumber),
          timestamp: Number(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          typeOfIncome: 'Royalty',
          amt: log.args.value ?? 0n,
          ethPrice: 0n,
          usd: 0n,
          addr: log.args.from ?? AddrZero,
          acct: 0n,
        }

        if (item.addr.toLowerCase() == AddrZero) {
          item.typeOfIncome = 'Mint';
        } else {
          let tran = await client.getTransaction({hash: item.transactionHash});
          
          if ( tran.to?.toLowerCase() == AddrOfRegCenter.toLowerCase() && 
                tran.input.substring(0,10).toLowerCase() == '0xa9059cbb') 
          {  
            item.typeOfIncome = 'Transfer';
          // } else if (client.chain.id == 42161){

          //   const rs = await getRoyaltySource(item.transactionHash);

          //   if (rs.api != "") {
          //     item.input = rs.input;
          //     item.api = rs.api;
          //     item.target = rs.target;
          //     item.typeOfDoc = rs.typeOfDoc;
          //     item.version = rs.version;
          //   }
            
          } else if (tran.to?.toLowerCase() == gk.toLowerCase()) {

            item.input = tran.input;
            item.api = decodeFunctionData({
              abi: generalKeeperABI,
              data: tran.input,
            }).functionName;
            // item.target = tran.from; 

          } else if (tran.to?.toLowerCase() == usdKeeper.toLowerCase()) {

            item.input = tran.input;
            item.api = decodeFunctionData({
              abi: usdKeeperABI,
              data: tran.input,
            }).functionName;

          }

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

      console.log('arr in cbpInflow:', arr);

      if (arr.length > 0) {
        
        arr = arr.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
        arr = arr.map((v, i) => ({...v, seq: i}));
        console.log('sorted arr added into FinData cbpInflow:', arr);

        await setFinData(gk, 'cbpInflow', arr);

        let toBlkNum = arr[arr.length - 1].blockNumber;
        await setTopBlkOf(gk, 'cbpInflow', toBlkNum);
        console.log('updated topBlk Of cbpInflow: ', toBlkNum);        
        
        if (logs) {
          logs = logs.concat(arr);
        } else {
          logs = arr;
        }
      } 
      
      if (logs && logs.length > 0) {
        logs = logs.map((v,i) => ({...v, seq:i}));
        setRecords(logs);
        console.log('set records of cbpInflow:', logs);
      }
      
    }

    if (gk && client) getCbpInflow();

  },[client, gk, keepers, setRecords]);
  // });

  return (
    <></>
  );

} 