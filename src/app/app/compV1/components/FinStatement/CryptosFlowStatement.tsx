import { Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { showUSD, weiToEth9Dec } from "../FinStatement";
import { FtCbpflowSum } from "./Cashflow/FtCbpflow";
import { IncomeStatementProps } from "./IncomeStatement";
import { FtEthflowSum } from "./Cashflow/FtEthflow";
import { DepositsSum } from "./Cashflow/Deposits";
import { UsdEscrowSum } from "./Cashflow/UsdEscrow";

export interface CryptoflowStatementProps extends IncomeStatementProps {
  ftCbpflow: FtCbpflowSum[],
  ftEthflow: FtEthflowSum[],
  deposits: DepositsSum[],
  usdEscrow: UsdEscrowSum[],
}


export function CryptosFlowStatement({inETH, exRate, centPrice, startDate, endDate, display, ethInflow, ethOutflow, cbpInflow, cbpOutflow, usdInflow, usdOutflow, ftCbpflow, ftEthflow, deposits, usdEscrow}: CryptoflowStatementProps) {
  
  const weiToDust = (eth:bigint) => {
    return eth * 10n ** 16n / centPrice;
  }

  const microToWei = (usd:bigint) => {
    return usd * centPrice / 10000n;
  }

  const microToDust = (usd:bigint) => {
    return usd * 10n ** 12n;
  }

  // ==== Operating Activity ====

  const getEthPayment = () => {
    const inEth = ethOutflow[2].bmmTransfer + ethOutflow[2].gmmTransfer + ethOutflow[2].bmmExpense + ethOutflow[2].gmmExpense;
    const inUsd = weiToDust(inEth);

    return({inEth: inEth, inUsd: inUsd});
  }

  const getUsdPayment = () => {
    const inEth = microToWei(usdOutflow[2].advanceExp + usdOutflow[2].reimburseExp);
    const inUsd = microToDust(usdOutflow[2].advanceExp + usdOutflow[2].reimburseExp);

    return ({inEth: inEth, inUsd: inUsd});
  } 

  const getEthInflowFromOperating = () => {
    const inEth = ethInflow[2].gas + ethInflow[2].transfer;
    const inUsd = weiToDust(inEth);

    return ({inEth: inEth, inUsd: inUsd});
  }

  const getUsdInflowFromOperating = () => {
    const inEth = microToWei(usdInflow[2].gas);
    const inUsd = weiToDust(inEth);

    return ({inEth: inEth, inUsd: inUsd});
  }

  const getNetEthOfOperating = () => {
    const inEth = getEthInflowFromOperating().inEth - getEthPayment().inEth;
    const inUsd = weiToDust(inEth);

    return ({inEth: inEth, inUsd: inUsd});
  }

  const getNetUsdOfOperating = () => {
    const inEth = getUsdInflowFromOperating().inEth - getUsdPayment().inEth;
    const inUsd = getUsdInflowFromOperating().inUsd - getUsdPayment().inUsd;

    return ({inEth: inEth, inUsd: inUsd});
  }

  // ---- Financing ----

  const getNetEthOfFinancing = () => {
    const inEth = ethInflow[2].capital + ethInflow[2].premium - ethOutflow[2].distribution;
    const inUsd = weiToDust(inEth);

    return ({inEth: inEth, inUsd:inUsd});
  }

  const getNetUsdOfFinancing = () => {
    const inEth = microToWei(usdInflow[2].capital + usdInflow[2].premium - usdOutflow[2].distributeUsd);
    const inUsd = microToDust(usdInflow[2].capital + usdInflow[2].premium - usdOutflow[2].distributeUsd);
    
    return ({inEth: inEth, inUsd: inUsd});
  };

  // ==== Sum ====

  const getNetIncreaseOfEth = () => {
    const inEth = getNetEthOfOperating().inEth + getNetEthOfFinancing().inEth;
    const inUsd = getNetEthOfOperating().inUsd + getNetEthOfFinancing().inUsd;

    return ({inEth: inEth, inUsd: inUsd});
  }

  const getNetIncreaseOfUsd = () => {
    const inEth = getNetUsdOfOperating().inEth + getNetUsdOfFinancing().inEth;
    const inUsd = getNetUsdOfOperating().inUsd + getNetUsdOfFinancing().inUsd;

    return ({inEth: inEth, inUsd: inUsd});
  }

  return(

    <Paper elevation={3} 
      sx={{
        m:1, p:1, border:1, 
        borderColor:'divider',
        width: '100%',
      }} 
    >

      <Stack direction='row' sx={{ alignItems:'center' }} >
        <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
          <b>Cryptos Flow Statement</b>
        </Typography>
      </Stack>

      <Stack direction='column' sx={{ alignItems:'end' }} >

        <Stack direction='row' width='100%' sx={{alignItems:'center'}} >
          <Typography variant="h6" textAlign='center' width='10%'>
            +
          </Typography>
          <Button variant="outlined" sx={{width:'100%', m:0.5, justifyContent:'start'}} onClick={()=>display[0](2)}>
            <b>Deferred Revenue From CBP Sales: ({inETH 
                ? weiToEth9Dec(ethInflow[2].gas + microToWei(usdInflow[2].gas))
                : showUSD(weiToDust(ethInflow[2].gas) + microToDust(usdInflow[2].gas))}) </b>
          </Button>
        </Stack>

        <Stack direction='row' width='100%' sx={{alignItems:'center'}} >
          <Typography variant="h6" textAlign='center' width='10%'>
            +
          </Typography>
          <Button variant="outlined" sx={{width:'100%', m:0.5, justifyContent:'start'}} onClick={()=>display[1](2)} >
            <b>Other Income: ({inETH 
                ? weiToEth9Dec(ethInflow[2].transfer) 
                : showUSD(weiToDust(ethInflow[2].transfer))}) </b>
          </Button>
        </Stack>

        <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
          <Typography variant="h6" textAlign='center' width='10%'>
            -
          </Typography>
          <Button variant="outlined" sx={{width:'100%', m:0.5, justifyContent:'start'}} onClick={()=>display[2](2)} >
            <b>Sales, General And Administrative: ({inETH 
                ? weiToEth9Dec(getEthPayment().inEth + getUsdPayment().inEth) 
                : showUSD(getEthPayment().inUsd + getUsdPayment().inUsd)}) </b>
          </Button>
        </Stack>

        <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
          <Typography variant="h6" textAlign='center' width='20%'>
            &nbsp;
          </Typography>
          <Button variant="outlined" sx={{width: '100%', m:0.5, justifyContent:'start'}} >
            <b>Net Inflow From Operating Activities: ({inETH 
                ? weiToEth9Dec(getNetEthOfOperating().inEth + getNetUsdOfOperating().inEth) 
                : showUSD(getNetEthOfOperating().inUsd + getNetUsdOfOperating().inUsd)}) </b>
          </Button>
        </Stack>

      </Stack>

      <Divider orientation="horizontal"  sx={{ my:2, color:'blue' }} flexItem  />

      <Stack direction='column' sx={{ alignItems:'end' }} >

        <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
          <Typography variant="h6" textAlign='center' width='10%'>
            -
          </Typography>
          <Button variant="outlined" sx={{width: '100%', m:0.5, justifyContent:'start'}} >
            <b>Purchase Of IPR: ({inETH 
                ? weiToEth9Dec(0n) 
                : showUSD(0n)}) </b>
          </Button>
        </Stack>

        <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
          <Typography variant="h6" textAlign='center' width='20%'>
            &nbsp;
          </Typography>
          <Button variant="outlined" sx={{width: '100%', m:0.5, justifyContent:'start'}} >
            <b>Net Outflow for Investing Activities: ({inETH 
                ? weiToEth9Dec(0n) 
                : showUSD(0n)}) </b>
          </Button>
        </Stack>

      </Stack>

      <Divider orientation="horizontal"  sx={{ my:2, color:'blue' }} flexItem  />

      <Stack direction='column' sx={{ alignItems:'end' }} >

        <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
          <Typography variant="h6" textAlign='center' width='10%'>
            +
          </Typography>
          <Button variant="outlined" sx={{width: '100%', m:0.5, justifyContent:'start'}} onClick={()=>display[3](2)} >
            <b>Proceeds from Share Issuance: ({inETH 
                ? weiToEth9Dec(ethInflow[2].capital + ethInflow[2].premium + microToWei(usdInflow[2].capital + usdInflow[2].premium) ) 
                : showUSD(weiToDust(ethInflow[2].capital + ethInflow[2].premium) + microToDust(usdInflow[2].capital + usdInflow[2].premium))}) </b>
          </Button>
        </Stack>

        <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
          <Typography variant="h6" textAlign='center' width='10%'>
            -
          </Typography>
          <Button variant="outlined" sx={{width: '100%', m:0.5, justifyContent:'start'}} onClick={()=>display[4](2)} >
            <b>Distribution: ({inETH 
                ? weiToEth9Dec(ethOutflow[2].distribution + microToWei(usdOutflow[2].distributeUsd)) 
                : showUSD(weiToDust(ethOutflow[2].distribution) + microToDust(usdOutflow[2].distributeUsd))}) </b>
          </Button>
        </Stack>

        <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
          <Typography variant="h6" textAlign='center' width='20%'>
            &nbsp;
          </Typography>
          <Button variant="outlined" sx={{width: '100%', m:0.5, justifyContent:'start'}} >
            <b>Net Inflow from Financing Activities: ({inETH 
                ? weiToEth9Dec(getNetEthOfFinancing().inEth + getNetUsdOfFinancing().inEth) 
                : showUSD(getNetEthOfFinancing().inUsd + getNetUsdOfFinancing().inUsd)}) </b>
          </Button>
        </Stack>

      </Stack>

      <Divider orientation="horizontal"  sx={{ my:2, color:'blue' }} flexItem  />

      <Stack direction='column' sx={{ alignItems:'end' }} >

        <Stack direction='row' width='100%' sx={{alignItems:'center'}}  >
          <Typography variant="h6" textAlign='center' width='20%'>
            &nbsp;
          </Typography>
          <Button variant="outlined" sx={{width: '100%', m:0.5, justifyContent:'start'}} >
            <b>Net Inflow of Cryptos: ({inETH 
                ? weiToEth9Dec(getNetIncreaseOfEth().inEth + getNetIncreaseOfUsd().inEth) 
                : showUSD(getNetIncreaseOfEth().inUsd + getNetIncreaseOfUsd().inUsd)}) </b>
          </Button>
        </Stack>

      </Stack>    
    </Paper>
  );   
}