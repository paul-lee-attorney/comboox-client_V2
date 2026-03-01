import { useState } from "react";

import { 
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, 
  Stack, TextField 
} from "@mui/material";
import { Close, Refresh, Settings } from "@mui/icons-material";

import { useAccount, useWalletClient } from "wagmi";

import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";

import { AddrOfRegCenter, AddrZero, HexType } from "../../common";
import { Rule, defaultRule } from "../../rc";
import { CopyLongStrTF } from "../../common/CopyLongStr";
import { getEthPart, getGEthPart, getGWeiPart, getWeiPart, 
  longDataParser, toPercent 
} from "../../common/toolsKit";

import { 
  useRegCenterCounterOfUsers, useRegCenterGetBookeeper, useRegCenterGetOwner, 
  useRegCenterGetPlatformRule, useRegCenterGetPriceFeed, useRegCenterTotalSupply 
} from "../../../../../generated";

import { ActionsOfOwner } from "./ActionsOfOwner";

export function CenterInfo() {

  const { setErrMsg } = useComBooxContext();

  const { isConnected } = useAccount();

  const { data:signer } = useWalletClient();

  const [ owner, setOwner ] = useState<HexType>(AddrZero);
  const [ keeper, setKeeper ] = useState<HexType>(AddrZero);
  const [ platformRule, setPlatformRule ] = useState<Rule>(defaultRule);
  const [ counterOfUsers, setCounterOfUsers ] = useState<number>(0);
  const [ totalSupply, setTotalSupply ] = useState<string>('0');
  const [ feedReg, setFeedReg ] = useState<HexType>(AddrZero);

  const {
    refetch: getOwner
  } = useRegCenterGetOwner({
    address: AddrOfRegCenter,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setOwner(data);
    }
  })

  const {
    refetch: getBookeeper
  } = useRegCenterGetBookeeper({
    address: AddrOfRegCenter,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setKeeper(data);
    }
  })

  const {
    refetch: getPlatformRule
  } = useRegCenterGetPlatformRule({
    address: AddrOfRegCenter,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setPlatformRule(data);
    }
  })

  const {
    refetch: getCounterOfUsers
  } = useRegCenterCounterOfUsers({
    address: AddrOfRegCenter,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setCounterOfUsers(data);
    }
  })

  const {
    refetch: getTotalSupply
  } = useRegCenterTotalSupply({
    address: AddrOfRegCenter,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setTotalSupply(data.toString());
    }
  })

  const {
    refetch: getFeedReg
  } = useRegCenterGetPriceFeed({
    address: AddrOfRegCenter,
    args: [BigInt(0)],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setFeedReg(data);
    }
  })


  const refresh = ()=>{
    getOwner();
    getBookeeper();
    getPlatformRule();
    getCounterOfUsers();
    getTotalSupply();
    getFeedReg();
  }

  const [ open, setOpen ] = useState(false);

  const handleClick = ()=> {
    setOpen(true);
  }

  return(
    <>
      <Button
        disabled={ !isConnected }
        variant="outlined"
        startIcon={<Settings />}
        sx={{ 
          m:1, width:488, height:40,
          '&.Mui-disabled': {
            color: 'primary.main',
            borderColor: 'primary.main',
          },
        }}
        onClick={ handleClick }      
      >
        Registration Center Info
      </Button>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title" sx={{ textDecoration:'underline' }}>
          <h3>RegCenter Info</h3>
        </DialogTitle>

        <DialogContent>

          <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', m:1, p:1, border:1, borderColor:'divider' }} >
            <table>
              <thead />

              <tbody>

                <tr>
                  <td>
                    <CopyLongStrTF title='Owner' src={owner.toLowerCase() ?? '-'} />
                  </td>
                  <td>
                    <CopyLongStrTF title='Keeper' src={keeper.toLowerCase() ?? '-'} />
                  </td>

                  <td>
                    <CopyLongStrTF title='FeedReg' src={feedReg.toLowerCase() ?? '-'} />
                  </td>

                  <td>
                    <TextField
                      size="small"
                      variant='outlined'
                      label='CounterOfUsers'
                      inputProps={{readOnly: true}}
                      fullWidth
                      sx={{
                        m:1,
                        minWidth:218,
                      }}
                      value={ longDataParser(counterOfUsers.toString() ?? '0') }
                    />
                  </td>
                </tr>

                <tr>
                  <td>
                    <TextField 
                      size="small"
                      variant='outlined'
                      label='TotalSupply (Giga-CBP)'
                      inputProps={{readOnly: true}}
                      fullWidth
                      sx={{
                        m:1,
                      }}
                      value={ getGEthPart(totalSupply) }
                    />
                  </td>
                  <td>
                    <TextField 
                      size="small"
                      variant='outlined'
                      label='TotalSupply (CBP)'
                      inputProps={{readOnly: true}}
                      fullWidth
                      sx={{
                        m:1,
                      }}
                      value={ getEthPart(totalSupply) }
                    />
                  </td>
                  <td>
                    <TextField 
                      size="small"
                      variant='outlined'
                      label='TotalSupply (GLee)'
                      inputProps={{readOnly: true}}
                      fullWidth
                      sx={{
                        m:1,
                      }}
                      value={ getGWeiPart(totalSupply) }
                    />
                  </td>
                  <td>
                    <TextField 
                      size="small"
                      variant='outlined'
                      label='TotalSupply (Lee)'
                      inputProps={{readOnly: true}}
                      fullWidth
                      sx={{
                        m:1,
                      }}
                      value={ getWeiPart(totalSupply) }
                    />
                  </td>
                </tr>

                <tr>
                  <td>
                    <TextField
                      size="small"
                      variant='outlined'
                      label='EOA_Rewards(CBP)'
                      inputProps={{readOnly: true}}
                      fullWidth
                      sx={{
                        m:1,
                        minWidth:218,
                      }}
                      value={ longDataParser((platformRule.eoaRewards / (10**9)).toFixed(4).toString()) }
                    />
                  </td>
                  <td>
                    <TextField
                      size="small"
                      variant='outlined'
                      label='COA_Rewards(CBP)'
                      inputProps={{readOnly: true}}
                      fullWidth
                      sx={{
                        m:1,
                        minWidth:218,
                      }}
                      value={ longDataParser((platformRule.coaRewards / (10**9)).toFixed(4).toString()) }
                    />
                  </td>
                  <td>
                    <TextField
                      size="small"
                      variant='outlined'
                      label='FloorOfRoyalty(CBP)'
                      inputProps={{readOnly: true}}
                      fullWidth
                      sx={{
                        m:1,
                        minWidth:218,
                      }}
                      value={ longDataParser((platformRule.floor / (10**9)).toFixed(9).toString()) }
                    />
                  </td>

                  <td>
                    <TextField
                      size="small"
                      variant='outlined'
                      label='RateOfCommission (%)'
                      inputProps={{readOnly: true}}
                      fullWidth
                      sx={{
                        m:1,
                        minWidth:218,
                      }}
                      value={ toPercent((2000 - (platformRule.rate ?? 0)).toString()) }
                    />
                  </td>

                </tr>

                {signer && (signer.account.address == owner || signer.account.address == keeper) && (
                  <tr>
                    <td colSpan={4}>
                      <ActionsOfOwner refresh={refresh} />
                    </td>
                  </tr>
                )}

              </tbody>
            </table>

          </Paper>

          </DialogContent>

          <DialogActions>
            <Stack direction='row' >
              <Button variant="outlined" sx={{ m:1, mx:3, minWidth:128 }} onClick={refresh} endIcon={<Refresh/>}>Refresh</Button>
              <Button variant="outlined" sx={{ m:1, mx:3, minWidth:128 }} onClick={()=>setOpen(false)} endIcon={<Close/>}>Close</Button>
            </Stack>
          </DialogActions>


        </Dialog>
    </>
  );
}