import { Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { showUSD, weiToEth9Dec } from "../FinStatement";
import { getProfits, getRetainedEarnings, IncomeStatementProps } from "./IncomeStatement";
import { useEffect, useState } from "react";
import { capAtDate } from "../../rom/rom";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";
import { booxMap } from "../../../common";
import { usePublicClient } from "wagmi";
import { iprValueA, setUpDate } from "./Assets";
import { getEthGainAndLossInEquity, getOwnersEquity } from "./LiabilityAndEquity";

export function EquityChangeStatement({inETH, exRate, centPrice, startDate, endDate, display, ethInflow, ethOutflow, cbpInflow, cbpOutflow, usdInflow, usdOutflow}: IncomeStatementProps) {

  const { boox } = useComBooxContext();

  const leeToWei = (cbp:bigint) => {
    return cbp * exRate * centPrice / 10n ** 22n;
  }

  const weiToDust = (eth:bigint) => {
    return eth * 10n ** 16n / centPrice;
  }

  const baseToWei = (bp:bigint) => {
    return bp * centPrice / 100n;
  }

  const baseToDust = (usd:bigint) => {
    return usd * 10n ** 14n;
  }


  const microToWei = (usd:bigint) => {
    return usd * centPrice / 10000n;
  }

  const microToDust = (usd:bigint) => {
    return usd * 10n ** 12n;
  }

  // ---- Cap ----

  const [ opnClassA, setOpnClassA ] = useState(0n);
  const [ endClassA, setEndClassA ] = useState(0n);

  const client = usePublicClient();

  useEffect(()=>{

    const getPaidCap = async () =>{
      if (!boox) return;
      const rom = boox[booxMap.ROM];

      const blk = await client.getBlock();
      const curTime = Number(blk.timestamp);

      if (startDate > endDate || startDate > curTime) return;

      const endTime = endDate > curTime
          ? curTime : endDate;

      const opnCap = (await capAtDate(rom, startDate)).paid;
      const endCap = (await capAtDate(rom, endTime)).paid;

      if (endTime > setUpDate) {
        setEndClassA(iprValueA);
      }

      if (startDate > setUpDate) {
        setOpnClassA(iprValueA);        
      }
      
    }

    getPaidCap();
  }, [startDate, endDate, client, boox]);

  // ---- Cap Premium ----
  
  const getCapPremium = (type:number)=> {

    const inEth = ethInflow[type].premium + microToWei(usdInflow[type].premium);
    const inUsd = ethInflow[type].premiumInUsd + microToDust(usdInflow[type].premium);

    return {inEth: inEth, inUsd: inUsd};
  }

  const getPaidInCap = (type:number)=> {

    const inEth = ethInflow[type].capital +  microToWei(usdInflow[type].capital);
    const inUsd = ethInflow[type].capitalInUsd + microToDust(usdInflow[type].capital);

    return {inEth: inEth, inUsd: inUsd};
  }

  const netIncome = (type:number) => getProfits(type, startDate, endDate, centPrice, cbpInflow, cbpOutflow, ethInflow, ethOutflow, usdOutflow, leeToWei, weiToDust, microToWei, microToDust);

  const retainedEarnings = (type:number) => getRetainedEarnings(type, startDate, endDate, centPrice, cbpInflow, cbpOutflow, ethInflow, ethOutflow, usdOutflow, leeToWei, weiToDust, microToWei, microToDust);

  const ethGNL = (type:number) => getEthGainAndLossInEquity(type, ethInflow, weiToDust);

  const ownersEquity = (type:number) => getOwnersEquity(type, startDate, endDate, centPrice, cbpInflow, cbpOutflow, ethInflow, ethOutflow, usdInflow, usdOutflow, leeToWei, baseToWei, weiToDust, microToWei, microToDust);

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
            <b>Statement of Changes in Equity</b>
          </Typography>
        </Stack>

        <Table >

          <TableHead>
            <TableRow >
              <TableCell>
                <Typography variant='body1'>
                  <b>Particulars</b>
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant='body1'>
                  <b>Class A (Paid In Capital)</b>
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant='body1'>
                  <b>Class B (Paid In Capital)</b>
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant='body1'>
                  <b>Additional Paid In Capital</b>
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant='body1'>
                  <b>ETH Gain/Loss In Equity</b>
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant='body1'>
                  <b>Retained Earnings</b>
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant='body1'>
                  <b>Total Equity</b>
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            
            <TableRow sx={{ backgroundColor:'lightskyblue'}}>

              <TableCell>
                <Typography variant='body1'>
                  <b>Begining Balance</b>  
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  { inETH
                    ? weiToEth9Dec(baseToWei(opnClassA))
                    : showUSD(baseToDust(opnClassA)) }
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                { inETH
                    ? weiToEth9Dec( getPaidInCap(1).inEth )
                    : showUSD( getPaidInCap(1).inUsd ) }
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  { inETH
                    ? weiToEth9Dec(getCapPremium(1).inEth)
                    : showUSD(getCapPremium(1).inUsd) }
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  { inETH
                    ? ethGNL(1).inEth
                    : showUSD( ethGNL(1).inUsd ) }
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  { inETH
                    ? weiToEth9Dec(retainedEarnings(1).inEth)
                    : showUSD(retainedEarnings(1).inUsd) }
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  { inETH
                    ? weiToEth9Dec(ownersEquity(1).inEth)
                    : showUSD(ownersEquity(1).inUsd) }
                </Typography>
              </TableCell>

            </TableRow>

            <TableRow >
              
              <TableCell>
                <Typography variant='body1'>
                  <b>Net Income</b>  
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  -
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  -
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  -
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  -
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  { inETH
                    ? weiToEth9Dec(netIncome(2).inEth)
                    : showUSD(netIncome(2).inUsd) }
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  { inETH
                    ? weiToEth9Dec(netIncome(2).inEth)
                    : showUSD(netIncome(2).inUsd) }
                </Typography>
              </TableCell>

            </TableRow>

            <TableRow sx={{ backgroundColor:'lightskyblue'}}>
              
              <TableCell>
                <Typography variant='body1'>
                  <b>Dividends Paid</b>
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  -
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  -
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  -
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  -
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  -{  inETH
                      ? weiToEth9Dec(ethOutflow[2].distribution + microToWei(usdOutflow[2].distributeUsd))
                      : showUSD(ethOutflow[2].distributionInUsd + microToDust(usdOutflow[2].distributeUsd)) } 
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  -{  inETH
                      ? weiToEth9Dec(ethOutflow[2].distribution + microToWei(usdOutflow[2].distributeUsd))
                      : showUSD(ethOutflow[2].distributionInUsd + microToDust(usdOutflow[2].distributeUsd)) } 
                </Typography>
              </TableCell>

            </TableRow>

            <TableRow >
              
              <TableCell>
                <Typography variant='body1'>
                  <b>Shares Issued</b>  
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                { inETH
                  ? weiToEth9Dec(baseToWei(endClassA - opnClassA))
                  : showUSD(baseToDust(endClassA - opnClassA)) } 
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                { inETH
                  ? weiToEth9Dec( getPaidInCap(2).inEth )
                  : showUSD( getPaidInCap(2).inUsd ) } 
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                { inETH
                  ? weiToEth9Dec(getCapPremium(2).inEth)
                  : showUSD(getCapPremium(2).inUsd) } 
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                { inETH
                  ? ethGNL(2).inEth
                  : showUSD( ethGNL(2).inUsd ) } 
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  -
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  { inETH
                    ? weiToEth9Dec(getPaidInCap(2).inEth + getCapPremium(2).inEth)
                    : showUSD(getPaidInCap(2).inUsd + getCapPremium(2).inUsd + ethGNL(2).inUsd)} 
                </Typography>
              </TableCell>

            </TableRow>

            <TableRow sx={{ backgroundColor:'lightskyblue'}}>
              
              <TableCell>
                <Typography variant='body1'>
                  <b>Ending Balance</b>  
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  { inETH
                    ? weiToEth9Dec(baseToWei(endClassA))
                    : showUSD(baseToDust(endClassA)) }
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  { inETH
                    ? weiToEth9Dec( getPaidInCap(3).inEth )
                    : showUSD( getPaidInCap(3).inUsd ) }
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  { inETH
                    ? weiToEth9Dec(getCapPremium(3).inEth)
                    : showUSD(getCapPremium(3).inUsd)}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                { inETH
                  ? ethGNL(3).inEth
                  : showUSD( ethGNL(3).inUsd ) } 
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                  { inETH
                    ? weiToEth9Dec(retainedEarnings(3).inEth)
                    : showUSD(retainedEarnings(3).inUsd)}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant='body1'>
                { inETH
                    ? weiToEth9Dec(ownersEquity(3).inEth)
                    : showUSD(ownersEquity(3).inUsd) }
                </Typography>
              </TableCell>

            </TableRow>

          </TableBody>

        </Table>

    </Paper>

  );   
}