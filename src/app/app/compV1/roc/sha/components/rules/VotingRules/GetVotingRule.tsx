
import { useState } from "react";


import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, } from "@mui/material";
import { ListAlt } from "@mui/icons-material";

import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

import { useRegisterOfConstitutionPointer } from "../../../../../../../../../generated-v1";
import { AddrZero, Bytes32Zero, booxMap } from "../../../../../../common";
import { toPercent } from "../../../../../../common/toolsKit";
import { getRule } from "../../../sha";

import { VotingRule, authorities, vrParser } from "./SetVotingRule";

interface GetVotingRuleProps{
  seq: number;
}

export function GetVotingRule({seq}: GetVotingRuleProps) {
  const { boox, setErrMsg } = useComBooxContext();

  const [ objVr, setObjVr] = useState<VotingRule>();
  const [ open, setOpen ] = useState(false);
  
  useRegisterOfConstitutionPointer({
    address: boox ? boox[booxMap.ROC] : undefined,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(res) {
      if (res != AddrZero)
        getRule(res, seq).then(
          rule => {
            if (rule != Bytes32Zero) 
                setObjVr(vrParser(rule));
          }
        )
    }
  })

  const handleClick = ()=> {
    setOpen(true);
  }

  return (
    <>
      {objVr && (
        <Button
          variant="outlined"
          startIcon={<ListAlt />}
          fullWidth={true}
          sx={{ m:1, height:40 }}
          onClick={ handleClick }      
        >
          VotingRule: No. {seq}
        </Button>
      )}

      {objVr && (
        <Dialog
          maxWidth={false}
          open={open}
          onClose={()=>setOpen(false)}
          aria-labelledby="dialog-title"
        >
          <DialogTitle id="dialog-title" sx={{ textDecoration:'underline' }}>
            <h4>Voting Rule - No. {seq} ({objVr.seqOfSubRule} / {objVr.qtyOfSubRule})</h4>
          </DialogTitle>

          <DialogContent>

            <Paper elevation={3} sx={{
              alignContent:'center', 
              justifyContent:'center', 
              p:1, m:1, 
              border: 1, 
              borderColor:'divider' 
              }} 
            >

              <Stack 
                direction={'column'} 
                spacing={1} 
              >

                <Stack direction={'row'} sx={{ alignItems: 'center' }} >
                  {objVr && (
                    <TextField 
                      variant='outlined'
                      label='Authority'
                      inputProps={{readOnly: true}}
                      size="small"
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      value={ authorities[Number(objVr.authority) - 1] }
                    />
                  )}

                  {Number(objVr.headRatio) != 0 && (
                    <TextField 
                      variant='outlined'
                      label='HeadRatio'
                      inputProps={{readOnly: true}}
                      size="small"
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      value={toPercent(objVr.headRatio.toString())}
                    />
                  )}

                  {Number(objVr.amountRatio) != 0 && (
                    <TextField 
                      variant='outlined'
                      label='AmountRatio (%)'
                      inputProps={{readOnly: true}}
                      size="small"
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      value={ objVr.amountRatio }
                    />
                  )}

                </Stack>

                <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                  <TextField 
                    variant='outlined'
                    label='OnlyAttendance ?'
                    inputProps={{readOnly: true}}
                    size="small"
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    value={objVr.onlyAttendance ? 'True' : 'False'}
                  />

                  {objVr.impliedConsent && (
                    <TextField 
                      variant='outlined'
                      label='ImpliedConsent ?'
                      inputProps={{readOnly: true}}
                      size="small"
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      value={objVr.impliedConsent ? 'True' : 'False'}
                    />
                  )}

                  <TextField 
                    variant='outlined'
                    label='PartyAsConsent ?'
                    inputProps={{readOnly: true}}
                    size="small"
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    value={objVr.partyAsConsent ? 'True' : 'False'}
                  />

                  {objVr.againstShallBuy && (
                    <TextField 
                      variant='outlined'
                      label='AgainstShallBuy ?'
                      inputProps={{readOnly: true}}
                      size="small"
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      value={objVr.againstShallBuy ? 'True' : 'False'}
                    />
                  )}

                </Stack>

                <Stack direction={'row'} sx={{ alignItems: 'center' }} >
                  {objVr.vetoers[0] != '0' && (
                    <TextField 
                      variant='outlined'
                      label='Vetoer_1'
                      inputProps={{readOnly: true}}
                      size="small"
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      value={objVr.vetoers[0]}
                    />
                  )}

                  {objVr.vetoers[1] != '0' && (
                    <TextField 
                      variant='outlined'
                      label='Vetoer_2'
                      inputProps={{readOnly: true}}
                      size="small"
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      value={objVr.vetoers[1]}
                    />
                  )}

                </Stack>

                <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                  {objVr.frExecDays != '0' && (
                    <TextField 
                      variant='outlined'
                      label='FRExecDays'
                      inputProps={{readOnly: true}}
                      size="small"
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      value={objVr.frExecDays}
                    />
                  )}

                  {objVr.dtExecDays != '0' && (
                    <TextField 
                      variant='outlined'
                      label='DTExecDays'
                      inputProps={{readOnly: true}}
                      size="small"
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      value={objVr.dtExecDays}
                    />
                  )}

                  {objVr.dtConfirmDays != '0' && (
                    <TextField 
                      variant='outlined'
                      label='DTConfirmDays'
                      inputProps={{readOnly: true}}
                      size="small"
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      value={objVr.dtConfirmDays}
                    />
                  )}

                </Stack>

                <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                  {objVr.invExitDays != '0' && (
                    <TextField 
                      variant='outlined'
                      label='InvExitDays'
                      inputProps={{readOnly: true}}
                      size="small"
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      value={objVr.invExitDays}
                    />
                  )}

                  {objVr.votePrepareDays != '0' && (
                    <TextField 
                      variant='outlined'
                      label='VotePrepareDays'
                      inputProps={{readOnly: true}}
                      size="small"
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      value={objVr.votePrepareDays}
                    />
                  )}

                  <TextField 
                    variant='outlined'
                    label='VotingDays'
                    inputProps={{readOnly: true}}
                    size="small"
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    value={objVr.votingDays}
                  />

                  {objVr.execDaysForPutOpt != '0' && (
                    <TextField 
                      variant='outlined'
                      label='ExecDaysForPutOpt'
                      inputProps={{readOnly: true}}
                      size="small"
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      value={objVr.execDaysForPutOpt}
                    />
                  )}
                  
                </Stack>

              </Stack>

            </Paper>

          </DialogContent>

          <DialogActions>
            <Button variant="outlined" sx={{ m:1, mx:3 }} onClick={()=>setOpen(false)}>Close</Button>
          </DialogActions>
    
        </Dialog>

      )}
    </>
  );
}