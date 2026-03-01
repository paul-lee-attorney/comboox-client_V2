
import { Paper, Stack, Typography, Divider, Button, Switch, Tooltip } from "@mui/material";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { rate } from "../../fuel_tank/ft";
import { baseToDollar, bigIntToNum, bigIntToStrNum, dateParser, longDataParser, stampToUtc, utcToStamp } from "../../common/toolsKit";
import { CbpInflow, CbpInflowSum, defCbpInflowSumArr, updateCbpInflowSum, } from "./FinStatement/Cashflow/CbpInflow";
import { defEthInflowSumArr, EthInflow, EthInflowSum, updateEthInflowSum } from "./FinStatement/Cashflow/EthInflow";
import { CbpOutflow, CbpOutflowSum, defCbpOutflowSumArr, updateCbpOutflowSum } from "./FinStatement/Cashflow/CbpOutflow";
import { defEthOutflowSumArr, EthOutflow, EthOutflowSum, updateEthOutflowSum } from "./FinStatement/Cashflow/EthOutflow";
import { AddrZero, Bytes32Zero, HexType } from "../../common";
import { CashFlowList, SumInfo } from "./FinStatement/CashflowList";
import { defDepositsSumArr, Deposits, DepositsSum, updateDepositsSum } from "./FinStatement/Cashflow/Deposits";
import { defFtEthflowSumArr, FtEthflow, FtEthflowSum, updateFtEthflowSum, } from "./FinStatement/Cashflow/FtEthflow";
import { defFtCbpflowSumArr, FtCbpflow, FtCbpflowSum, updateFtCbpflowSum } from "./FinStatement/Cashflow/FtCbpflow";
import { BtnProps, SGNA } from "./FinStatement/SGNA";
import { EthPrice, getPriceAtTimestamp, retrieveEthPriceByTimestamp, retrieveMonthlyEthPriceByTimestamp, updateMonthlyEthPrices } from "../../../api/firebase/ethPriceTools";
import { DateTimeField } from "@mui/x-date-pickers";
import { Assets } from "./FinStatement/Assets";
import { LiabilyAndEquity,  } from "./FinStatement/LiabilityAndEquity";
import { getOpExchangeGainLoss, IncomeStatement } from "./FinStatement/IncomeStatement";
import { EquityChangeStatement } from "./FinStatement/EquityChangeStatement";
import { CryptoInventory } from "./FinStatement/CryptoInventory";
import { CryptosFlowStatement } from "./FinStatement/CryptosFlowStatement";
import { TipsAndUpdates, Update } from "@mui/icons-material";
import { usePublicClient } from "wagmi";
import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { RoyaltySource } from "../../../api/getRoyaltySource";
import { defUsdInflowSumArr, updateUsdInflowSum, UsdInflow, UsdInflowSum } from "./FinStatement/Cashflow/UsdInflow";
import { defUsdOutflowSumArr, updateUsdOutflowSum, UsdOutflow, UsdOutflowSum } from "./FinStatement/Cashflow/UsdOutflow";
import { defUsdEscrowSumArr, updateUsdEscrowSum, UsdEscrow, UsdEscrowSum } from "./FinStatement/Cashflow/UsdEscrow";

export interface Cashflow extends RoyaltySource {
  seq: number,
  blockNumber: bigint,
  timestamp: number,
  transactionHash: HexType,
  typeOfIncome: string,
  amt: bigint,
  usd: bigint,
  ethPrice: bigint,
  addr: HexType,
  acct: bigint,
}

export const defaultCashflow: Cashflow = {
  seq: 0,
  blockNumber: 0n,
  timestamp: 0,
  transactionHash: Bytes32Zero,
  typeOfIncome: '',
  amt: 0n,
  usd: 0n,
  ethPrice: 0n,
  addr: AddrZero,
  acct: 0n,
  input: Bytes32Zero,
  api: '',
  target: AddrZero,
  typeOfDoc: 0,
  version: 0,
}


export interface ReportItem {
  inEth: bigint,
  inUsd: bigint,
}

export const defReportItem: ReportItem = {
  inEth: 0n,
  inUsd: 0n,
}

export interface CashflowRange {
  head: number,
  tail: number,
  len: number,
}

export const defCashflowRange = {
  head: 0,
  tail: 0,
  len: 0,
}

export interface CashflowRecordsProps {
  setRecords: Dispatch<SetStateAction<Cashflow[]>>;
}

export interface BtnCompProps {
  inETH: boolean,
  exRate: bigint,
  display: ()=>void,
}

export const showUSD = (usd:bigint) => {
  return baseToDollar((usd / 10n ** 14n).toString()) + ' USD';
}

export const weiToEth9Dec = (eth:bigint) => {
  return bigIntToNum(eth / 10n**9n, 9) + ' ETH';
}

export const baseToDust = (usd:bigint) => {
  return usd * 10n ** 14n;
}

export const microToDust = (usd:bigint) => {
  return usd * 10n ** 12n;
}

export interface StatementProps {
  inETH: boolean,
  startDate: number,
  endDate: number,
  opnBlkNo: bigint,
  rptBlkNo: bigint,
  centPrice: bigint,
  display: ((type:number)=>void)[],
}

export function trimCashflow(arr: Cashflow[], startDate:number, endDate:number, type: number): Cashflow[] {
  let output: Cashflow[] = [];

    switch (type) {
      case 1: 
        output = arr.filter(v => v.timestamp < startDate);
        break;
      case 2:
        output = arr.filter(v => v.timestamp >= startDate && v.timestamp <= endDate);
        break;
      case 3:
        output = arr.filter(v => v.timestamp <= endDate);
        break;
    }  

  return output;
}

export function FinStatement() {

  const [ cbpInflow, setCbpInflow ] = useState<CbpInflowSum[]>(defCbpInflowSumArr);
  const [ cbpInflowRecords, setCbpInflowRecords ] = useState<Cashflow[]>([]);

  const [ cbpOutflow, setCbpOutflow ] = useState<CbpOutflowSum[]>(defCbpOutflowSumArr);
  const [ cbpOutflowRecords, setCbpOutflowRecords ] = useState<Cashflow[]>([]);

  const [ ethInflow, setEthInflow ] = useState<EthInflowSum[]>(defEthInflowSumArr);
  const [ ethInflowRecords, setEthInflowRecords ] = useState<Cashflow[]>([]);

  const [ ethOutflow, setEthOutflow ] = useState<EthOutflowSum[]>(defEthOutflowSumArr);
  const [ ethOutflowRecords, setEthOutflowRecords ] = useState<Cashflow[]>([]);

  const [ usdInflow, setUsdInflow ] = useState<UsdInflowSum[]>(defUsdInflowSumArr);
  const [ usdInflowRecords, setUsdInflowRecords ] = useState<Cashflow[]>([]);

  const [ usdOutflow, setUsdOutflow ] = useState<UsdOutflowSum[]>(defUsdOutflowSumArr);
  const [ usdOutflowRecords, setUsdOutflowRecords ] = useState<Cashflow[]>([]);

  const [ deposits, setDeposits ] = useState<DepositsSum[]>(defDepositsSumArr);
  const [ depositsRecords, setDepositsRecords ] = useState<Cashflow[]>([]);

  const [ usdEscrow, setUsdEscrow ] = useState<UsdEscrowSum[]>(defUsdEscrowSumArr);
  const [ usdEscrowRecords, setUsdEscrowRecords ] = useState<Cashflow[]>([]);

  const [ ftEthflow, setFtEthflow ] = useState<FtEthflowSum[]>(defFtEthflowSumArr);
  const [ ftEthflowRecords, setFtEthflowRecords] = useState<Cashflow[]>([]);

  const [ ftCbpflow, setFtCbpflow ] = useState<FtCbpflowSum[]>(defFtCbpflowSumArr);
  const [ ftCbpflowRecords, setFtCbpflowRecords] = useState<Cashflow[]>([]);

  const [ flags, setFlags ] = useState<boolean[]>([false, false, false, false, false, false, false, false, false, false]);

  const tips = [
    'cbpIn', 'cbpOut', 'ethIn', 'ethOut',
    'usdIn', 'usdOut', 'ethDep', 'usdEsc',
    'ftCbp', 'ftEth'
  ]

  useEffect(()=>{
    let len:boolean[] = [false, false, false, false, false, false, false, false, false, false,];
    len[0] = cbpInflowRecords.length > 0;
    len[1] = cbpOutflowRecords.length > 0;
    len[2] = ethInflowRecords.length > 0;
    len[3] = ethOutflowRecords.length > 0;
    len[4] = usdInflowRecords.length > 0;
    len[5] = usdOutflowRecords.length > 0;
    len[6] = depositsRecords.length > 0;
    len[7] = usdEscrowRecords.length > 0;
    len[8] = ftCbpflowRecords.length > 0;
    len[9] = ftEthflowRecords.length > 0;

    setFlags(len);

  }, [cbpInflowRecords, cbpOutflowRecords, ethInflowRecords, ethOutflowRecords, usdInflowRecords, usdOutflowRecords, depositsRecords, usdEscrowRecords, ftCbpflowRecords, ftEthflowRecords]);

  const [ inETH, setInETH ] = useState(false);

  const [ startDate, setStartDate ] = useState(Math.floor((new Date('2024-05-18T00:00:00Z')).getTime()/1000));
  const [ endDate, setEndDate] = useState(Math.floor((new Date()).getTime()/1000));

  const [ centPrice, setCentPrice ] = useState(1n);
  const [ ethRateDate, setEthRateDate ] = useState('0');

  const [ rptBlkNo, setRptBlkNo ] = useState(0n);
  const [ opnBlkNo, setOpnBlkNo ] = useState(0n);

  const client = usePublicClient();

  const { compInfo } = useComBooxContext();

  const updateCashflowRange = () => {

    if (endDate < startDate) return;
    if (!compInfo?.regDate) return;

    setCbpInflow([...updateCbpInflowSum(cbpInflowRecords, startDate, endDate)]);
    setCbpOutflow([...updateCbpOutflowSum(cbpOutflowRecords, startDate, endDate)]);
    setEthInflow([...updateEthInflowSum(ethInflowRecords, startDate, endDate)]);
    setEthOutflow([...updateEthOutflowSum(ethOutflowRecords, startDate, endDate)]);
    setUsdInflow([...updateUsdInflowSum(usdInflowRecords, startDate, endDate)]);
    setUsdOutflow([...updateUsdOutflowSum(usdOutflowRecords, startDate, endDate)]);
    setDeposits([...updateDepositsSum(depositsRecords, startDate, endDate)]);
    setUsdEscrow([...updateUsdEscrowSum(usdEscrowRecords, startDate, endDate)]);
    setFtCbpflow([...updateFtCbpflowSum(ftCbpflowRecords, startDate, endDate)]);
    setFtEthflow([...updateFtEthflowSum(ftEthflowRecords, startDate, endDate)]);

    const findBlocknumberByTimestamp = async (targetTimestamp: bigint) => {

      const latestBlock = await client.getBlock();
      let high = latestBlock.number;
      let low = 0n;
      let output = high;
    
      while (low <= high) {
        const mid = (low + high) / 2n;
        const block = await client.getBlock({ blockNumber: mid });
    
        if (!block) break; // Block may not be found
        const blockTimestamp = block.timestamp;
    
        if (blockTimestamp < targetTimestamp) {
          low = mid + 1n;
        } else if (blockTimestamp > targetTimestamp) {
          high = mid - 1n;
        } else {
          output = block.number; // Exact match
          break;
        }
    
        output = block.number;
      }
    
      return output;
    }
  
    findBlocknumberByTimestamp(BigInt(endDate > compInfo.regDate ? endDate : compInfo.regDate )).then(
      blkNo => {
        setRptBlkNo(blkNo);
        console.log('endDate: ', endDate, 'rptBlkNo: ', blkNo);
      }
    );

    findBlocknumberByTimestamp(BigInt(startDate > compInfo.regDate ? startDate : compInfo.regDate)).then(
      blkNo => {
        setOpnBlkNo(blkNo);
        console.log('startDate: ', startDate, 'opnBlkNo: ', blkNo);
      }
    );

  }

  const [ exRate, setExRate ] = useState(2816150000n);

  useEffect(()=>{
    const getRate = async ()=> {
      let rateOfEx = await rate();

      let fixRateBlk = client.chain.id == 42161
        ? 348998163n : 165090995n;

      if (rptBlkNo > fixRateBlk) {
        setExRate(rateOfEx);
      } else {
        setExRate(10n ** 22n / centPrice);
      }

    }
    getRate();
  }, [rptBlkNo, centPrice, client.chain.id, endDate]);

  useEffect(()=>{

    let ethPrices: EthPrice[] | undefined = [];

    const updateCentPrice = async ()=> {
      await updateMonthlyEthPrices();

      if (!ethPrices || ethPrices.length < 1 || 
        endDate * 1000 < ethPrices[0].timestamp ||
        endDate * 1000 > ethPrices[ethPrices.length - 1].timestamp  ) {
          ethPrices = await retrieveMonthlyEthPriceByTimestamp(endDate);
          if (!ethPrices) return;
      }

      let mark = getPriceAtTimestamp(endDate * 1000, ethPrices);
      if (!mark) return;
  
      setCentPrice(mark.centPrice);
      setEthRateDate((mark.timestamp / 1000).toString());
    }

    updateCentPrice();
    
  }, [endDate]);

  // ==== Calculation ====

  const weiToDust = (eth:bigint) => {
    return eth * 10n ** 16n / centPrice;
  }

  const leeToDust = (cbp:bigint) => {
    return cbp * exRate / 10n ** 6n;
  }

  const microToWei = (usd:bigint) => {
    return usd * centPrice / 10000n;
  }

  const leeToWei = (cbp:bigint) => {
    return cbp * exRate * centPrice / 10n ** 22n;
  }
   
  // ==== Breakdown Display ====

  const [ items, setItems ] = useState<BtnProps[]>([]);
  const [ showSGNA, setShowSGNA ] = useState(false);

  const [ list, setList ] = useState<Cashflow[]>([]);
  const [ open, setOpen ] = useState(false);
  const [ sumInfo, setSumInfo ] = useState<SumInfo[]>([]);

  const showUsdGasIncomeRecords = (type:number) => {
    let records = trimCashflow(usdInflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'GasIncome');

    let curSumInUsd = microToDust(usdInflow[type].gas);

    let arrSumInfo = inETH 
        ? [ {title: 'Gas Income - (ETH ', data: microToWei(usdInflow[type].gas)}]
        : [ {title: 'Gas Income - (USD ', data: curSumInUsd}];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showGasIncomeRecords = (type:number) => {
    let records = trimCashflow(ethInflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'GasIncome');

    let curSumInUsd = weiToDust(ethInflow[type].gas);

    let arrSumInfo = inETH 
        ? [ {title: 'Gas Income - (ETH ', data: ethInflow[type].gas}]
        : [ 
            {title: 'Gas Income - (USD ', data: curSumInUsd},
            {title: 'Original Income', data: ethInflow[type].gasInUsd},
            {title: 'Exchange Gain/Loss', data: curSumInUsd - ethInflow[type].gasInUsd},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);

  }

  const showPaidInCapRecords = (type:number) => {

    let records = trimCashflow(ethInflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'PayInCap');
    
    let arrSumInfo = inETH 
        ? [ {title: 'Paid In Cap - (ETH ', data: ethInflow[type].capital} ]
        : [ {title: 'Paid In Cap - (USD ', data: weiToDust(ethInflow[type].capital)},
            {title: 'Original Paid-In-Cap', data: ethInflow[type].capitalInUsd},
            {title: 'Exchange Gain/Loss', data: weiToDust(ethInflow[type].capital) - ethInflow[type].capitalInUsd},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showUsdPaidInCapRecords = (type:number) => {

    let records = trimCashflow(usdInflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'PayInCap');
    
    let arrSumInfo = inETH 
        ? [ {title: 'Paid In Cap - (ETH ', data: microToWei(usdInflow[type].capital)} ]
        : [ 
            {title: 'Paid In Cap - (USD ', data: microToDust(usdInflow[type].capital)},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showPaidInPremiumRecords = (type:number) => {

    let records = trimCashflow(ethInflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'PayInPremium');

    let arrSumInfo = inETH 
        ? [ {title: 'Paid In Premium - (ETH ', data: ethInflow[type].premium} ]
        : [ 
            {title: 'Paid In Premium - (USD ', data: weiToDust(ethInflow[type].premium) },
            {title: 'Original Paid-In-Premium', data: ethInflow[type].premiumInUsd },
            {title: 'Exchange Gain/Loss', data: weiToDust(ethInflow[type].premium) - ethInflow[type].premiumInUsd},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showUsdPaidInPremiumRecords = (type:number) => {

    let records = trimCashflow(usdInflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'PayInPremium');
    
    let arrSumInfo = inETH 
        ? [ {title: 'Paid In Premium - (ETH ', data: microToWei(usdInflow[type].premium)} ]
        : [ {title: 'Paid In Premium - (USD ', data: microToDust(usdInflow[type].premium)},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showUsdReimburseExpRecords = (type:number) => {

    let records = trimCashflow(usdOutflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'ReimburseExp');
    
    let arrSumInfo = inETH 
        ? [ {title: 'Reimburse Exp - (ETH ', data: microToWei(usdOutflow[type].reimburseExp)} ]
        : [ {title: 'Reimburse Exp - (USD ', data: microToDust(usdOutflow[type].reimburseExp)},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showUsdAdvanceExpRecords = (type:number) => {

    let records = trimCashflow(usdOutflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'AdvanceExp');
    
    let arrSumInfo = inETH 
        ? [ {title: 'Advance Exp - (ETH ', data: microToWei(usdOutflow[type].advanceExp)} ]
        : [ {title: 'Advance Exp - (USD ', data: microToDust(usdOutflow[type].advanceExp)},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showUsdDistributionRecords = (type:number) => {

    let records = trimCashflow(usdOutflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'DistributedUsd');
    
    let arrSumInfo = inETH 
        ? [ {title: 'Distributed USDC - (ETH ', data: microToWei(usdOutflow[type].distributeUsd)} ]
        : [ {title: 'Distributed USDC - (USD ', data: microToDust(usdOutflow[type].distributeUsd)},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showEthTransferIncomeRecords = (type: number) => {

    let records = trimCashflow(ethInflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'TransferIncome');
    let curSumInUsd = weiToDust(ethInflow[type].transfer);

    let arrSumInfo = inETH 
        ? [ {title: 'ETH Transfer - (ETH ', data: ethInflow[type].transfer} ]
        : [ 
            {title: 'ETH Transfer - (USD ', data: curSumInUsd},
            {title: 'Original ETH Transfer', data: ethInflow[type].transferInUsd},
            {title: 'Exchange Gain/Loss', data: curSumInUsd - ethInflow[type].transferInUsd},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showEthGmmPaymentRecords = (type:number) => {

    let records = trimCashflow(ethOutflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'GmmTransfer' ||
        v.typeOfIncome == 'GmmExpense');

    let curSumInUsd = weiToDust(ethOutflow[type].gmmTransfer + ethOutflow[type].gmmExpense);

    let arrSumInfo = inETH 
        ? [ {title: 'Gmm Payment - (ETH ', data: ethOutflow[type].gmmTransfer + ethOutflow[type].gmmExpense},
            {title: 'Gmm Transfer', data: ethOutflow[type].gmmTransfer},
            {title: 'Gmm Expense', data: ethOutflow[type].gmmExpense},
          ]
        : [ 
            {title: 'Gmm Payment - (USD ', data: curSumInUsd},
            {title: 'Original Gmm Payment', data: ethOutflow[type].gmmTransferInUsd + ethOutflow[type].gmmExpenseInUsd},
            {title: 'Exchange Gain/Loss', data: curSumInUsd - (ethOutflow[type].gmmTransferInUsd + ethOutflow[type].gmmExpenseInUsd)},
            {title: 'Gmm Transfer', data: ethOutflow[type].gmmTransferInUsd},
            {title: 'Gmm Expense', data: ethOutflow[type].gmmExpenseInUsd},
          ];

      setList(records);
      setSumInfo(arrSumInfo);
      setOpen(true);
  }

  const showEthBmmPaymentRecords = (type:number) => {

    let records = trimCashflow(ethOutflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'BmmTransfer' ||
        v.typeOfIncome == 'BmmExpense');

    let curSumInUsd = weiToDust(ethOutflow[type].bmmTransfer + ethOutflow[type].bmmExpense);

    let arrSumInfo = inETH 
        ? [ {title: 'Bmm Payment - (ETH ', data: ethOutflow[type].bmmTransfer + ethOutflow[type].bmmExpense},
            {title: 'Bmm Transfer', data: ethOutflow[type].bmmTransfer},
            {title: 'Bmm Expense', data: ethOutflow[type].bmmExpense},
          ]
        : [ 
            {title: 'Bmm Payment - (USD ', data: curSumInUsd},
            {title: 'Original Bmm Payment', data: ethOutflow[type].bmmTransferInUsd + ethOutflow[type].bmmExpenseInUsd},              
            {title: 'Exchange Gain/Loss', data: curSumInUsd - (ethOutflow[type].bmmTransferInUsd + ethOutflow[type].bmmExpenseInUsd)},
            {title: 'Bmm Transfer', data: ethOutflow[type].bmmTransferInUsd},
            {title: 'Bmm Expense', data: ethOutflow[type].bmmExpenseInUsd},
          ];

      setList(records);
      setSumInfo(arrSumInfo);
      setOpen(true);
  }

  const showDistributionRecords = (type:number) => {
    let records = trimCashflow(ethOutflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'Distribution');

    let curSumInUsd = weiToDust(ethOutflow[type].distribution);

    let arrSumInfo = inETH 
        ? [ {title: 'Distribution - (ETH ', data: ethOutflow[type].distribution} ]
        : [
            {title: 'Distribution - (USD ', data: curSumInUsd},
            {title: 'Original Distribution', data: ethOutflow[type].distributionInUsd},
            {title: 'Exchange Gain/Loss', data: curSumInUsd - ethOutflow[type].distributionInUsd},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const displayEthOfComp = (type:number) => {
    let items:BtnProps[] = [
      {simbol: ' ', title: 'ETH of Comp', amt: ethInflow[type].totalAmt - ethOutflow[type].totalAmt, amtInUsd: weiToDust(ethInflow[type].totalAmt - ethOutflow[type].totalAmt), show: ()=>{}},
      {simbol: '+', title: 'Gas Income (ETH)', amt: ethInflow[type].gas, amtInUsd: weiToDust(ethInflow[type].gas), show: ()=>showGasIncomeRecords(type)},
      {simbol: '+', title: 'Paid In Cap', amt: ethInflow[type].capital, amtInUsd: weiToDust(ethInflow[type].capital), show: ()=>showPaidInCapRecords(type)},
      {simbol: '+', title: 'Paid In Premium', amt: ethInflow[type].premium, amtInUsd: weiToDust(ethInflow[type].premiumInUsd), show: ()=>showPaidInPremiumRecords(type)},
      {simbol: '+', title: 'Transfer Income', amt: ethInflow[type].transfer, amtInUsd: weiToDust(ethInflow[type].transfer), show: ()=>showEthTransferIncomeRecords(type)},
      {simbol: '-', title: 'Gmm Payment', amt: ethOutflow[type].gmmTransfer + ethOutflow[type].gmmExpense, amtInUsd: weiToDust(ethOutflow[type].gmmExpense + ethOutflow[type].gmmTransfer), show: ()=>showEthGmmPaymentRecords(type)},
      {simbol: '-', title: 'Bmm Payment', amt: ethOutflow[type].bmmTransfer + ethOutflow[type].bmmExpense, amtInUsd: weiToDust(ethOutflow[type].bmmExpense + ethOutflow[type].bmmTransfer), show: ()=>showEthBmmPaymentRecords(type)},
      {simbol: '-', title: 'Distribution', amt: ethOutflow[type].distribution, amtInUsd: weiToDust(ethOutflow[type].distribution), show: ()=>showDistributionRecords(type)},
    ];

    setItems(items);
    setShowSGNA(true);
  }

  const displayUsdOfComp = (type:number) => {
    let items:BtnProps[] = [
      {simbol: ' ', title: 'USDC of Comp', amt: microToWei(usdInflow[type].totalAmt - usdOutflow[type].totalAmt), amtInUsd: microToDust(usdInflow[type].totalAmt - usdOutflow[type].totalAmt), show: ()=>{}},
      {simbol: '+', title: 'Gas Income', amt: microToWei(usdInflow[type].gas), amtInUsd: microToDust(usdInflow[type].gas), show: ()=>showUsdGasIncomeRecords(type)},
      {simbol: '+', title: 'Paid In Cap', amt: microToWei(usdInflow[type].capital), amtInUsd: microToDust(usdInflow[type].capital), show: ()=>showUsdPaidInCapRecords(type)},
      {simbol: '+', title: 'Paid In Premium', amt: microToWei(usdInflow[type].premium), amtInUsd: microToDust(usdInflow[type].premium), show: ()=>showUsdPaidInPremiumRecords(type)},
      {simbol: '-', title: 'Reimburse Exp', amt: microToWei(usdOutflow[type].reimburseExp), amtInUsd: microToDust(usdOutflow[type].reimburseExp), show: ()=>showUsdReimburseExpRecords(type)},
      {simbol: '-', title: 'Advance Exp', amt: microToWei(usdOutflow[type].advanceExp), amtInUsd: microToDust(usdOutflow[type].advanceExp), show: ()=>showUsdAdvanceExpRecords(type)},
      {simbol: '-', title: 'Distribution', amt: microToWei(usdOutflow[type].distributeUsd), amtInUsd: microToDust(usdOutflow[type].distributeUsd), show: ()=>showUsdDistributionRecords(type)},
    ];

    setItems(items);
    setShowSGNA(true);
  }

  // ==== Liabilities ====

  const showFuelSoldRecords = (type:number) => {
    let records = trimCashflow(cbpOutflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'FuelSold');

    let curSumInUsd = leeToDust(cbpOutflow[type].fuelSold);

    let arrSumInfo = inETH 
        ? [ {title: 'Fuel Sold - (ETH ', data: leeToWei(cbpOutflow[type].fuelSold)} ]
        : [ 
            {title: 'Fuel Sold - (USD ', data: curSumInUsd},
            {title: 'Original Fuel Sold', data: cbpOutflow[type].fuelSoldInUsd},
            {title: 'Exchange Gain/Loss', data: curSumInUsd - cbpOutflow[type].fuelSoldInUsd},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showGmmCbpPaymentRecords = (type:number) => {
    let records = trimCashflow(cbpOutflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'GmmTransfer');

    let curSumInUsd = leeToDust(cbpOutflow[type].gmmTransfer);

    let arrSumInfo = inETH 
        ? [ {title: 'Gmm CBP Payment - (ETH ', data: leeToWei(cbpOutflow[type].gmmTransfer)} ]
        : [ 
            {title: 'Gmm CBP Payment - (USD ', data: curSumInUsd},
            {title: 'Original Gmm CBP Payment', data: cbpOutflow[type].gmmTransferInUsd},
            {title: 'Exchange Gain/Loss', data: curSumInUsd - cbpOutflow[type].gmmTransferInUsd},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showBmmCbpPaymentRecords = (type:number) => {
    let records = trimCashflow(cbpOutflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'BmmTransfer');

    let curSumInUsd = leeToDust(cbpOutflow[type].bmmTransfer);

    let arrSumInfo = inETH 
        ? [ {title: 'Bmm CBP Payment - (ETH ', data: leeToWei(cbpOutflow[type].bmmTransfer)} ]
        : [ 
            {title: 'Bmm CBP Payment - (USD ', data: curSumInUsd},          
            {title: 'Original Bmm CBP Payment', data: cbpOutflow[type].bmmTransferInUsd},
            {title: 'Exchange Gain/Loss', data: curSumInUsd - cbpOutflow[type].bmmTransferInUsd},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const displayDeferredRevenue = (type:number) => {

    let deferredRevenue = leeToWei(cbpOutflow[type].totalAmt - cbpInflow[type].totalAmt + cbpInflow[type].mint);
    let deferredRevenueInUsd = weiToDust(deferredRevenue);

    let items:BtnProps[] = [
      {simbol: ' ', title: 'Deferred Revenue', amt: deferredRevenue, amtInUsd: deferredRevenueInUsd, show: ()=>{}},
      {simbol: '+', title: 'Fuel Sold', amt: leeToWei(cbpOutflow[type].fuelSold), amtInUsd: leeToDust(cbpOutflow[type].fuelSold), show: ()=>showFuelSoldRecords(type)},
      {simbol: '+', title: 'Gmm CBP Payment', amt: leeToWei(cbpOutflow[type].gmmTransfer), amtInUsd: weiToDust(leeToWei(cbpOutflow[type].gmmTransfer)), show: ()=>showGmmCbpPaymentRecords(type)},
      {simbol: '+', title: 'Bmm CBP Payment', amt: leeToWei(cbpOutflow[type].bmmTransfer), amtInUsd: weiToDust(leeToWei(cbpOutflow[type].bmmTransfer)), show: ()=>showBmmCbpPaymentRecords(type)},
      {simbol: '+', title: 'New User Awards', amt: leeToWei(cbpOutflow[type].newUserAward), amtInUsd: weiToDust(leeToWei(cbpOutflow[type].newUserAward)), show: ()=>showNewUserAwardRecords(type)},
      {simbol: '+', title: 'Startup Cost', amt: leeToWei(cbpOutflow[type].startupCost), amtInUsd: weiToDust(leeToWei(cbpOutflow[type].startupCost)), show: ()=>showStartupCostRecords(type)},
      {simbol: '-', title: 'Royalty Income', amt: leeToWei(cbpInflow[type].royalty), amtInUsd: weiToDust(leeToWei(cbpInflow[type].royalty)), show: ()=>showRoyaltyRecords(type)},
    ];

    setItems(items);
    setShowSGNA(true);
  }

  // ==== Owners Equity ====

  const displayPaidInCap = (type:number) => {

    let paidInCap = ethInflow[type].capital + microToWei(usdInflow[type].capital);
    let paidInCapUsd = ethInflow[type].capitalInUsd + microToDust(usdInflow[type].capital);

    let items:BtnProps[] = [
      {simbol: ' ', title: 'Paid In Cap', amt: paidInCap, amtInUsd: paidInCapUsd, show: ()=>{}},
      {simbol: '+', title: 'Paid Cap In ETH', amt: ethInflow[type].capital, amtInUsd: ethInflow[type].capitalInUsd, show: ()=>showPaidInCapRecords(type)},
      {simbol: '+', title: 'Paid Cap In USDC', amt: microToWei(usdInflow[type].capital), amtInUsd: microToDust(usdInflow[type].capital), show: ()=>showUsdPaidInCapRecords(type)},
    ];

    setItems(items);
    setShowSGNA(true);
  }

  const displayPaidInPremium = (type:number) => {

    let paidInCap = ethInflow[type].premium + microToWei(usdInflow[type].premium);
    let paidInCapUsd = ethInflow[type].premiumInUsd + microToDust(usdInflow[type].premium);

    let items:BtnProps[] = [
      {simbol: ' ', title: 'Paid In Premium', amt: paidInCap, amtInUsd: paidInCapUsd, show: ()=>{}},
      {simbol: '+', title: 'Paid Premium In ETH', amt: ethInflow[type].premium, amtInUsd: ethInflow[type].premiumInUsd, show: ()=>showPaidInPremiumRecords(type)},
      {simbol: '+', title: 'Paid Premium In USDC', amt: microToWei(usdInflow[type].premium), amtInUsd: microToDust(usdInflow[type].premium), show: ()=>showUsdPaidInPremiumRecords(type)},
    ];

    setItems(items);
    setShowSGNA(true);
  }

  const displayShareIssuanceProceeds = (type:number) => {

    let proceeds = ethInflow[type].capital + ethInflow[type].premium + microToWei(usdInflow[type].capital + usdInflow[type].premium);
    let proceedsUsd = weiToDust(proceeds);

    let items:BtnProps[] = [
      {simbol: ' ', title: 'Share Issuance Proceeds', amt: proceeds, amtInUsd: proceedsUsd, show: ()=>{}},
      {simbol: '+', title: 'Paid Cap In ETH', amt: ethInflow[type].capital, amtInUsd: weiToDust(ethInflow[type].capital), show: ()=>showPaidInCapRecords(type)},      
      {simbol: '+', title: 'Paid Premium In ETH', amt: ethInflow[type].premium, amtInUsd: weiToDust(ethInflow[type].premium), show: ()=>showPaidInPremiumRecords(type)},
      {simbol: '+', title: 'Paid Cap In USDC', amt: microToWei(usdInflow[type].capital), amtInUsd: microToDust(usdInflow[type].capital), show: ()=>showUsdPaidInCapRecords(type)},
      {simbol: '+', title: 'Paid Premium In USDC', amt: microToWei(usdInflow[type].premium), amtInUsd: microToDust(usdInflow[type].premium), show: ()=>showUsdPaidInPremiumRecords(type)},
    ];

    setItems(items);
    setShowSGNA(true);
  }

  // ==== Income Statement ====

  const showRoyaltyRecords = (type:number) => {

    let records = trimCashflow(cbpInflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'Royalty');

    let arrSumInfo = inETH 
        ? [ {title: 'Royalty Income - (ETH ', data: leeToWei(cbpInflow[type].royalty)} ]
        : [ 
            {title: 'Royalty Income - (USD ', data: leeToDust(cbpInflow[type].royalty)},
            {title: 'Original Royalty Income', data: cbpInflow[type].royaltyInUsd},
            {title: 'Exchange Gain/Loss', data: leeToDust(cbpInflow[type].royalty) - cbpInflow[type].royaltyInUsd},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showOtherIncomeRecords = (type:number) => {

    let records = trimCashflow(ethInflowRecords, startDate, endDate, type);

    records = records.filter((v)=>v.typeOfIncome == 'TransferIncome');

    let curSumInUsd = weiToDust(ethInflow[type].transfer);

    let arrSumInfo = inETH
        ? [ {title: 'Other Income (ETH ', data: ethInflow[type].transfer} ]
        : [ 
            {title: 'Other Income - (USD ', data: curSumInUsd},
            {title: 'Original Other Income', data: ethInflow[type].transferInUsd},
            {title: 'Exchange Gain/Loss', data: curSumInUsd - ethInflow[type].transferInUsd},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showGmmEthPaymentRecords = (type:number) => {

    let records = trimCashflow(ethOutflowRecords, startDate, endDate, type);

    records = records.filter((v) => v.typeOfIncome == 'GmmTransfer' ||
        v.typeOfIncome == 'GmmExpense');

    records = records.sort((a, b)=>Number(a.timestamp - b.timestamp));

    let curSumInUsd = weiToDust(ethOutflow[type].gmmTransfer + ethOutflow[type].gmmExpense);

    let arrSumInfo = inETH
        ? [ {title: 'GMM Expense - (ETH ', data: (ethOutflow[type].gmmTransfer + ethOutflow[type].gmmExpense)},
            {title: 'ETH Transfer', data: ethOutflow[type].gmmTransfer},
            {title: 'ETH Action Expense', data: ethOutflow[type].gmmExpense}]
        : [ 
            {title: 'GMM Expense - (USD ', data: curSumInUsd },
            {title: 'Original GMM Expense', data: (ethOutflow[type].gmmTransferInUsd + ethOutflow[type].gmmExpenseInUsd)},
            {title: 'Exchange Gain/Loss', data: curSumInUsd - (ethOutflow[type].gmmTransferInUsd + ethOutflow[type].gmmExpenseInUsd) },
            {title: 'ETH Transfer', data: ethOutflow[type].gmmTransferInUsd},
            {title: 'ETH Action Expense', data: ethOutflow[type].gmmExpenseInUsd}
        ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  } 

  const showBmmEthPaymentRecords = (type:number) => {

    let records = trimCashflow(ethOutflowRecords, startDate, endDate, type);

    records = records.filter((v) => v.typeOfIncome == 'BmmTransfer' || v.typeOfIncome == 'BmmExpense');

    records = records.sort((a, b) => Number(a.timestamp - b.timestamp));

    let curSumInUsd = weiToDust(ethOutflow[type].bmmTransfer + ethOutflow[type].bmmExpense);

    let arrSumInfo = inETH
        ? [ {title: 'BMM Expense (ETH ', data: (ethOutflow[type].bmmTransfer + ethOutflow[type].bmmExpense)},
          {title: 'ETH Transfer', data: ethOutflow[type].bmmTransfer},
          {title: 'ETH Action Expense', data: ethOutflow[type].bmmExpense} ]
        : [
            {title: 'BMM Expense - (USD ', data: curSumInUsd},
            {title: 'Original BMM Expense', data: (ethOutflow[type].bmmTransferInUsd + ethOutflow[type].bmmExpenseInUsd)},
            {title: 'Exchange Gain/Loss', data: curSumInUsd - (ethOutflow[type].bmmTransferInUsd + ethOutflow[type].bmmExpenseInUsd)},
            {title: 'ETH Transfer', data: ethOutflow[type].bmmTransferInUsd},
            {title: 'ETH Action Expense', data: ethOutflow[type].bmmExpenseInUsd} 
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showNewUserAwardRecords = (type:number) => {

    let records = trimCashflow(cbpOutflowRecords, startDate, endDate, type);

    records = records.filter((v) => v.typeOfIncome == 'NewUserAward');

    let curSumInUsd = leeToDust(cbpOutflow[type].newUserAward);

    let arrSumInfo = inETH 
        ? [ {title: 'New User Award (ETH ', data: cbpOutflow[type].newUserAward * 10000n / exRate }]
        : [ 
            {title: 'New User Award (USD ', data: curSumInUsd}, 
            {title: 'Original New User Award', data:cbpOutflow[type].newUserAwardInUsd }, 
            {title: 'Exchange Gain/Loss', data: curSumInUsd - cbpOutflow[type].newUserAwardInUsd},
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);
  }

  const showStartupCostRecords = (type:number) => {
    let records = trimCashflow(cbpOutflowRecords, startDate, endDate, type);

    records = records.filter((v) => v.typeOfIncome == 'StartupCost');

    let curSumInUsd = leeToDust(cbpOutflow[type].startupCost);

    let arrSumInfo = inETH 
        ? [ {title: 'Startup Cost (ETH ', data: leeToWei(cbpOutflow[type].startupCost)}]
        : [
            {title: 'Startup Cost (USD ', data: curSumInUsd  },
            {title: 'Current Value of Startup Cost', data: cbpOutflow[type].startupCostInUsd },
            {title: 'Exchange Gain/Loss', data: curSumInUsd - cbpOutflow[type].startupCostInUsd },
          ];

    setList(records);
    setSumInfo(arrSumInfo);
    setOpen(true);

  }

  const displaySGNA = (type:number) => {

    let gmmCbpExp = leeToWei(cbpOutflow[type].gmmTransfer);
    let gmmEthExp = ethOutflow[type].gmmTransfer + ethOutflow[type].gmmExpense;
    let gmmCbpExpInUsd = leeToDust(cbpOutflow[type].gmmTransfer);
    let gmmEthExpInUsd = weiToDust(ethOutflow[type].gmmTransfer + ethOutflow[type].gmmExpense);

    let bmmCbpExp = leeToWei(cbpOutflow[type].bmmTransfer);
    let bmmEthExp = ethOutflow[type].bmmTransfer + ethOutflow[type].bmmExpense;
    let bmmCbpExpInUsd = leeToDust(cbpOutflow[type].bmmTransfer);
    let bmmEthExpInUsd = weiToDust(ethOutflow[type].bmmTransfer + ethOutflow[type].bmmExpense);

    let sgNa = gmmCbpExp + gmmEthExp + bmmCbpExp + bmmEthExp + leeToWei(cbpOutflow[type].newUserAward + cbpOutflow[type].startupCost) + microToWei(usdOutflow[type].reimburseExp + usdOutflow[type].advanceExp);

    let sgNaInUsd = gmmCbpExpInUsd + gmmEthExpInUsd + bmmCbpExpInUsd + bmmEthExpInUsd + leeToDust(cbpOutflow[type].newUserAward + cbpOutflow[type].startupCost) + microToDust(usdOutflow[type].reimburseExp + usdOutflow[type].advanceExp);

    let items:BtnProps[] = [
      {simbol: ' ', title: 'Sales, General & Administrative', amt: sgNa, amtInUsd: sgNaInUsd, show: ()=>{}},
      {simbol: '+', title: 'New User Awards', amt:leeToWei(cbpOutflow[type].newUserAward) , amtInUsd: leeToDust(cbpOutflow[type].newUserAward), show: ()=>showNewUserAwardRecords(type)},
      {simbol: '+', title: 'Startup Cost', amt:leeToWei(cbpOutflow[type].startupCost) , amtInUsd: leeToDust(cbpOutflow[type].startupCost), show: ()=>showStartupCostRecords(type)},
      {simbol: '+', title: 'GMM Approved Cbp Expense', amt:gmmCbpExp , amtInUsd: gmmCbpExpInUsd, show: ()=>showGmmCbpPaymentRecords(type)},
      {simbol: '+', title: 'GMM Approved Eth Expense', amt:gmmEthExp , amtInUsd: gmmEthExpInUsd, show: ()=>showGmmEthPaymentRecords(type)},
      {simbol: '+', title: 'BMM Approved Cbp Expense', amt:bmmCbpExp , amtInUsd: bmmCbpExpInUsd, show: ()=>showBmmCbpPaymentRecords(type)},
      {simbol: '+', title: 'BMM Approved Eth Expense', amt:bmmEthExp , amtInUsd: bmmEthExpInUsd, show: ()=>showBmmEthPaymentRecords(type)},
      {simbol: '+', title: 'Reimbursed USDC Expense', amt:microToWei(usdOutflow[type].reimburseExp) , amtInUsd: microToDust(usdOutflow[type].reimburseExp), show: ()=>showUsdReimburseExpRecords(type)},
      {simbol: '+', title: 'Advanced USDC Expense', amt:microToWei(usdOutflow[type].advanceExp) , amtInUsd: microToDust(usdOutflow[type].advanceExp), show: ()=>showUsdAdvanceExpRecords(type)},
    ];

    setItems(items);
    setShowSGNA(true);
  }

  const displayExchangeGainLoss = (type:number) => {

    let gl = getOpExchangeGainLoss(type, ethInflow, ethOutflow, cbpInflow, cbpOutflow, weiToDust, leeToWei);

    let items:BtnProps[] = [
      {simbol: ' ', title: 'Operational Exchange Gain (Loss)', amt: 0n, amtInUsd: gl, show: ()=>{}},
      {simbol: '+', title: 'ETH Transfer Income - G/L', amt:0n, amtInUsd: (weiToDust(ethInflow[type].transfer) - ethInflow[type].transferInUsd), show: ()=>{}},
      {simbol: '-', title: 'ETH GMM Payment - G/L', amt:0n, amtInUsd: (weiToDust(ethOutflow[type].gmmTransfer + ethOutflow[type].gmmExpense) - (ethOutflow[type].gmmTransferInUsd + ethOutflow[type].gmmExpenseInUsd)), show: ()=>{}},
      {simbol: '-', title: 'ETH BMM Payment - G/L', amt:0n, amtInUsd: (weiToDust(ethOutflow[type].bmmTransfer + ethOutflow[type].bmmExpense) - (ethOutflow[type].bmmTransferInUsd + ethOutflow[type].bmmExpenseInUsd)), show: ()=>{}},
      {simbol: '+', title: 'CBP Royalty Income - G/L', amt:0n, amtInUsd: (leeToDust(cbpInflow[type].royalty) - cbpInflow[type].royaltyInUsd), show: ()=>{}},
      {simbol: '-', title: 'CBP New User Awards - G/L', amt:0n, amtInUsd: (leeToDust(cbpOutflow[type].newUserAward) - cbpOutflow[type].newUserAwardInUsd), show: ()=>{}},
      {simbol: '-', title: 'CBP Startup Cost - G/L', amt:0n, amtInUsd: (leeToDust(cbpOutflow[type].startupCost) - cbpOutflow[type].startupCostInUsd), show: ()=>{}},
      {simbol: '-', title: 'CBP GMM Payment - G/L', amt:0n, amtInUsd: (leeToDust(cbpOutflow[type].gmmTransfer) - cbpOutflow[type].gmmTransferInUsd), show: ()=>{}},
      {simbol: '-', title: 'CBP BMM Payment - G/L', amt:0n, amtInUsd: (leeToDust(cbpOutflow[type].bmmTransfer) - cbpOutflow[type].bmmTransferInUsd), show: ()=>{}},

    ];

    setItems(items);
    setShowSGNA(true);
  }

  const displayDistribution = (type:number) => {

    let distribution = ethOutflow[type].distribution + microToWei(usdOutflow[type].distributeUsd);
    let distributionInUsd = weiToDust(ethOutflow[type].distribution) + microToDust(usdOutflow[type].distributeUsd);

    let items:BtnProps[] = [
      {simbol: ' ', title: 'Distribution', amt: distribution, amtInUsd: distributionInUsd, show: ()=>{}},
      {simbol: '+', title: 'Distribution In ETH', amt:ethOutflow[type].distribution, amtInUsd: weiToDust(ethOutflow[type].distribution), show: ()=>showDistributionRecords(type)},
      {simbol: '+', title: 'Distribution In USDC', amt: microToWei(usdOutflow[type].distributeUsd) , amtInUsd:microToDust(usdOutflow[type].distributeUsd), show: ()=>showUsdDistributionRecords(type)},
    ];

    setItems(items);
    setShowSGNA(true);
  }

  // ==== Crypto Flow ====

  const displayGasIncome = (type:number) => {

    let gasIncomeInEth = microToWei(usdInflow[type].gas) + ethInflow[type].gas;

    let gasIncomeInUsd = microToDust(usdInflow[type].gas) + weiToDust(ethInflow[type].gas);

    let items:BtnProps[] = [
      {simbol: ' ', title: 'Gas Income', amt: gasIncomeInEth, amtInUsd: gasIncomeInUsd, show: ()=>{}},
      {simbol: '+', title: 'Gas Income (USDC)', amt: microToWei(usdInflow[type].gas), amtInUsd: microToDust(usdInflow[type].gas), show: ()=>showUsdGasIncomeRecords(type)},
      {simbol: '+', title: 'Gas Income (ETH)', amt:ethInflow[type].gas, amtInUsd: weiToDust(ethInflow[type].gas), show: ()=>showGasIncomeRecords(type)}
    ];

    setItems(items);
    setShowSGNA(true);
  }

  const displayCryptoOutflowInSGNA = (type:number) => {

    let gmmEthExp = ethOutflow[type].gmmTransfer + ethOutflow[type].gmmExpense;
    let gmmEthExpInUsd = weiToDust(gmmEthExp);

    let bmmEthExp = ethOutflow[type].bmmTransfer + ethOutflow[type].bmmExpense;
    let bmmEthExpInUsd = weiToDust(bmmEthExp);

    let sgNa = gmmEthExp + bmmEthExp + microToWei(usdOutflow[type].reimburseExp + usdOutflow[type].advanceExp);

    let sgNaInUsd = gmmEthExpInUsd + bmmEthExpInUsd + microToDust(usdOutflow[type].reimburseExp + usdOutflow[type].advanceExp);

    let items:BtnProps[] = [
      {simbol: ' ', title: 'Sales, General & Administrative', amt: sgNa, amtInUsd: sgNaInUsd, show: ()=>{}},
      {simbol: '+', title: 'GMM Approved Eth Expense', amt:gmmEthExp , amtInUsd: gmmEthExpInUsd, show: ()=>showGmmEthPaymentRecords(type)},
      {simbol: '+', title: 'BMM Approved Eth Expense', amt:bmmEthExp , amtInUsd: bmmEthExpInUsd, show: ()=>showBmmEthPaymentRecords(type)},
      {simbol: '+', title: 'Reimbursed USDC Expense', amt:microToWei(usdOutflow[type].reimburseExp) , amtInUsd: microToDust(usdOutflow[type].reimburseExp), show: ()=>showUsdReimburseExpRecords(type)},
      {simbol: '+', title: 'Advanced USDC Expense', amt:microToWei(usdOutflow[type].advanceExp) , amtInUsd: microToDust(usdOutflow[type].advanceExp), show: ()=>showUsdAdvanceExpRecords(type)},
    ];

    setItems(items);
    setShowSGNA(true);
  }

  // ==== Crypto Inventory ====

  const displayCbpMintToOthers = (type:number) => {

    let cbpMintOut = leeToWei(cbpOutflow[type].newUserAward + cbpOutflow[type].startupCost);
    let cbpMintOutInUsd = leeToDust(cbpOutflow[type].newUserAward + cbpOutflow[type].startupCost);

    let items:BtnProps[] = [
      {simbol: ' ', title: 'CBP Mint To Others', amt: cbpMintOut, amtInUsd: cbpMintOutInUsd, show: ()=>{}},
      {simbol: '+', title: 'New User Awards', amt:leeToWei(cbpOutflow[type].newUserAward) , amtInUsd: leeToDust(cbpOutflow[type].newUserAward), show: ()=>showNewUserAwardRecords(type)},
      {simbol: '+', title: 'Startup Cost', amt:leeToWei(cbpOutflow[type].startupCost) , amtInUsd: leeToDust(cbpOutflow[type].startupCost), show: ()=>showStartupCostRecords(type)},
    ];

    setItems(items);
    setShowSGNA(true);
  }

  const showEthInflow = (type:number) => {

    let records = trimCashflow(ethInflowRecords, startDate, endDate, type);

    let curSumInUsd = weiToDust(ethInflow[type].totalAmt);

    let arrSumInfo = inETH
      ? [ {title: 'ETH Income - (ETH ', data: ethInflow[type].totalAmt},
          {title: 'GasIncome', data: ethInflow[type].gas},
          {title: 'PayInCap', data: ethInflow[type].capital},
          {title: 'TransferIncome', data: ethInflow[type].transfer} 
        ]
      : [ 
          {title: 'ETH Income - (USD ', data: curSumInUsd},
          {title: 'Original ETH Income', data: ethInflow[type].sumInUsd},
          {title: 'Exchange Gain/Loss', data: curSumInUsd - ethInflow[type].sumInUsd},
          {title: 'GasIncome', data: ethInflow[type].gasInUsd},
          {title: 'PayInCap', data: ethInflow[type].capitalInUsd},
          {title: 'TransferIncome', data: ethInflow[type].transferInUsd}
        ];

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  const showEthOutflow = (type:number) => {

    let records = trimCashflow(ethOutflowRecords, startDate, endDate, type);

    let curSumInUsd = weiToDust(ethOutflow[type].totalAmt);

    let arrSumInfo = inETH
      ? [ {title: 'ETH Outflow - (ETH ', data: ethOutflow[type].totalAmt},
          {title: 'Distribution', data: ethOutflow[type].distribution},
          {title: 'GMM Transfer', data: ethOutflow[type].gmmTransfer},
          {title: 'GMM Expense', data: ethOutflow[type].gmmExpense},
          {title: 'BMM Transfer', data: ethOutflow[type].bmmTransfer},
          {title: 'BMM Expense', data: ethOutflow[type].bmmExpense},
        ]
      : [ 
          {title: 'ETH Outflow - (USD ', data: curSumInUsd},
          {title: 'Original ETH Outflow', data: ethOutflow[type].sumInUsd},
          {title: 'Exchange Gain/Loss', data: curSumInUsd - ethOutflow[type].sumInUsd},
          {title: 'Distribution', data: ethOutflow[type].distributionInUsd},
          {title: 'GMM Transfer', data: ethOutflow[type].gmmTransferInUsd},
          {title: 'GMM Expense', data: ethOutflow[type].gmmExpenseInUsd},
          {title: 'BMM Transfer', data: ethOutflow[type].bmmTransferInUsd},
          {title: 'BMM Expense', data: ethOutflow[type].bmmExpenseInUsd}
        ];

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  const showCbpInflow = (type:number) => {

    let records = trimCashflow(cbpInflowRecords, startDate, endDate, type);

    let curSumInUsd = leeToDust(cbpInflow[type].totalAmt);

    let arrSumInfo = inETH
        ? [ {title: 'CBP Income - (CBP ', data: cbpInflow[type].totalAmt},
            {title: 'Royalty', data: cbpInflow[type].royalty},
            {title: 'Transfer', data: cbpInflow[type].transfer}, 
            {title: 'Mint', data: cbpInflow[type].mint}]
        : [ 
            {title: 'CBP Income - (USD ', data: curSumInUsd},
            {title: 'Original CBP Income', data: cbpInflow[type].sumInUsd},
            {title: 'Exchange Gain/Loss', data: curSumInUsd - cbpInflow[type].sumInUsd},
            {title: 'Royalty', data: cbpInflow[type].royaltyInUsd},
            {title: 'Transfer', data: cbpInflow[type].transferInUsd},
            {title: 'Mint', data: cbpInflow[type].mintInUsd}]; 

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  const showCbpOutflow = (type:number) => {

    let records = trimCashflow(cbpOutflowRecords, startDate, endDate, type);

    let curSumInUsd = leeToDust(cbpOutflow[type].totalAmt);

    let arrSumInfo = inETH
        ? [ {title: 'CBP Outflow - (CBP ', data: cbpOutflow[type].totalAmt},
            {title: 'New User Award', data: cbpOutflow[type].newUserAward},
            {title: 'Startup Cost', data: cbpOutflow[type].startupCost},
            {title: 'Fuel Sold', data: cbpOutflow[type].fuelSold},
            {title: 'GMM Transfer', data: cbpOutflow[type].gmmTransfer},
            {title: 'BMM Transfer', data: cbpOutflow[type].bmmTransfer} 
          ]
        : [ 
            {title: 'CBP Outflow - (USD ', data: curSumInUsd},
            {title: 'OriginalCBP Outflow', data: cbpOutflow[type].sumInUsd},
            {title: 'Exchange Gain/Loss', data: curSumInUsd - cbpOutflow[type].sumInUsd},
            {title: 'New User Award', data: cbpOutflow[type].newUserAward},
            {title: 'Startup Cost', data: cbpOutflow[type].startupCostInUsd},
            {title: 'Fuel Sold', data: cbpOutflow[type].fuelSoldInUsd},
            {title: 'GMM Transfer', data: cbpOutflow[type].gmmTransferInUsd},
            {title: 'BMM Transfer', data: cbpOutflow[type].bmmTransferInUsd} 
          ];

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  const showDepositsInflow = (type:number) => {
    let records = trimCashflow(depositsRecords, startDate, endDate, type);

    records = records.filter(v => v.typeOfIncome != 'Pickup' && v.typeOfIncome != 'CustodyValueOfBidOrder' &&
        v.typeOfIncome != 'CloseOfferAgainstBid' && v.typeOfIncome != 'RefundValueOfBidOrder' && 
        v.typeOfIncome != 'CloseInitOfferAgainstBid'
    )

    let inEth = deposits[type].balance + deposits[type].consideration + deposits[type].distribution;
    let inUsd = deposits[type].balanceInUsd + deposits[type].considerationInUsd + deposits[type].distributionInUsd;
    let curSumInUsd = weiToDust(inEth);
    let exChangeGainLoss = curSumInUsd - inUsd;

    let arrSumInfo = inETH
      ? [ {title: 'Deposits Inflow - (ETH ', data: inEth},
          {title: 'Consideration', data: deposits[type].consideration},
          {title: 'Distribution', data: deposits[type].distribution},
          {title: 'Balance', data: deposits[type].balance} 
        ]
      : [ 
          {title: 'Deposits Inflow - (USD ', data: curSumInUsd},
          {title: 'Original Deposits Inflow', data: inUsd},
          {title: 'Exchange Gain/Loss', data: exChangeGainLoss},
          {title: 'Consideration', data: deposits[type].considerationInUsd},
          {title: 'Distribution', data: deposits[type].distributionInUsd},
          {title: 'Balance', data: deposits[type].balanceInUsd}
        ];

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  const showCustody = (type:number) => {
    let records = trimCashflow(depositsRecords, startDate, endDate, type);

    records = records.filter(v => v.typeOfIncome == 'CustodyValueOfBidOrder' || v.typeOfIncome == 'CloseOfferAgainstBid' ||
        v.typeOfIncome == 'RefundValueOfBidOrder' || v.typeOfIncome == 'CloseInitOfferAgainstBid'
    )

    let curSumInUsd = weiToDust(deposits[type].custody);
    let exchangeGainLoss = curSumInUsd - deposits[type].custodyInUsd;

    let arrSumInfo = inETH
      ? [ {title: 'Custody - (ETH ', data: deposits[type].custody},
        ]
      : [
          {title: 'Custody - (USD ', data: curSumInUsd},
          {title: 'Original Custody', data: deposits[type].custodyInUsd},
          {title: 'Exchange Gain/Loss', data: exchangeGainLoss},
        ];

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  const showDepositsOutflow = (type:number) => {
    let records = trimCashflow(depositsRecords, startDate, endDate, type);

    records = records.filter(v => v.typeOfIncome == 'Pickup');
    let curSumInUsd = weiToDust(deposits[type].pickup);
    let exchangeGainLoss =  curSumInUsd - deposits[type].pickupInUsd;

    let arrSumInfo = inETH
      ? [ {title: 'Deposits Outflow - (ETH ', data: deposits[type].pickup},
          {title: 'Pickup', data: deposits[type].pickup},
        ]
      : [ 
          {title: 'Deposits Outflow - (USD ', data: curSumInUsd},
          {title: 'Original Deposits Outflow', data: deposits[type].pickupInUsd},
          {title: 'Exchange Gain/Loss', data: exchangeGainLoss},
          {title: 'Pickup', data: deposits[type].pickupInUsd},
        ];

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  const showFtCbpflow = (type:number) => {
    let records = trimCashflow(ftCbpflowRecords, startDate, endDate, type);

    let curSumInUsd = leeToDust(ftCbpflow[type].totalCbp);

    let arrSumInfo = inETH
      ? [ {title: 'CBP Balance in FT - (CBP ', data: ftCbpflow[type].totalCbp},
          {title: '+ Add Fuel', data: ftCbpflow[type].addCbp},
          {title: '- Fuel Sold', data: ftCbpflow[type].refuelCbp},
          {title: '- Fuel Withdrawn', data: ftCbpflow[type].withdrawCbp}
        ]
      : [
          {title: 'CBP Balance in FT - (USD ', data: curSumInUsd},
          {title: 'Original CBP Balance in FT', data: ftCbpflow[type].totalCbpInUsd},
          {title: 'Exchange Gain/Loss', data: curSumInUsd - ftCbpflow[type].totalCbpInUsd},
          {title: '+ Add Fuel', data: ftCbpflow[type].addCbpInUsd},
          {title: '- Fuel Sold', data: ftCbpflow[type].refuelCbpInUsd},
          {title: '- Fuel Withdrawn', data: ftCbpflow[type].withdrawCbpInUsd}
        ];

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  const showFtEthflow = (type:number) => {
    let records = trimCashflow(ftEthflowRecords, startDate, endDate, type);

    let curSumInUsd = weiToDust(ftEthflow[type].totalEth);

    let arrSumInfo = inETH
      ? [ {title: 'Eth Balance in FT - (ETH ', data: ftEthflow[type].totalEth},
          {title: 'Gas Income', data: ftEthflow[type].refuelEth},
          {title: 'Income Pickup', data: ftEthflow[type].withdrawEth},
        ]
      : [ 
          {title: 'Eth Balance in FT - (USD ', data: curSumInUsd},
          {title: 'Original Eth Balance in FT', data: ftEthflow[type].totalEthInUsd},
          {title: 'Exchange Gain/Loss', data: curSumInUsd - ftEthflow[type].totalEthInUsd},
          {title: 'Gas Income', data: ftEthflow[type].refuelEthInUsd},
          {title: 'Income Pickup', data: ftEthflow[type].withdrawEthInUsd},
        ];

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  const showUsdInflow = (type:number) => {

    let records = trimCashflow(usdInflowRecords, startDate, endDate, type);

    let arrSumInfo = inETH
        ? [ 
            {title: 'USDC Inflow - (ETH ', data: microToWei(usdInflow[type].totalAmt)},
            {title: 'Capital', data: microToWei(usdInflow[type].capital)},
            {title: 'Premium', data: microToWei(usdInflow[type].premium)}, 
            {title: 'GasIncome', data: microToWei(usdInflow[type].gas)},
            {title: 'UpgradeCashier', data: microToWei(usdInflow[type].upgradeCashier)}, 
          ]
        : [ 
            {title: 'USDC Inflow - (USD ', data: microToDust(usdInflow[type].totalAmt)},
            {title: 'Capital', data: microToDust(usdInflow[type].capital)},
            {title: 'Premium', data: microToDust(usdInflow[type].premium)},
            {title: 'GasIncome', data: microToDust(usdInflow[type].gas)},
            {title: 'UpgradeCashier', data: microToDust(usdInflow[type].upgradeCashier)},
          ];

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  const showUsdOutflow = (type:number) => {

    let records = trimCashflow(usdOutflowRecords, startDate, endDate, type);

    let arrSumInfo = inETH
        ? [ 
            {title: 'USDC Outflow - (ETH ', data: microToWei(usdOutflow[type].totalAmt)},
            {title: 'Reimbursed Expenses', data: microToWei(usdOutflow[type].reimburseExp)},
            {title: 'Advanced Expenses', data: microToWei(usdOutflow[type].advanceExp)}, 
            {title: 'Distribution', data: microToWei(usdOutflow[type].distributeUsd)}, 
            {title: 'UpgradeCashier', data: microToWei(usdOutflow[type].upgradeCashier)}, 
          ]
        : [ 
            {title: 'USDC Outflow - (USD ', data: microToDust(usdOutflow[type].totalAmt)},
            {title: 'Reimbursed Expenses', data: microToDust(usdOutflow[type].reimburseExp)},
            {title: 'Advanced Expenses', data: microToDust(usdOutflow[type].advanceExp)},
            {title: 'Distribution', data: microToDust(usdOutflow[type].distributeUsd)},
            {title: 'UpgradeCashier', data: microToDust(usdOutflow[type].upgradeCashier)},
          ];

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  const showUsdEscOutflow = (type:number) => {

    let records = trimCashflow(usdEscrowRecords, startDate, endDate, type);

    records = records.filter(v => v.typeOfIncome == 'RefundValueOfBidOrder' ||
      v.typeOfIncome == 'CloseBidAgainstOffer' || v.typeOfIncome == 'CloseOfferAgainstBid' ||
      v.typeOfIncome == 'PayOffSwap' || v.typeOfIncome == 'PayOffRejectedDeal' ||
      v.typeOfIncome == 'PayOffShareTransferDeal' || v.typeOfIncome == 'RefundBalanceOfBidOrder' ||
      v.typeOfIncome == 'PayOffCapIncreaseDeal' || v.typeOfIncome == 'CloseBidAgainstInitOffer' ||
      v.typeOfIncome == 'CloseInitOfferAgainstBid'
    );

    let sum = usdEscrow[type].balance + usdEscrow[type].consideration + usdEscrow[type].forward;

    let arrSumInfo = inETH
        ? [ 
            {title: 'USDC Escrow Outflow - (ETH ', data: microToWei(sum)},
            {title: 'Forward Payment', data: microToWei(usdEscrow[type].forward)},
            {title: 'Consideration', data: microToWei(usdEscrow[type].consideration)}, 
            {title: 'Bid Refund', data: microToWei(usdEscrow[type].balance)}, 
          ]
        : [ 
            {title: 'USDC Escrow Outflow - (USD ', data: microToDust(sum)},
            {title: 'Forward Payment', data: microToDust(usdEscrow[type].forward)},
            {title: 'Consideration', data: microToDust(usdEscrow[type].consideration)},
            {title: 'Bid Refund', data: microToDust(usdEscrow[type].balance)},
          ];

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  const showUsdEscInflow = (type:number) => {

    let records = trimCashflow(usdEscrowRecords, startDate, endDate, type);
    records = records.filter(v => v.typeOfIncome == 'CustodyValueOfBid' ||
      v.typeOfIncome == 'PayOffSwap' || v.typeOfIncome == 'PayOffRejectedDeal' ||
      v.typeOfIncome == 'PayOffShareTransferDeal' || 
      v.typeOfIncome == 'PayOffCapIncreaseDeal'
    );

    let arrSumInfo = inETH
        ? [ 
            {title: 'USDC Escrow Inflow - (ETH ', data: microToWei(usdEscrow[type].escrow + usdEscrow[type].forward)},
            {title: 'Bid Margin', data: microToWei(usdEscrow[type].escrow)},
            {title: 'Forward Payment', data: microToWei(usdEscrow[type].forward)},
          ]
        : [ 
            {title: 'USDC Escrow Inflow - (USD ', data: microToDust(usdEscrow[type].escrow + usdEscrow[type].forward)},
            {title: 'Bid Margin', data: microToDust(usdEscrow[type].escrow)},
            {title: 'Forward Payment', data: microToDust(usdEscrow[type].forward)},
          ];

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  const showUsdDepInflow = (type:number) => {

    let records = trimCashflow(usdEscrowRecords, startDate, endDate, type);
    records = records.filter(v => v.typeOfIncome == 'DistributeUsd');

    let arrSumInfo = inETH
        ? [ 
            {title: 'USDC Deposit Inflow - (ETH ', data: microToWei(usdEscrow[type].distribution)},
          ]
        : [ 
            {title: 'USDC Deposit Inflow - (USD ', data: microToDust(usdEscrow[type].distribution)},
          ];

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  const showUsdDepOutflow = (type:number) => {

    let records = trimCashflow(usdEscrowRecords, startDate, endDate, type);
    records = records.filter(v => v.typeOfIncome == 'PickupUsd');

    let arrSumInfo = inETH
        ? [ 
            {title: 'USDC Deposit Outflow - (ETH ', data: microToWei(usdEscrow[type].pickup)},
          ]
        : [ 
            {title: 'USDC Deposit Outflow - (USD ', data: microToDust(usdEscrow[type].pickup)},
          ];

    setSumInfo(arrSumInfo);
    setList(records);
    setOpen(true);
  }

  return (

    <Paper elevation={3} sx={{m:1, p:1, border:1,borderColor:'divider'}} >

      <Stack direction='row' sx={{ alignItems:'center', justifyContent:'space-between' }} >

        <Stack direction='row' sx={{alignItems:'center'}}>

          <Stack direction='column' sx={{ alignItems:'center' }} >
            <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
              <b>Financial Statement</b> 
            </Typography>
            <Typography variant='body2' sx={{ m:2, my:0, textDecoration:'underline'}} >
              Date: ({dateParser(ethRateDate)}) 
            </Typography>

          </Stack>  

          <Divider orientation="vertical" flexItem sx={{ m:2 }} />

          <Stack direction='column' sx={{ alignItems:'center' }} >
            <Stack direction='row' sx={{ alignItems:'center' }} >

              <Typography variant='h6' color= {inETH ? 'gray' : 'blue'} sx={{ m:2 }} >
                <b>USD</b>
              </Typography>

              <Switch
                color="primary" 
                onChange={(e) => setInETH( e.target.checked )} 
                checked={ inETH } 
              />

              <Typography variant='h6' color={inETH ? 'blue' : 'gray'} sx={{ m:2}} >
                <b>ETH</b>
              </Typography>

            </Stack>

            <Stack direction='row' sx={{ alignItems:'center' }} >

              <Typography variant='body2' sx={{ m:2, my:0, textDecoration:'underline'}} >
                {baseToDollar((10n**20n/centPrice).toString())} (ETH/USD) 
              </Typography>

              <Typography variant='body2' sx={{ m:2, my:0, textDecoration:'underline'}} >
                {longDataParser(bigIntToStrNum(exRate,6))} (CBP/USD) 
              </Typography>

            </Stack>

          </Stack>

          <Divider orientation="vertical" flexItem sx={{ m:2 }} />

          <Stack direction='row' sx={{ m:2, alignItems:'center'}} >

            <DateTimeField
              label='BeginningDate'
              helperText=' '
              sx={{m:1, mt:3, minWidth:188 }}
              value={ stampToUtc(startDate) }
              onChange={(date) => setStartDate(utcToStamp(date))}
              format='YYYY-MM-DD HH:mm:ss'
              size='small'
            />

            <Typography variant='body2' sx={{ m:2}} >
              ——
            </Typography>

            <DateTimeField
              label='EnddingDate'
              helperText=' '
              sx={{m:1, mt:3, minWidth:188 }}
              value={ stampToUtc(endDate) }
              onChange={(date) => setEndDate( utcToStamp(date) )}
              format='YYYY-MM-DD HH:mm:ss'
              size='small'
            />

            <Button 
              variant="contained" sx={{m:2, mt:0.8, mr:8, width:'128'}} 
              onClick={()=>updateCashflowRange()} disabled={flags.findIndex(v => v==true) < 0 || startDate > endDate} 
              endIcon={<Update/>}
            >
              Update 
            </Button>

            {flags.map((v, i)=>(
                <Tooltip key={i} title={tips[i]} placement='top-end' arrow >
                  <span key={i}>
                    <TipsAndUpdates key={i} color={ v ? 'warning' : 'disabled'} sx={{m:1}} />
                  </span>
                </Tooltip>
            ))}

          </Stack>

        </Stack>

      </Stack>

      <CbpInflow setRecords={setCbpInflowRecords} />

      <CbpOutflow setRecords={setCbpOutflowRecords} />

      <EthInflow setRecords={setEthInflowRecords} />

      <EthOutflow setRecords={setEthOutflowRecords} />

      <UsdInflow setRecords={setUsdInflowRecords} />

      <UsdOutflow setRecords={setUsdOutflowRecords} />

      <Deposits setRecords={setDepositsRecords} />

      <UsdEscrow setRecords={setUsdEscrowRecords} />

      <FtCbpflow setRecords={setFtCbpflowRecords} />

      <FtEthflow setRecords={setFtEthflowRecords} />

      <CashFlowList inETH={inETH} arrSum={sumInfo} records={list} open={open} setOpen={setOpen}/>

      <SGNA inETH={inETH} items={items} open={showSGNA} setOpen={setShowSGNA} />
          
      <Stack direction='row' >

        <Assets inETH={inETH} centPrice={centPrice} startDate={startDate} endDate={endDate} opnBlkNo={opnBlkNo} rptBlkNo={rptBlkNo} display={[()=>displayEthOfComp(3), ()=>displayUsdOfComp(3)]} ethInflow={ethInflow} ethOutflow={ethOutflow} usdInflow={usdInflow} usdOutflow={usdOutflow} />

        <LiabilyAndEquity inETH={inETH} centPrice={centPrice} exRate={exRate} startDate={startDate} opnBlkNo={opnBlkNo} endDate={endDate} rptBlkNo={rptBlkNo} display={[()=>displayDeferredRevenue(3), ()=>displayPaidInCap(3), ()=>displayPaidInPremium(3)]} cbpInflow={cbpInflow} cbpOutflow={cbpOutflow} ethInflow={ethInflow} ethOutflow={ethOutflow} usdInflow={usdInflow} usdOutflow={usdOutflow} />

      </Stack>
      
      <Stack direction='row'>

        <IncomeStatement inETH={inETH} centPrice={centPrice} exRate={exRate} startDate={startDate} endDate={endDate} opnBlkNo={opnBlkNo} rptBlkNo={rptBlkNo} display={[()=>showRoyaltyRecords(2), ()=>showOtherIncomeRecords(2), ()=>displaySGNA(2), ()=>displayExchangeGainLoss(2), ()=>displayDistribution(2)]} cbpInflow={cbpInflow} cbpOutflow={cbpOutflow} ethInflow={ethInflow} ethOutflow={ethOutflow} usdInflow={usdInflow} usdOutflow={usdOutflow} />
 
        <CryptosFlowStatement inETH={inETH} exRate={exRate} centPrice={centPrice} startDate={startDate} endDate={endDate} opnBlkNo={opnBlkNo} rptBlkNo={rptBlkNo} display={[ ()=>displayGasIncome(2), ()=>showOtherIncomeRecords(2), ()=>displayCryptoOutflowInSGNA(2), ()=>displayShareIssuanceProceeds(2), ()=>displayDistribution(2) ]} cbpInflow={cbpInflow} cbpOutflow={cbpOutflow} ethInflow={ethInflow} ethOutflow={ethOutflow} usdInflow={usdInflow} usdOutflow={usdOutflow} ftCbpflow={ftCbpflow} ftEthflow={ftEthflow} deposits={deposits} usdEscrow={usdEscrow} />

      </Stack>

      <Stack direction='row'>

        <EquityChangeStatement inETH={inETH} centPrice={centPrice} exRate={exRate} startDate={startDate} endDate={endDate} opnBlkNo={opnBlkNo} rptBlkNo={rptBlkNo} display={[()=>showPaidInCapRecords(2), ()=>showDistributionRecords(2)]} cbpInflow={cbpInflow} cbpOutflow={cbpOutflow} ethInflow={ethInflow} ethOutflow={ethOutflow} usdInflow={usdInflow} usdOutflow={usdOutflow} />
      
      </Stack>

      <Stack direction='row' >

        <CryptoInventory inETH={inETH} exRate={exRate} centPrice={centPrice} startDate={startDate} endDate={endDate} opnBlkNo={opnBlkNo} rptBlkNo={rptBlkNo} display={[()=>showCbpInflow(2), ()=>displayCbpMintToOthers(2), ()=>showCbpOutflow(2), ()=>showFtCbpflow(3), ()=>showEthInflow(2), ()=>showEthOutflow(2), ()=>showFtEthflow(3), ()=>showDepositsInflow(2), ()=>showCustody(2), ()=>showDepositsOutflow(2), ()=>showUsdInflow(2), ()=>showUsdOutflow(2), ()=>showUsdEscInflow(2), ()=>showUsdEscOutflow(2), ()=>showUsdDepInflow(2), ()=>showUsdDepOutflow(2)]} cbpInflow={cbpInflow} cbpOutflow={cbpOutflow} ethInflow={ethInflow} ethOutflow={ethOutflow} usdInflow={usdInflow} usdOutflow={usdOutflow} ftCbpflow={ftCbpflow} ftEthflow={ftEthflow} deposits={deposits} usdEscrow={usdEscrow} />

      </Stack>

    </Paper>
  );
} 