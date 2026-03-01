import { Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { baseToDust, showUSD, weiToEth9Dec } from "../FinStatement";
import { baseToDollar, HexParser } from "../../../common/toolsKit";
import { getRetainedEarnings, IncomeStatementProps } from "./IncomeStatement";
import { getInitContribution } from "./Assets";
import { CbpOutflowSum } from "./Cashflow/CbpOutflow";
import { CbpInflowSum } from "./Cashflow/CbpInflow";
import { EthOutflowSum } from "./Cashflow/EthOutflow";
import { EthInflowSum } from "./Cashflow/EthInflow";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";
import { booxMap } from "../../../common";
import { capAtDate } from "../../rom/rom";
import { UsdInflowSum } from "./Cashflow/UsdInflow";
import { UsdOutflowSum } from "./Cashflow/UsdOutflow";


export const getDeferredRevenue = (type:number, cbpInflow:CbpInflowSum[], cbpOutflow:CbpOutflowSum[], leeToWei:(cbp:bigint)=>bigint) => {
  const inEth = leeToWei(cbpOutflow[type].totalAmt - cbpInflow[type].totalAmt + cbpInflow[type].mint);
  const inUsd = cbpOutflow[type].sumInUsd - cbpInflow[type].sumInUsd + cbpInflow[type].mintInUsd;

  return ({inEth:inEth, inUsd:inUsd});
}

export const getEthGainAndLossInEquity = (type:number, ethInflow:EthInflowSum[], weiToDust:(eth:bigint)=>bigint) =>{
  const inEth = '0';
  const inUsd = weiToDust(ethInflow[type].capital + ethInflow[type].premium) - (ethInflow[type].capitalInUsd + ethInflow[type].premiumInUsd);

  return({inEth:inEth, inUsd:inUsd});
}

export const getOwnersEquity = (
  type:number, 
  startDate:number,
  endDate:number, 
  centPrice:bigint, 
  cbpInflow:CbpInflowSum[], 
  cbpOutflow:CbpOutflowSum[], 
  ethInflow:EthInflowSum[], 
  ethOutflow:EthOutflowSum[], 
  usdInflow:UsdInflowSum[],
  usdOutflow:UsdOutflowSum[],
  leeToWei:(cbp:bigint)=>bigint, 
  baseToWei:(usd:bigint)=>bigint, 
  weiToDust:(eth:bigint)=>bigint,
  microToWei:(usd:bigint)=>bigint,
  microToDust:(usd:bigint)=>bigint
) => {

  const initContribution = getInitContribution(type, startDate, endDate);

  const retainedEarnings = getRetainedEarnings(type, startDate, endDate, centPrice, cbpInflow, cbpOutflow, ethInflow, ethOutflow, usdOutflow, leeToWei, weiToDust, microToWei,microToDust);

  const inEth = baseToWei(initContribution) + ethInflow[type].capital + ethInflow[type].premium + retainedEarnings.inEth + microToWei(usdInflow[type].capital + usdInflow[type].premium);

  const inUsd = baseToDust(initContribution) + weiToDust(ethInflow[type].capital + ethInflow[type].premium) + retainedEarnings.inUsd + microToDust(usdInflow[type].capital + usdInflow[type].premium);

  return ({inEth:inEth, inUsd:inUsd});
}

export function LiabilyAndEquity({inETH, centPrice, exRate, startDate, endDate, rptBlkNo, display, cbpInflow, cbpOutflow, ethInflow, ethOutflow, usdInflow, usdOutflow}: IncomeStatementProps) {

  const leeToWei = (cbp:bigint) => {
    return cbp * exRate * centPrice / 10n ** 22n;
  }

  const weiToDust = (eth:bigint) => {
    return eth * 10n ** 16n / centPrice;
  }

  const leeToDust = (cbp:bigint) => {
    return cbp * exRate / 10n ** 6n;
  }

  const baseToWei = (base:bigint) => {
    return base * centPrice / 100n;
  }

  const microToWei = (usd:bigint) => {
    return usd * centPrice / 10000n;
  }

  const microToDust = (usd:bigint) => {
    return usd * 10n ** 12n;
  }

  // ==== Liabilities ====
  const client = usePublicClient();

  let deferredRevenue = getDeferredRevenue(3, cbpInflow, cbpOutflow, leeToWei);

  // ==== Capital ====

  const {boox} = useComBooxContext();
  const [parOfCap, setParOfCap] = useState(0n);
  const [paidOfCap, setPaidOfCap] = useState(0n);
  
  useEffect(()=>{

    const getCapital = async ()=>{
      
      if (!boox || boox.length == 0) return;
      const rom = boox[booxMap.ROM];

      const blk = await client.getBlock();
      const curTime = Number(blk.timestamp);

      const endTime = endDate > curTime
          ? curTime : endDate;

      const capital = await capAtDate(rom, endTime);

      setParOfCap(capital.par);
      setPaidOfCap(capital.paid);
    };

    getCapital();

  }, [boox, endDate, client]);

  // ==== Profits & Loss ====

  const retainedEarnings = getRetainedEarnings(3, startDate, endDate, centPrice, cbpInflow, cbpOutflow, ethInflow, ethOutflow, usdOutflow, leeToWei, weiToDust, microToWei, microToDust);

  // ==== Owners Equity ====

  const ethGNL = getEthGainAndLossInEquity(3, ethInflow, weiToDust);

  const ownersEquity = getOwnersEquity(3, startDate, endDate, centPrice, cbpInflow, cbpOutflow, ethInflow, ethOutflow, usdInflow, usdOutflow, leeToWei, baseToWei, weiToDust, microToWei, microToDust);


  return(
    <Paper elevation={3} 
      sx={{
        m:1, p:1, border:1, 
        borderColor:'divider',
        width: '50%' 
      }} 
    >

      <Stack direction='row' sx={{ alignItems:'center' }} >
        <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
          <b>Balance Sheet (Liabilities & Owners Equity)</b>
        </Typography>
      </Stack>

      <Stack direction='row' width='100%' >
        <Button variant="outlined" sx={{width: '100%', m:0.5, justifyContent:'start'}} onClick={()=>display[0](3)}  >
          <b>Deferred Revenue: ({ inETH
            ? weiToEth9Dec(deferredRevenue.inEth)
            : showUSD(weiToDust(deferredRevenue.inEth))}) </b>
        </Button>
      </Stack>

      <Stack direction='row' width='100%' >
        <Typography variant="h6" textAlign='center' width='30%'>
          &nbsp;
        </Typography>
        <Button variant="outlined" sx={{width: '70%', m:0.5, justifyContent:'start'}} >
          <b>Total Liabilities: ({ inETH
            ? weiToEth9Dec(deferredRevenue.inEth)
            : showUSD(weiToDust(deferredRevenue.inEth))}) </b>
        </Button>
      </Stack>

      <Stack direction='row' width='100%' >
        <Button variant="outlined" sx={{width: '100%', m:0.5, justifyContent:'start'}} >
          <b>Subscribed Capital: ({ inETH
            ? weiToEth9Dec(baseToWei(parOfCap))
            : baseToDollar(parOfCap.toString()) + 'USD' }) </b>
        </Button>
      </Stack>

      <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
        <Typography variant="h6" textAlign='center' width='10%'>
          -
        </Typography>
        <Button variant="outlined" sx={{width: '90%', m:0.5, justifyContent:'start'}} onClick={()=>{}} >
          <b>Unpaid Subscription: ({ inETH
            ? weiToEth9Dec(baseToWei(parOfCap - paidOfCap))
            : baseToDollar((parOfCap - paidOfCap).toString()) + 'USD'}) </b>
        </Button>
      </Stack>

      <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
        <Typography variant="h6" textAlign='center' width='20%'>
          &nbsp;
        </Typography>
        <Button variant="outlined" sx={{width: '80%', m:0.5, justifyContent:'start'}} onClick={()=>display[1](3)} >
          <b>Paid In Capital: ({ inETH
            ? weiToEth9Dec(ethInflow[3].capital + microToWei(usdInflow[3].capital))
            : showUSD(ethInflow[3].capitalInUsd + microToDust(usdInflow[3].capital)) }) </b>
        </Button>
      </Stack>

      <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
        <Typography variant="h6" textAlign='center' width='10%'>
          &nbsp;
        </Typography>
        <Typography variant="h6" textAlign='center' width='10%'>
          +
        </Typography>
        <Button variant="outlined" sx={{width: '80%', m:0.5, justifyContent:'start'}} onClick={()=>display[2](3)} >
          <b>Additional Paid In Capital: ({ inETH
            ? weiToEth9Dec(ethInflow[3].premium + microToWei(usdInflow[3].premium))
            : showUSD(ethInflow[3].premiumInUsd + microToDust(usdInflow[3].premium))}) </b>
        </Button>
      </Stack>

      <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
        <Typography variant="h6" textAlign='center' width='10%'>
          &nbsp;
        </Typography>
        <Typography variant="h6" textAlign='center' width='10%'>
          +
        </Typography>
        <Button variant="outlined" sx={{width: '80%', m:0.5, justifyContent:'start'}} >
          <b>Eth Gain/Loss In Equity: ({ inETH
            ? ethGNL.inEth
            : showUSD( ethGNL.inUsd ) })</b>
        </Button>
      </Stack>

      <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
        <Typography variant="h6" textAlign='center' width='10%'>
          &nbsp;
        </Typography>
        <Typography variant="h6" textAlign='center' width='10%'>
          +
        </Typography>
        <Button variant="outlined" sx={{width: '80%', m:0.5, justifyContent:'start'}} >
          <b>Retained Earnings: ({ inETH
            ? weiToEth9Dec(retainedEarnings.inEth)
            : showUSD(retainedEarnings.inUsd)}) </b>
        </Button>
      </Stack>

      <Stack direction='row' width='100%' >
        <Typography variant="h6" textAlign='center' width='30%'>
          &nbsp;
        </Typography>
        <Button variant="outlined" sx={{width: '70%', m:0.5, justifyContent:'start'}} >
          <b>Total Equity: ({ inETH
            ? weiToEth9Dec(ownersEquity.inEth)
            : showUSD(ownersEquity.inUsd)}) </b>
        </Button>
      </Stack>

      <Divider orientation="horizontal"  sx={{ my:2, color:'blue' }} flexItem  />

      <Stack direction='row' width='100%' >
        <Typography variant="h6" textAlign='center' width='30%'>
          &nbsp;
        </Typography>
        <Button variant="outlined" sx={{width: '70%', m:0.5, justifyContent:'start'}} >
          <b>Total Liabilities & Owners Equity: ({ inETH
            ? weiToEth9Dec(deferredRevenue.inEth + ownersEquity.inEth)
            : showUSD(weiToDust(deferredRevenue.inEth) + ownersEquity.inUsd)}) </b>
        </Button>
      </Stack>

    </Paper>
  );   
}