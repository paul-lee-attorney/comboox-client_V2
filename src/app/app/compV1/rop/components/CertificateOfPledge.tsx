import { 
  Button, 
  Chip, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Stack, 
  TextField 
} from "@mui/material";

import { baseToDollar, dateParser, longSnParser } from "../../../common/toolsKit";
import { Pledge } from "../rop";
import { statesOfPld } from "./PledgesList";
import { ActionsOfPledge } from "./ActionsOfPledge";
import { Dispatch, SetStateAction } from "react";

export interface CertificateOfPledgeProps{
  open: boolean;
  pld: Pledge;
  setOpen: Dispatch<SetStateAction<boolean>>;
  refresh: ()=>void;
}

export function CertificateOfPledge({open, pld, setOpen, refresh}: CertificateOfPledgeProps) {

  return (
    <Dialog
      maxWidth={false}
      open={open}
      onClose={()=>setOpen(false)}
      aria-labelledby="dialog-title" 
    >
      <Stack direction='row' sx={{ alignItems:'center', justifyContent:'space-between' }} >
        <DialogTitle id="dialog-title" sx={{ m:1, textDecoration:'underline' }} >
          <b>Deed Of Pledge</b> 
        </DialogTitle>
        <Chip
          sx={{ m:1, mr:5, width: 120 }} 
          label={ statesOfPld[pld.head.state] } 
          variant='filled' 
          color={
            pld.head.state == 0
            ? 'default'
            : pld.head.state == 1
              ? 'primary'
              : pld.head.state == 2
                ? 'warning'
                : pld.head.state == 3
                  ? 'success'
                  : pld.head.state == 4
                    ? 'info'
                    : pld.head.state == 5
                      ? 'error'
                      : 'default'
          } 
        />  
      </Stack>                
      <DialogContent>
          <table width={980} >
            <thead />
            <tbody>
              <tr>
                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfSeqOfShare" 
                    label="SeqOfCert" 
                    variant="outlined"
                    value = { longSnParser(pld.head.seqOfShare.toString()) }
                    size='small'
                  />
                </td>
                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfSeqOfPld" 
                    label="SeqOfPld" 
                    variant="outlined"
                    value = { pld.head.seqOfPld.toString() }
                    size='small'
                  />
                </td>
                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfStateOfPld" 
                    label="StateOfPld" 
                    variant="outlined"
                    value = { statesOfPld[pld.head.state] }
                    size='small'
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfCreateDate" 
                    label="CreateDate" 
                    variant="outlined"
                    value = { dateParser(pld.head.createDate.toString()) }
                    size='small'
                  />
                </td>
                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfTriggerDate" 
                    label="TriggerDate" 
                    variant="outlined"
                    value = { dateParser((pld.head.createDate + pld.head.daysToMaturity * 86400).toString()) }
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
                    value = { dateParser((pld.head.createDate + (pld.head.daysToMaturity + pld.head.guaranteeDays) * 86400).toString()) }
                    size='small'
                  />                  
                </td>
              </tr>

              <tr>
                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1,  }} 
                    id="tfCreditor" 
                    label="Creditor" 
                    variant="outlined"
                    value = { longSnParser(pld.head.creditor.toString()) }
                    size='small'
                  />
                </td>
                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1,  }} 
                    id="tfDebtor" 
                    label="Debtor" 
                    variant="outlined"
                    value = { longSnParser(pld.head.debtor.toString()) }
                    size='small'
                  />
                </td>
                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1,  }} 
                    id="tfPledgor" 
                    label="Pledgor" 
                    variant="outlined"
                    value = { longSnParser(pld.head.pledgor.toString()) }
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
                    id="tfPledgedPaid" 
                    label="PledgedPaid" 
                    variant="outlined"
                    value = { baseToDollar(pld.body.paid.toString()) }
                    size='small'
                  />                
                </td>
                <td >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfPledgedPar" 
                    label="PledgedPar" 
                    variant="outlined"
                    value = { baseToDollar(pld.body.par.toString()) }
                    size='small'
                  />                
                </td>
                <td >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfGuaranteedAmount" 
                    label="GuaranteedAmount" 
                    variant="outlined"
                    value = { baseToDollar(pld.body.guaranteedAmt.toString()) }
                    size='small'
                  />                
                </td>
              </tr>

              <tr>
                <td colSpan={3}>
                  <ActionsOfPledge 
                    pld={pld}
                    setOpen={setOpen} 
                    refresh={refresh} 
                  />
                </td>
              </tr>

            </tbody>
          </table>

      </DialogContent>
      <DialogActions>
        <Button variant="outlined" sx={{ m:1, mx:3 }} onClick={()=>setOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>

  )
}