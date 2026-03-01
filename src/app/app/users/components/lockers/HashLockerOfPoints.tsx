import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { StrLocker } from "../../../rc";
import { bigIntToStrNum, dateParser, longSnParser, splitStrArr } from "../../../common/toolsKit";
import { AddrZero } from "../../../common";
import { PickupPoints } from "./PickupPoints";
import { WithdrawPoints } from "./WithdrawPoints";
import { Dispatch, SetStateAction } from "react";

export interface HashLockerOfPointsProps{
  open: boolean,
  locker: StrLocker,
  userNo: number,
  setOpen: Dispatch<SetStateAction<boolean>>,
  refresh: () => void,
}

export function HashLockerOfPoints({open, locker, userNo, setOpen, refresh}: HashLockerOfPointsProps) {

  return (
    <Dialog
      maxWidth={false}
      open={open}
      onClose={()=>setOpen(false)}
      aria-labelledby="dialog-title" 
    >
      <DialogTitle id="dialog-title" >
        {"Hash Locker of ComBooxPoints"}
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
                    value = { locker.hashLock }
                    size='small'
                  />
                </td>
              </tr>

              <tr>
                <td >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfFrom" 
                    label="From" 
                    variant="outlined"
                    value = { longSnParser(locker.head.from.toString()) }
                    size='small'
                  />
                </td>
                <td >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfTo" 
                    label="To" 
                    variant="outlined"
                    value = { longSnParser(locker.head.to.toString()) }
                    size='small'
                  />
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
                <td colSpan={3}>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfAmount" 
                    label="Amount" 
                    variant="outlined"
                    value = { bigIntToStrNum(BigInt(locker.head.value), 9) }
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
                      label="CounterLockerAddress" 
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
                  {userNo == Number(locker.head.to) && (
                    <PickupPoints hashLock={locker.hashLock} refresh={refresh} setOpen={setOpen} />
                  )}
                  {userNo == Number(locker.head.from) && (
                    <WithdrawPoints hashLock={locker.hashLock} refresh={refresh} setOpen={setOpen} />
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