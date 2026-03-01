"use client"

import { useEffect, useState } from "react";
import { AddrOfCL } from "../common";
import { StrLocker, User, balanceOf, balanceOfWei, defaultStrLocker, getLockersList, getUser, isOwnerOfRegCenter } from "../rc";

import { Divider, Paper, TextField, Toolbar } from "@mui/material";
import { longDataParser, longSnParser, toPercent } from "../common/toolsKit";
import { useWalletClient } from "wagmi";

import { LockersList } from "./components/lockers/LockersList";
import { HashLockerOfPoints } from "./components/lockers/HashLockerOfPoints";
import { CopyLongStrTF } from "../common/CopyLongStr";
import { ActionsOfUser } from "./components/ActionsOfUser";
import { useComBooxContext } from "../../_providers/ComBooxContextProvider";
import { balanceOfUsd } from "../usdc";
import { UsdLockersList } from "./components/UsdLockers/UsdLockersList";
import { HashLockerOfUsd } from "./components/UsdLockers/HashLockerOfUsd";
import { defaultItemLocker, getUsdLockersList, ItemLocker } from "../cl";

function UserInfo() {

  const { userNo, boox } = useComBooxContext();

  const [ time, setTime ] = useState<number>(0);

  const refresh = ()=>{
    setTime(Date.now());
  }

  const [ user, setUser ] = useState<User>();
  const { data: signer } = useWalletClient();

  useEffect(()=>{
    if (signer) {
      getUser(signer).then(
        res => {
          setUser(res);
        }
      )
    }
  }, [signer, time]);
    
  const [ isOwner, setIsOwner ] = useState(false);

  useEffect(()=>{
    if (signer) {
      isOwnerOfRegCenter(signer.account.address).then(
        res => {
          setIsOwner(res);
        }
      )
    }
  }, [signer, time]);

  const [ lockersList, setLockersList ] = useState<StrLocker[]>();

  useEffect(()=>{
    getLockersList().then(
      res => {
        setLockersList(res);
      }
    )
  }, [time]);

  const [ usdLockersList, setUsdLockersList ] = useState<ItemLocker[]>();

  useEffect(()=>{
    getUsdLockersList(AddrOfCL).then(
      list => {
        setUsdLockersList(list);
      }
    )
  }, [boox, time]);

  const [ balance, setBalance ] = useState<string>('0');

  useEffect(()=>{
    if (user) {
      balanceOf(user.primeKey.pubKey, undefined).then(
        res => {
          setBalance(res.toString());
        }
      )
    }
  }, [user, time]);

  const [ balanceOfETH, setBalanceOfETH ] = useState<string>('0');

  useEffect(()=>{
    if (user) {
      balanceOfWei(user.primeKey.pubKey).then(
        wei => setBalanceOfETH(wei.toString())
      )
    }
  }, [user, time]);

  const [ balanceOfUSD, setBalanceOfUSD ] = useState<string>('0');
 
  useEffect(()=>{
    if (user) {
      balanceOfUsd(user.primeKey.pubKey).then(
        res => {
          setBalanceOfUSD(res.toString());
        }
      )
    }
  }, [user, time]);
  
  const [ open, setOpen ] = useState(false);  
  const [ locker, setLocker ] = useState<StrLocker>(defaultStrLocker);
  const [ showList, setShowList ] = useState(false);

  const [ openUsdLocker, setOpenUsdLocker ] = useState(false);  
  const [ usdLocker, setUsdLocker ] = useState<ItemLocker>(defaultItemLocker);
  const [ showUsdList, setShowUsdList ] = useState(false);

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', m:1, p:1, border:1, borderColor:'divider' }} >
      <Toolbar sx={{ textDecoration:'underline' }} >
        <h3>User Info - ( No. { longSnParser(userNo?.toString() ?? '0') } ) </h3>
      </Toolbar>

      <table >
        <thead />

        <tbody>
        {userNo && (
          <>
          <tr>
            <td>
              <CopyLongStrTF title='PrimeKey' src={user?.primeKey.pubKey.toLowerCase() ?? '-'} />
            </td>
            <td>
              <TextField 
                size="small"
                variant='outlined'
                label='isCOA ?'
                inputProps={{readOnly: true}}
                fullWidth
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                value={ user?.primeKey.discount == 1 ? 'True' : 'False' }
              />
            </td>
            <td>
              <TextField 
                size="small"
                variant='outlined'
                label='RegRewards(GLee)'
                inputProps={{readOnly: true}}
                fullWidth
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                value={ longDataParser(user?.primeKey.gift.toString() ?? '0') }
              />
            </td>
            <td>
              <TextField 
                size="small"
                variant='outlined'
                label='CounterOfVerify'
                inputProps={{readOnly: true}}
                fullWidth
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                value={ longDataParser( user?.primeKey.coupon.toString() ?? '0' ) }
              />
            </td>

          </tr>

          <tr>
            <td>
              <CopyLongStrTF title='BackupKey' src={ user?.backupKey.pubKey.toLowerCase() ?? '-' } />
            </td>
            <td>
              <TextField 
                size="small"
                variant='outlined'
                label='DiscountRate'
                inputProps={{readOnly: true}}
                fullWidth
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                value={ toPercent(user?.backupKey.discount.toString() ?? '0') }
              />
            </td>
            <td>
              <TextField 
                size="small"
                variant='outlined'
                label='GiftAmt(CBP)'
                inputProps={{readOnly: true}}
                fullWidth
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                value={ longDataParser((Number(user?.backupKey.gift ?? '0') / (10**9)).toString()) }
              />
            </td>
            <td>
              <TextField 
                size="small"
                variant='outlined'
                label='CouponAmt(CBP)'
                inputProps={{readOnly: true}}
                fullWidth
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                value={ longDataParser((Number(user?.backupKey.coupon ?? '0') / (10**9)).toString()) }
              />
            </td>
          </tr>

          <tr>
            <td colSpan={ 4 } >
              <Divider orientation="horizontal" sx={{ m:1 }} flexItem />
            </td>
          </tr>

          <tr>

            <td>
              <TextField 
                  size="small"
                  variant='outlined'
                  label='(Giga-USD)'
                  inputProps={{
                    readOnly: true,
                    style: { textAlign: "right" },
                  }}
                  color = "primary"
                  focused
                  sx={{
                    m:0.5,
                    width: 118,
                  }}
                  value = {longDataParser(
                    balanceOfUSD.length > 15 ? balanceOfUSD.substring(0, balanceOfUSD.length - 15) : '0'
                  )}
              />
              <TextField 
                  size="small"
                  variant='outlined'
                  label='(USD)'
                  inputProps={{
                    readOnly: true,
                    style: { textAlign: "right" },
                  }}
                  color = "primary"
                  focused
                  sx={{
                    m:0.5,
                    width: 118,
                  }}
                  value={ longDataParser(
                    balanceOfUSD.length > 6 
                      ? balanceOfUSD.length > 15
                        ? balanceOfUSD.substring(balanceOfUSD.length - 15, balanceOfUSD.length - 6)
                        : balanceOfUSD.substring(0, balanceOfUSD.length - 6) 
                      : '0'
                  )}
              />
              <TextField 
                  size="small"
                  variant='outlined'
                  label='(Micro-USD)'
                  inputProps={{
                    readOnly: true,
                  }}
                  color = "primary"
                  focused
                  sx={{
                    m:0.5,
                    width: 118,
                  }}
                  value={ longDataParser(
                    balanceOfUSD.length > 6
                  ? balanceOfUSD.substring(balanceOfUSD.length - 6)
                  : balanceOfUSD
                  )}
              />

            </td>

            <td>
              <TextField 
                size="small"
                variant='outlined'
                label='(ETH)'
                inputProps={{
                  readOnly: true,
                  style: { textAlign: "right" }
                }}
                color = "success"
                focused
                sx={{
                  m:0.5,
                  width: 118,
                }}
                value={ longDataParser(
                    balanceOfETH.length > 18 
                  ? balanceOfETH.length > 27
                    ? balanceOfETH.substring(balanceOfETH.length - 27, balanceOfETH.length - 18)
                    : balanceOfETH.substring(0, balanceOfETH.length - 18) 
                  : '0') }
              />
              <TextField 
                size="small"
                variant='outlined'
                label='(GWei)'
                inputProps={{readOnly: true}}
                color = "success"
                focused
                sx={{
                  m:0.5,
                  width: 118,
                }}
                value={ longDataParser(
                    balanceOfETH.length > 9 
                  ? balanceOfETH.length > 18
                    ? balanceOfETH.substring(balanceOfETH.length - 18, balanceOfETH.length - 9)
                    : balanceOfETH.substring(0, balanceOfETH.length - 9) 
                  : '0') }
              />

              <TextField 
                size="small"
                variant='outlined'
                label='(Wei)'
                inputProps={{readOnly: true}}
                fullWidth
                color = "success"
                focused
                sx={{
                  m:0.5,
                  width: 118,
                }}
                value={ longDataParser(
                    balanceOfETH.length > 9
                  ? balanceOfETH.substring(balanceOfETH.length - 9)
                  : balanceOfETH
                )}
              />            

            </td>

            <td>
              <TextField 
                size="small"
                variant='outlined'
                label='(CBP)'
                inputProps={{
                  readOnly: true,
                  style: { textAlign:'right' }
                }}
                fullWidth
                color = "primary"
                focused
                sx={{
                  m:0.5,
                  width: 118,
                }}
                value={ longDataParser(
                    balance.length > 18 
                  ? balance.length > 27
                    ? balance.substring(balance.length - 27, balance.length - 18)
                    : balance.substring(0, balance.length - 18) 
                  : '0') }
              />

              <TextField 
                size="small"
                variant='outlined'
                label='(GLee)'
                inputProps={{readOnly: true}}
                fullWidth
                color = "primary"
                focused
                sx={{
                  m:0.5,
                  width: 118,
                }}
                value={ longDataParser(
                    balance.length > 9 
                  ? balance.length > 18
                    ? balance.substring(balance.length - 18, balance.length - 9)
                    : balance.substring(0, balance.length - 9) 
                  : '0') }
              /> 

              <TextField 
                size="small"
                variant='outlined'
                label='(Lee)'
                inputProps={{readOnly: true}}
                fullWidth
                color = "primary"
                focused
                sx={{
                  m:0.5,
                  width: 118,
                }}
                value={ longDataParser(
                    balance.length > 9
                  ? balance.substring(balance.length - 9)
                  : balance
                )}
              />
            </td>

          </tr>



          <tr>
            <td colSpan={ 5 } >
              <Divider orientation="horizontal" sx={{ m:1 }} flexItem />
            </td>
          </tr>
          </>
        )}

          <tr>
            <td colSpan={ 5 }>
              {userNo && (
                <ActionsOfUser user={user} isOwner={isOwner} showList={showList} showUsdList={showUsdList} setShowList={setShowList} setShowUsdList={setShowUsdList} refresh={refresh} />
              )}
            </td>
          </tr>

          <tr>
            <td colSpan={ 5 }>
              {lockersList && userNo && showList && (
                <LockersList list={ lockersList } setLocker={ setLocker } setOpen={ setOpen } />
              )}
            </td>
          </tr>

          <tr>
            <td colSpan={ 5 }>
              {locker && userNo && (
                <HashLockerOfPoints open={ open } locker={ locker } userNo={ userNo } setOpen={ setOpen } refresh={ refresh } />
              )}
            </td>
          </tr>

          <tr>
            <td colSpan={ 5 }>
              {usdLockersList && userNo && showUsdList && (
                <UsdLockersList list={ usdLockersList } setLocker={ setUsdLocker } setOpen={ setOpenUsdLocker} />
              )}
            </td>
          </tr>

          <tr>
            <td colSpan={ 5 }>
              {usdLocker && user && (
                <HashLockerOfUsd open={ openUsdLocker } locker={ usdLocker } primeKey={ user.primeKey.pubKey } setOpen={ setOpenUsdLocker } refresh={ refresh } />
              )}
            </td>
          </tr>

        </tbody>
      </table>
    </Paper>
  );
}

export default UserInfo;