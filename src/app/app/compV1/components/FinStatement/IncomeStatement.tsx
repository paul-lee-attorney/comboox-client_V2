import { Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { showUSD, weiToEth9Dec } from "../FinStatement";
import { baseToDollar } from "../../../common/toolsKit";
import { CbpInflowSum } from "./Cashflow/CbpInflow";
import { CbpOutflowSum } from "./Cashflow/CbpOutflow";
import { AssetsProps, getArmotization, getEthOfComp } from "./Assets";
import { getDeferredRevenue } from "./LiabilityAndEquity";
import { EthOutflowSum } from "./Cashflow/EthOutflow";
import { EthInflowSum } from "./Cashflow/EthInflow";
import { UsdOutflowSum } from "./Cashflow/UsdOutflow";


export const getSGNA = (type:number, ethOutflow:EthOutflowSum[], cbpOutflow:CbpOutflowSum[], usdOutflow:UsdOutflowSum[], leeToWei:(cbp:bigint)=>bigint, microToWei:(cbp:bigint)=>bigint, microToDust:(cbp:bigint)=>bigint) => {
  const ethExp = ethOutflow[type].totalAmt - ethOutflow[type].distribution;
  const ethExpInUsd = ethOutflow[type].sumInUsd - ethOutflow[type].distributionInUsd;

  const cbpExp = leeToWei(cbpOutflow[type].totalAmt - cbpOutflow[type].fuelSold);
  const cbpExpInUsd = cbpOutflow[type].sumInUsd - cbpOutflow[type].fuelSoldInUsd;
  
  const usdExp = microToWei(usdOutflow[type].advanceExp + usdOutflow[type].reimburseExp);
  const usdExpInUsd = microToDust(usdOutflow[type].advanceExp + usdOutflow[type].reimburseExp);

  const inEth = ethExp + cbpExp + usdExp;
  const inUsd = ethExpInUsd + cbpExpInUsd + usdExpInUsd;

  return ({inEth:inEth, inUsd:inUsd});
}

export const getOpExchangeGainLoss = (type:number, ethInflow:EthInflowSum[], ethOutflow:EthOutflowSum[], cbpInflow:CbpInflowSum[], cbpOutflow:CbpOutflowSum[], weiToDust:(eht:bigint)=>bigint, leeToWei:(cbp:bigint)=>bigint)=> {

  const ethOfComp = getEthOfComp(type, ethInflow, ethOutflow);
  const ethGainLoss = weiToDust(ethOfComp.inEth - ethInflow[type].capital - ethInflow[type].premium) - (ethOfComp.inUsd - ethInflow[type].capitalInUsd - ethInflow[type].premiumInUsd);

  const deferredRevenue = getDeferredRevenue(type, cbpInflow, cbpOutflow, leeToWei);
  const cbpGainLoss = weiToDust(deferredRevenue.inEth) - deferredRevenue.inUsd;

  return ethGainLoss - cbpGainLoss;
}

export const getEBITDA = (type:number, cbpInflow:CbpInflowSum[], cbpOutflow:CbpOutflowSum[], ethInflow:EthInflowSum[], ethOutflow:EthOutflowSum[], usdOutflow:UsdOutflowSum[], leeToWei:(cbp:bigint)=>bigint, weiToDust:(eth:bigint)=>bigint, microToWei:(eth:bigint)=>bigint, microToDust:(eth:bigint)=>bigint)=>{

  const sgNa = getSGNA(type, ethOutflow, cbpOutflow, usdOutflow, leeToWei, microToWei, microToDust);
  const exchangeGainLoss = getOpExchangeGainLoss(type, ethInflow, ethOutflow, cbpInflow, cbpOutflow, weiToDust, leeToWei);

  const inEth = leeToWei(cbpInflow[type].royalty) + ethInflow[type].transfer - sgNa.inEth;
  const inUsd = cbpInflow[type].royaltyInUsd + ethInflow[type].transferInUsd - sgNa.inUsd + exchangeGainLoss;

  return ({inEth:inEth, inUsd:inUsd});
}

export const getProfits = (type:number, startDate:number, endDate:number, centPrice:bigint, cbpInflow:CbpInflowSum[], cbpOutflow:CbpOutflowSum[], ethInflow:EthInflowSum[], ethOutflow:EthOutflowSum[], usdOutflow:UsdOutflowSum[], leeToWei:(cbp:bigint)=>bigint, weiToDust:(eth:bigint)=>bigint, microToWei:(eth:bigint)=>bigint, microToDust:(eth:bigint)=>bigint)=>{

  const armotization = getArmotization(type, startDate, endDate);

  const ebitda = getEBITDA(type,cbpInflow, cbpOutflow, ethInflow, ethOutflow, usdOutflow, leeToWei, weiToDust, microToWei, microToDust);

  const inEth = ebitda.inEth - armotization;
  const inUsd = ebitda.inUsd - weiToDust(armotization);

  return({inEth:inEth, inUsd:inUsd});
}

export const getRetainedEarnings = (
  type:number, startDate:number, endDate:number, centPrice:bigint, 
  cbpInflow:CbpInflowSum[], cbpOutflow:CbpOutflowSum[], 
  ethInflow:EthInflowSum[], ethOutflow:EthOutflowSum[], 
  usdOutflow:UsdOutflowSum[],
  leeToWei:(cbp:bigint)=>bigint, weiToDust:(eth:bigint)=>bigint, 
  microToWei:(usd:bigint)=>bigint, microToDust:(usd:bigint)=>bigint
) => {

  const profits = getProfits(type, startDate, endDate, centPrice, cbpInflow, cbpOutflow, ethInflow, ethOutflow, usdOutflow, leeToWei, weiToDust, microToWei, microToDust);

  const inEth = profits.inEth - ethOutflow[type].distribution - microToWei(usdOutflow[type].distributeUsd);
  const inUsd = profits.inUsd - weiToDust(ethOutflow[type].distribution) - microToDust(usdOutflow[type].distributeUsd);

  return ({inEth:inEth, inUsd:inUsd});
}

export interface IncomeStatementProps extends AssetsProps {
  exRate: bigint,
  cbpInflow: CbpInflowSum[],
  cbpOutflow: CbpOutflowSum[],
}

export function IncomeStatement({inETH, exRate, centPrice, startDate, endDate, display, ethInflow, ethOutflow, cbpInflow, cbpOutflow, usdInflow, usdOutflow}: IncomeStatementProps) {

  const leeToWei = (cbp:bigint) => {
    return cbp * exRate * centPrice / 10n ** 22n;
  }

  const weiToBP = (eth:bigint) => {
    return eth * 100n / centPrice;
  }

  const weiToDust = (eth:bigint) => {
    return eth * 10n ** 16n / centPrice;
  }

  const leeToDust = (cbp:bigint) => {
    return cbp * exRate / 10n ** 6n;
  }

  const weiToUSD = (eth:bigint) => {
    return baseToDollar(weiToBP(eth).toString()) + ' USD';
  }

  const microToWei = (usd:bigint) => {
    return usd * centPrice / 10000n;
  }

  const microToDust = (usd:bigint) => {
    return usd * 10n ** 12n;
  }

  const armotization = getArmotization(2, startDate, endDate);

  const sgNa = getSGNA(2, ethOutflow, cbpOutflow, usdOutflow, leeToWei, microToWei, microToDust);
  const exchangeGainLoss = getOpExchangeGainLoss(2, ethInflow, ethOutflow, cbpInflow, cbpOutflow, weiToDust, leeToWei);

  const ebitda = getEBITDA(2, cbpInflow, cbpOutflow, ethInflow, ethOutflow, usdOutflow, leeToWei, weiToDust, microToWei, microToDust);

  const profits = getProfits(2, startDate, endDate, centPrice, cbpInflow, cbpOutflow, ethInflow, ethOutflow, usdOutflow, leeToWei, weiToDust, microToWei, microToDust);

  const retainedEarnings = getRetainedEarnings(2, startDate, endDate, centPrice, cbpInflow, cbpOutflow, ethInflow, ethOutflow, usdOutflow, leeToWei, weiToDust, microToWei, microToDust);

  return(

    <Paper elevation={3} 
      sx={{
        m:1, p:1, border:1, 
        borderColor:'divider',
        width: '100%' 
      }} 
    >

      <Stack direction='row' sx={{ alignItems:'center' }} >
        <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
          <b>Income Statement</b>
        </Typography>
      </Stack>

      <Stack direction='row' width='100%' >
        <Button variant="outlined" sx={{width: '100%', m:0.5, justifyContent:'start'}} onClick={()=>display[0](2)} >
          <b>Royalty Income: ({ inETH
            ? weiToEth9Dec(leeToWei(cbpInflow[2].royalty))
            : showUSD(cbpInflow[2].royaltyInUsd)}) </b>
        </Button>
      </Stack>

      <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
        <Typography variant="h6" textAlign='center' width='10%'>
          +
        </Typography>
        <Button variant="outlined" sx={{width: '90%', m:0.5, justifyContent:'start'}} onClick={()=>display[1](2)} >
          <b>Other Income: ({ inETH
            ? weiToEth9Dec(ethInflow[2].transfer)
            : showUSD(ethInflow[2].transferInUsd)}) </b>
        </Button>
      </Stack>

      <Stack direction='row' width='100%' sx={{alignItems:'center'}}>
        <Typography variant="h6" textAlign='center' width='10%'>
          -
        </Typography>
        <Button variant="outlined" sx={{width: '90%', m:0.5, justifyContent:'start'}} onClick={()=>display[2](2)}>
          <b>Sales, General & Administrative: ({ inETH
            ? weiToEth9Dec(sgNa.inEth)
            : showUSD(sgNa.inUsd)}) </b>
        </Button>
      </Stack>

      <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
        <Typography variant="h6" textAlign='center' width='10%'>
          +
        </Typography>
        <Button variant="outlined" sx={{width: '90%', m:0.5, justifyContent:'start'}} onClick={()=>display[3](2)} >
          <b>Operational Crypto Exchange Gain/Loss: ({ inETH
            ? 0
            : showUSD(exchangeGainLoss) }) </b>
        </Button>
      </Stack>

      <Stack direction='row' width='100%' >
        <Typography variant="h6" textAlign='center' width='20%'>
          &nbsp;
        </Typography>
        <Button variant="outlined" sx={{width: '80%', m:0.5, justifyContent:'start'}} >
          <b>EBITDA: ({inETH
            ? weiToEth9Dec(ebitda.inEth)
            : showUSD(ebitda.inUsd)}) </b>
        </Button>
      </Stack>

      <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
        <Typography variant="h6" textAlign='center' width='20%'>
          &nbsp;
        </Typography>
        <Typography variant="h6" textAlign='center' width='10%'>
          -
        </Typography>
        <Button variant="outlined" sx={{width: '70%', m:0.5, justifyContent:'start'}} >
          <b>Amortization: ({ inETH
          ? weiToEth9Dec(armotization)
          : weiToUSD(armotization)}) </b>
        </Button>
      </Stack>

      <Divider orientation="horizontal"  sx={{ my:2, color:'blue' }} flexItem  />

      <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
        <Typography variant="h6" textAlign='center' width='40%'>
          &nbsp;
        </Typography>
        <Button variant="outlined" sx={{width: '60%', m:0.5, justifyContent:'start'}} >
          <b>Net Income: ({ inETH
            ? weiToEth9Dec(profits.inEth)
            : showUSD(profits.inUsd) }) </b>
        </Button>
      </Stack>

      <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
        <Typography variant="h6" textAlign='center' width='40%'>
          &nbsp;
        </Typography>
        <Typography variant="h6" textAlign='center' width='10%'>
          -
        </Typography>
        <Button variant="outlined" sx={{width: '50%', m:0.5, justifyContent:'start'}} onClick={()=>display[4](2)} >
          <b>Distribution: ({ inETH
            ? weiToEth9Dec(ethOutflow[2].distribution + microToWei(usdOutflow[2].distributeUsd))
            : showUSD(weiToDust(ethOutflow[2].distribution) + microToDust(usdOutflow[2].distributeUsd)) }) </b>
        </Button>
      </Stack>

      <Divider orientation="horizontal"  sx={{ my:2, color:'blue' }} flexItem  />

      <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
        <Typography variant="h6" textAlign='center' width='60%'>
          &nbsp;
        </Typography>
        <Button variant="outlined" sx={{width: '40%', m:0.5, justifyContent:'start'}} >
          <b>Retained Earnings: ({ inETH
            ? weiToEth9Dec(retainedEarnings.inEth)
            : showUSD(retainedEarnings.inUsd) }) </b>
        </Button>
      </Stack>

    </Paper>
  );   
}