import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { bigIntToStrNum, dateParser, splitStrArr } from "../../../common/toolsKit";
import { AddrZero, HexType } from "../../../common";
import { PickupUsd } from "./PickupUsd";
import { WithdrawUsd } from "./WithdrawUsd";
import { Dispatch, SetStateAction } from "react";
import { CopyLongStrTF } from "../../../common/CopyLongStr";
import { ItemLocker } from "../../../cl";

export interface HashLockerOfUsdProps{
  open: boolean,
  locker: ItemLocker,
  primeKey: HexType,
  setOpen: Dispatch<SetStateAction<boolean>>,
  refresh: () => void,
}

export function HashLockerOfUsd({open, locker, primeKey, setOpen, refresh}: HashLockerOfUsdProps) {

  return (
    <Dialog
      maxWidth={false}
      open={open}
      onClose={()=>setOpen(false)}
      aria-labelledby="dialog-title" 
    >
      <DialogTitle id="dialog-title" >
        {"USD Locker"}
      </DialogTitle>
      <DialogContent>
          <table width={1180} >
            <thead />
            <tbody>
              <tr>
                <td colSpan={3}>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfHashLock" 
                    label="HashLock" 
                    variant="outlined"
                    value = { locker.lock }
                    size='small'
                  />
                </td>
              </tr>

              <tr>
                <td >
                  <CopyLongStrTF title="From" src={locker.head.from} />
                </td>
                <td >
                  <CopyLongStrTF title="To" src={locker.head.to} />
                </td>
                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfExpireDate" 
                    label="ExpireDate" 
                    variant="outlined"
                    value = { dateParser(locker.head.expireDate.toString()) }
                    size='small'
                  />
                </td>                            
              </tr>

              <tr>
                <td colSpan={3} >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfAmount" 
                    label="Amount" 
                    variant="outlined"
                    value = { bigIntToStrNum(locker.head.amt, 6) }
                    size='small'
                  />
                </td>                            
              </tr>

              {locker.body.counterLocker != AddrZero && (
                <>
                <tr>
                  <td colSpan={2}>
                    <TextField 
                      fullWidth={true}
                      inputProps={{readOnly: true}}
                      sx={{ m: 1,  }} 
                      id="tfCounterLockerAddress" 
                      label="CounterLocker" 
                      variant="outlined"
                      value = { locker.body.counterLocker }
                      size='small'
                    />
                  </td>
                  <td>
                    <TextField 
                      fullWidth={true}
                      inputProps={{readOnly: true}}
                      sx={{ m: 1,  }} 
                      id="tfFunctionSelector" 
                      label="FunctionSelector" 
                      variant="outlined"
                      value = { locker.body.selector }
                      size='small'
                    />                  
                  </td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    <TextField 
                      fullWidth={true}
                      inputProps={{readOnly: true}}
                      sx={{ m: 1,  }} 
                      id="tfParas" 
                      label="Paras" 
                      variant="outlined"
                      value = { splitStrArr(locker.body.paras) }
                      multiline
                      rows={ locker.body.paras.length }
                      size='small'
                    />                  
                  </td>

                </tr>
                </>
              )}

              <tr>
                <td colSpan={3}>
                  {primeKey == locker.head.to && (
                    <PickupUsd hashLock={locker.lock} refresh={refresh} setOpen={setOpen} />
                  )}
                  {primeKey == locker.head.from && (
                    <WithdrawUsd hashLock={locker.lock} refresh={refresh} setOpen={setOpen} />
                  )}
                </td>
              </tr>

            </tbody>
          </table>

      </DialogContent>
      <DialogActions>
        <Button onClick={()=>setOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>

  )
}