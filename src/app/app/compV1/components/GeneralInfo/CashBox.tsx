import { useEffect, useState } from "react";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";
import { balanceOf, balanceOfWei } from "../../../rc";
import { totalDeposits } from "../../gk";
import { balanceOfComp, totalEscrow, totalUsdDeposits } from "../../cashier";
import { booxMap } from "../../../common";
import { Divider, Grid, Paper, Stack, TextField, Typography } from "@mui/material";

import { getEthPart, getGWeiPart, getWeiPart, longDataParser } from "../../../common/toolsKit";
import { PickupDeposit } from "./CashBox/PickupDeposit";
import { DepositOfMine } from "./CashBox/DepositOfMine";
import { PickupUsdDeposit } from "./CashBox/PickupUsdDeposit";
import { UsdDepositOfMine } from "./CashBox/UsdDepositOfMine";

export function CashBox() {

  const { gk, boox } = useComBooxContext();

  const [ time, setTime ] = useState<number>(0);

  const refresh = () => {
    setTime(Date.now());
  }

  const [ balanceOfCBP, setBalanceOfCBP ] = useState<string>('0');
  const [ balanceOfETH, setBalanceOfETH ] = useState(0n);
  const [ balanceOfUSD, setBalanceOfUSD ] = useState('0');

  const [ depositsOfETH, setDepositsOfETH ] = useState(0n);
  const [ escrowUSD, setEscrowUSD ] = useState('0');
  const [ depositUSD, setDepositUSD ] = useState('0');

  useEffect(()=>{
    if (gk) {

      balanceOfWei(gk).then(
        res => setBalanceOfETH(res)
      );

      balanceOf(gk, undefined).then(
        res => setBalanceOfCBP(res.toString())        
      );
      
      totalDeposits(gk).then(
        res => setDepositsOfETH(res)
      );
    }

    if (boox) {

      const cashier = boox[booxMap.ROI];

      balanceOfComp(cashier).then(
        res => setBalanceOfUSD(res.toString())
      );

      totalEscrow(cashier).then(
        res => setEscrowUSD(res.toString())
      );

      totalUsdDeposits(cashier).then(
        res => setDepositUSD(res.toString())
      );

    }
  }, [ gk, time, boox ]);

  let cap = (balanceOfETH - depositsOfETH).toString();

  return(

    <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider'}} >

      <Stack direction='row' sx={{ alignItems:'center' }} >

        <Typography variant='h5' sx={{ m:2, textDecoration:'underline' }}  >
          <b>Cash Box</b>
        </Typography>

        <PickupUsdDeposit refresh={refresh} />

        <UsdDepositOfMine time={time} />

        <PickupDeposit refresh={refresh} />

        <DepositOfMine time={time} />

      </Stack>

      <Grid container direction='row' spacing={0} sx={{width:1600}} >

        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField
            size="small"
            variant='outlined'
            label='(GUSDC)'
            inputProps={{
              readOnly: true,
              style: {textAlign: 'right'},
            }}
            color = "primary"
            focused
            sx={{
              m:1,
            }}
            value = {longDataParser(
              balanceOfUSD.length > 15 ? balanceOfUSD.substring(0, balanceOfUSD.length - 15) : '0'
            )}
          />
        </Grid>
        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='(USDC)'
            inputProps={{
              readOnly: true,
              style: {textAlign: 'right'},
            }}
            color = "primary"
            focused
            sx={{
              m:1,
            }}
            value={ longDataParser(
              balanceOfUSD.length > 6 
                ? balanceOfUSD.length > 15
                  ? balanceOfUSD.substring(balanceOfUSD.length - 15, balanceOfUSD.length - 6)
                  : balanceOfUSD.substring(0, balanceOfUSD.length - 6) 
                : '0'
            )}
          />
        </Grid>
        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='(Micro-USDC)'
            inputProps={{
              readOnly: true,
              style: {textAlign: 'left'},
            }}
            color = "primary"
            focused
            sx={{
              m:1,
            }}
            value={ longDataParser(
              balanceOfUSD.length > 6
                ? balanceOfUSD.substring(balanceOfUSD.length - 6)
                : balanceOfUSD
            )}
          />
        </Grid>

        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='(ETH)'
            inputProps={{
              readOnly: true,
              style: { textAlign: "right" },
            }}
            color = "success"
            focused
            sx={{
              m:1,
            }}
            value={ getEthPart(cap) }
          />
        </Grid>
        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='(GWei)'
            inputProps={{
              readOnly: true,
              style: { textAlign: "right" },
            }}
            color = "success"
            focused
            sx={{
              m:1,
            }}
            value={ getGWeiPart(cap) }
          />
        </Grid>
        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='(Wei)'
            inputProps={{
              readOnly: true,
              style: { textAlign: "left" },
            }}
            color = "success"
            focused
            sx={{
              m:1,
            }}
            value={ getWeiPart(cap) }
          />
        </Grid>

        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='(CBP)'
            inputProps={{
              readOnly: true,
              style: {textAlign: 'right'},
            }}
            color = "primary"
            focused
            sx={{
              m:1,
            }}
            value={ getEthPart(balanceOfCBP) }
          />
        </Grid>
        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='(GLee)'
            inputProps={{
              readOnly: true,
              style: {textAlign: 'right'},
            }}
            color = "primary"
            focused
            sx={{
              m:1,
            }}
            value={ getGWeiPart(balanceOfCBP) }
          />
        </Grid>
        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='(Lee)'
            inputProps={{
              readOnly: true,
              style: {textAlign: 'left'},
            }}
            color = "primary"
            focused
            sx={{
              m:1,
            }}
            value={ getWeiPart(balanceOfCBP)}
          />
        </Grid>

      </Grid>
      
      <Divider orientation="horizontal" flexItem sx={{ m:1 }} />

      <Grid container direction='row' spacing={0} sx={{width:1600}} >

        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='Escrow (GUSDC)'
            inputProps={{
              readOnly: true,
              style: {textAlign: 'right'},
            }}
            color = "primary"
            focused
            sx={{
              m:1,
            }}
            value = {longDataParser(
              escrowUSD.length > 15 ? escrowUSD.substring(0, escrowUSD.length - 15) : '0'
            )}
          />
        </Grid>
        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='Escrow (USDC)'
            inputProps={{
              readOnly: true,
              style: {textAlign: 'right'},
            }}
            color = "primary"
            focused
            sx={{
              m:1,
            }}
            value={ longDataParser(
              escrowUSD.length > 6 
                ? escrowUSD.length > 15
                  ? escrowUSD.substring(escrowUSD.length - 15, escrowUSD.length - 6)
                  : escrowUSD.substring(0, escrowUSD.length - 6) 
                : '0'
            )}
          />
        </Grid>
        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='Escrow (Micro-USDC)'
            inputProps={{
              readOnly: true,
              style: {textAlign: 'left'},
            }}
            color = "primary"
            focused
            sx={{
              m:1,
            }}
            value={ longDataParser(
              escrowUSD.length > 6
                ? escrowUSD.substring(escrowUSD.length - 6)
                : escrowUSD
            )}
          />
        </Grid>

        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='Deposit (ETH)'
            inputProps={{
              readOnly: true,
              style: { textAlign: "right" },
            }}
            color = "success"
            focused
            sx={{
              m:1,
            }}
            value={ getEthPart(depositsOfETH.toString()) }
          />
        </Grid>
        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='Deposit (GWei)'
            inputProps={{
              readOnly: true,
              style: { textAlign: "right" },
            }}
            color = "success"
            focused
            sx={{
              m:1,
            }}
            value={ getGWeiPart(depositsOfETH.toString()) }
          />
        </Grid>
        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='Deposit (Wei)'
            inputProps={{
              readOnly: true,
              style: { textAlign: "left" },
            }}
            color = "success"
            focused
            sx={{
              m:1,
            }}
            value={ getWeiPart(depositsOfETH.toString()) }
          />              
        </Grid>

        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='Deposit (GUSDC)'
            inputProps={{
              readOnly: true,
              style: {textAlign: 'right'},
            }}
            color = "primary"
            focused
            sx={{
              m:1,
            }}
            value = {longDataParser(
              depositUSD.length > 15 ? depositUSD.substring(0, depositUSD.length - 15) : '0'
            )}
          />
        </Grid>
        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='Deposit (USDC)'
            inputProps={{
              readOnly: true,
              style: {textAlign: 'right'},
            }}
            color = "primary"
            focused
            sx={{
              m:1,
            }}
            value={ longDataParser(
              depositUSD.length > 6 
                ? depositUSD.length > 15
                  ? depositUSD.substring(depositUSD.length - 15, depositUSD.length - 6)
                  : depositUSD.substring(0, depositUSD.length - 6) 
                : '0'
            )}
          />
        </Grid>
        <Grid item xs={1.3} md={1.3} lg={1.3} >
          <TextField 
            size="small"
            variant='outlined'
            label='Deposit (Micro-USDC)'
            inputProps={{
              readOnly: true,
              style: {textAlign: 'left'},
            }}
            color = "primary"
            focused
            sx={{
              m:1,
            }}
            value={ longDataParser(
              depositUSD.length > 6
                ? depositUSD.substring(depositUSD.length - 6)
                : depositUSD
            )}
          />
        </Grid>


      </Grid>

    </Paper>

  );
}