"use client"

import { useState } from "react";
import { AddrOfRegCenter, AddrOfTank, AddrZero, HexType } from "../common";
import { Divider, Paper, Stack, TextField, Toolbar } from "@mui/material";
import { bigIntToStrNum, getEthPart, getGWeiPart, getWeiPart, longDataParser, } from "../common/toolsKit";

import { useUsdFuelTankGetOwner, useRegCenterBalanceOf, useUsdFuelTankRate, useUsdFuelTankCashier, useUsdFuelTankSum, useUsdFuelTankGetRegCenter } from "../../../../generated";

import { useWalletClient } from "wagmi";

import { CopyLongStrSpan, CopyLongStrTF } from "../common/CopyLongStr";
import { useComBooxContext } from "../../_providers/ComBooxContextProvider";
import { ActionsOfFuel } from "./ActionsOfFuel";
import { balanceOfUsd } from "../usdc";

function FuelTank() {

  const { setErrMsg } = useComBooxContext();

  const [ owner, setOwner ] = useState<HexType>(AddrZero);
  const [ isOwner, setIsOwner ] = useState(false);
  const { data: signer } = useWalletClient();
  const {
    refetch: getOwner
  } = useUsdFuelTankGetOwner ({
    address: AddrOfTank,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(res) {
      setOwner(res);
      if (res == signer?.account.address) {
        setIsOwner(true);
      } else setIsOwner(false);
    },
  })

  const [ regCenter, setRegCenter ] = useState<HexType>(AddrZero);
  const {
    refetch: getRegCenter
  } = useUsdFuelTankGetRegCenter({
    address: AddrOfTank,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(res) {
      setRegCenter(res);
    },
  })

  const [ cashier, setCashier ] = useState<HexType>(AddrZero);
  const {
    refetch: getCashier
  } = useUsdFuelTankCashier({
    address: AddrOfTank,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(res) {
      setCashier(res);
    },
  })

  const [ rate, setRate ] = useState<string>('0');
  const {
    refetch: getRate
  } = useUsdFuelTankRate({
    address: AddrOfTank,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(res) {
      setRate(longDataParser(bigIntToStrNum(res, 6)));
    },
  })

  const getSetting = ()=> {
    getOwner();
    getRegCenter();
    getCashier();
    getRate();
  }

  const [ cbpOfTank, setCbpOfTank ] = useState<string>('0');
  const {
    refetch: getCbpOfTank
  } = useRegCenterBalanceOf({
    address: AddrOfRegCenter,
    args: [ AddrOfTank ],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(amt) {
      setCbpOfTank( bigIntToStrNum(amt/(10n**9n), 9) );
    }
  })

  const [ sum, setSum ] = useState<string>('0');
  const {
    refetch: getSum
  } = useUsdFuelTankSum({
    address: AddrOfTank,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(res) {
      setSum( bigIntToStrNum(res / (10n**9n), 9) );
    },
  })

  const [ cbpOfUser, setCbpOfUser ] = useState<string>('0');
  const {
    refetch: getCbpOfUser
  } = useRegCenterBalanceOf({
    address: AddrOfRegCenter,
    args: signer ? [ signer.account.address ] : undefined,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(amt) {
      setCbpOfUser( amt.toString() );
    }
  })

  const [ usdcOfUser, setUsdcOfUser ] = useState<string>('0');
  const getUsdcOfUser = ()=>{
    if (signer) {
      balanceOfUsd(signer.account.address).then(
        res => setUsdcOfUser(res.toString())
      )
    }    
  }
  getUsdcOfUser();

  const getFinInfo = ()=>{
    getCbpOfTank();
    getSum();
    getCbpOfUser();
    getUsdcOfUser();
  }

  const [ open, setOpen ] = useState(false);

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', m:1, p:2, border:1, borderColor:'divider', width:'fit-content' }} >

      <Stack direction='row' sx={{alignItems:'center'}}>

        <Toolbar sx={{ textDecoration:'underline' }} >
          <b>Fuel Tank</b>
        </Toolbar>

        <CopyLongStrSpan title="Addr" src={AddrOfTank} />

      </Stack>

      {signer && (
        <table >
          <thead />

          <tbody>
            <tr>
              <td>
                <CopyLongStrTF title='Owner' src={owner.toLowerCase() ?? '-'} />
              </td>
              <td>
                <CopyLongStrTF title='RegCenter' src={regCenter.toLowerCase() ?? '-'} />
              </td>
              <td>
                <CopyLongStrTF title='Cashier' src={cashier.toLowerCase() ?? '-'} />
              </td>
            </tr>

            <tr>
              <td>
                <TextField 
                  size="small"
                  variant='outlined'
                  label='BalanceOfTank (CBP)'
                  inputProps={{readOnly: true}}
                  fullWidth
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ cbpOfTank }
                />
              </td>
              <td>
                <TextField 
                  size="small"
                  variant='outlined'
                  label='SumOfSold (CBP)'
                  inputProps={{readOnly: true}}
                  fullWidth
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ sum }
                />
              </td>
              <td>
                <TextField 
                  size="small"
                  variant='outlined'
                  label='Price (CBP/USD)'
                  inputProps={{readOnly: true}}
                  fullWidth
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ rate }
                />
              </td>
            </tr>

            <tr>
              <td colSpan={ 3 } >
                <Divider orientation="horizontal" sx={{ m:1 }} flexItem />
              </td>
            </tr>

            <tr>
              <td>
                <TextField 
                  size="small"
                  variant='outlined'
                  label='CbpOfUser (CBP)'
                  inputProps={{readOnly: true}}
                  fullWidth
                  sx={{
                    m:1,
                  }}
                  value={ getEthPart(cbpOfUser) }
                />
              </td>
              <td>
                <TextField 
                  size="small"
                  variant='outlined'
                  label='CbpOfUser (GLee)'
                  inputProps={{readOnly: true}}
                  fullWidth
                  sx={{
                    m:1,
                  }}
                  value={ getGWeiPart(cbpOfUser) }
                />
              </td>
              <td>
                <TextField 
                  size="small"
                  variant='outlined'
                  label='CbpOfUser (Lee)'
                  inputProps={{readOnly: true}}
                  fullWidth
                  sx={{
                    m:1,
                  }}
                  value={ getWeiPart(cbpOfUser) }
                />
              </td>
            </tr>

            <tr>
              <td>
                <TextField 
                  size="small"
                  variant='outlined'
                  label='UsdOfUser (Giga-USD)'
                  inputProps={{readOnly: true}}
                  fullWidth
                  sx={{
                    m:1,
                  }}
                  value = {longDataParser(
                    usdcOfUser.length > 15 ? usdcOfUser.substring(0, usdcOfUser.length - 15) : '0'
                  )}
                />
              </td>
              <td>
                <TextField 
                  size="small"
                  variant='outlined'
                  label='UsdOfUser (USD)'
                  inputProps={{readOnly: true}}
                  fullWidth
                  sx={{
                    m:1,
                  }}
                  value={ longDataParser(
                    usdcOfUser.length > 6 
                      ? usdcOfUser.length > 15
                        ? usdcOfUser.substring(usdcOfUser.length - 15, usdcOfUser.length - 6)
                        : usdcOfUser.substring(0, usdcOfUser.length - 6) 
                      : '0'
                  )}
                />
              </td>
              <td>
                <TextField 
                  size="small"
                  variant='outlined'
                  label='UsdOfUser (Micro-USD)'
                  inputProps={{readOnly: true}}
                  fullWidth
                  sx={{
                    m:1,
                  }}
                  value={ longDataParser(
                    usdcOfUser.length > 6
                  ? usdcOfUser.substring(usdcOfUser.length - 6)
                  : usdcOfUser
                  )}
                />
              </td>
            </tr>

            <tr>
              <td colSpan={ 3 } >
                <Divider orientation="horizontal" sx={{ m:1 }} flexItem />
              </td>
            </tr>

            <tr>
              <td colSpan={ 3 }>
                <ActionsOfFuel user={signer.account.address} isOwner={isOwner} getFinInfo={getFinInfo} getSetting={getSetting} />
              </td>
            </tr>

          </tbody>
        </table>
      )}

    </Paper>
  );
}

export default FuelTank;