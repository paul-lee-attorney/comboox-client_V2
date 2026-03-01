import { Button, Chip, Dialog, DialogActions, DialogContent, Paper, TextField, Toolbar, Typography } from "@mui/material";
import { Dispatch, SetStateAction,  } from "react";
import { dateParser, longDataParser } from "../../../common/toolsKit";

import { InfoOfFile } from "./filesFolder";

import { CopyLongStrSpan, CopyLongStrTF } from "../../../common/CopyLongStr";

import { GetVotingRule } from "../sha/components/rules/VotingRules/GetVotingRule";

import { labState } from "./GetFilesList";

export interface IndexCardProps{
  file: InfoOfFile;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function IndexCard({file, open, setOpen}: IndexCardProps) {

  return (
    <Dialog
      maxWidth={false}
      open={open}
      onClose={()=>setOpen(false)}
      aria-labelledby="dialog-title"
      sx={{m:1, p:1}} 
    >
      <DialogContent>
        <Paper elevation={3} sx={{m:1, p:1, }} >
          <table width={880} >
            <thead> 
              <tr>
                <td >
                  <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
                    <b>Index Card</b>
                  </Typography>
                </td>
                <td>
                  <CopyLongStrSpan title="Addr" src={file.addr}  />
                </td>
                <td>
                </td>
                <td>
                  <Chip 
                    variant='filled'
                    label={ 
                      labState[(file.head.state ?? 1) - 1]
                    } 
                    sx={{width: 128}}
                    color={
                      file.head.state == 6
                      ? 'success'
                      : file.head.state == 5
                        ? 'error'
                        : file.head.state == 4
                          ? 'info'
                          : file.head.state == 3
                            ? 'secondary'
                            : file.head.state == 2
                              ? 'primary'
                              : file.head.state == 1
                                ? 'warning'
                                : 'default'
                    }
                  />
                </td>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  <CopyLongStrTF title="Sn:" src={file.sn} />
                </td>            
                <td>
                  <CopyLongStrTF title="Url:" src={file.ref.docUrl} />
                </td>            
                <td>
                  <CopyLongStrTF title="Hash:" src={file.ref.docHash} />
                </td>
                <td>
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m:1 }} 
                    id="tfCirculateDate" 
                    label="CirculateDate" 
                    variant="outlined"
                    value = { dateParser(file.head.circulateDate.toString()) }
                    size='small'
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m:1 }} 
                    id="tfSigningDeadline" 
                    label="SigningDeadline" 
                    variant="outlined"
                    value = { dateParser((file.head.circulateDate + file.head.signingDays * 86400).toString()) }
                    size='small'
                  />
                </td>
                <td>
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m:1 }} 
                    id="tfFrExecDeadline" 
                    label="FirstRefusal Claim Deadline" 
                    variant="outlined"
                    value = { dateParser((file.head.circulateDate + (file.head.signingDays + file.head.frExecDays) * 86400).toString()) }
                    size='small'
                  />
                </td>
                <td>
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m:1 }} 
                    id="tfDtExecDeadline" 
                    label="Drag/Tag Deadline" 
                    variant="outlined"
                    value = { dateParser((file.head.circulateDate + (file.head.signingDays + file.head.frExecDays 
                      + file.head.dtExecDays) * 86400).toString()) }
                    size='small'
                  />
                </td>
                <td>
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m:1 }} 
                    id="tfDtConfirmDeadline" 
                    label="FR/DT Confirm Deadline" 
                    variant="outlined"
                    value = { dateParser((file.head.circulateDate + (file.head.signingDays + file.head.frExecDays 
                      + file.head.dtExecDays + file.head.dtConfirmDays) * 86400).toString()) }
                    size='small'
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m:1 }} 
                    id="tfProposeDate" 
                    label="ProposeDate" 
                    variant="outlined"
                    value = { dateParser(file.head.proposeDate.toString()) }
                    size='small'
                  />
                </td>
                <td>
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m:1 }} 
                    id="tfShareRegDate" 
                    label="ShareRegDate" 
                    variant="outlined"
                    value = { dateParser((file.head.proposeDate + file.head.invExitDays * 86400).toString()) }
                    size='small'
                  />
                </td>
                <td>
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m:1 }} 
                    id="tfVoteStartDate" 
                    label="VoteStartDate" 
                    variant="outlined"
                    value = { dateParser((file.head.proposeDate + (file.head.invExitDays + file.head.votePrepareDays) * 86400).toString()) }
                    size='small'
                  />
                </td>
                <td>
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m:1 }} 
                    id="tfVoteEndDate" 
                    label="VoteEndDate" 
                    variant="outlined"
                    value = { dateParser((file.head.proposeDate + (file.head.invExitDays + file.head.votePrepareDays + file.head.votingDays) * 86400).toString()) }
                    size='small'
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <GetVotingRule seq={file.head.seqOfVR} />
                </td>
                <td>
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m:1 }} 
                    id="tfSeqOfMotion" 
                    label="SeqOfMotion" 
                    variant="outlined"
                    value = { longDataParser( file.head.seqOfMotion.toString() ) }
                    size='small'
                  />
                </td>
                <td>
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m:1 }} 
                    id="tfPutOptionDeadline" 
                    label="PutOptionDeadline" 
                    variant="outlined"
                    value = { dateParser((file.head.proposeDate + (file.head.invExitDays + file.head.votePrepareDays + file.head.votingDays + file.head.execDaysForPutOpt) * 86400).toString()) }
                    size='small'
                  />
                </td>
                <td>
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m:1 }} 
                    id="tfClosingDeadline" 
                    label="ClosingDeadline" 
                    variant="outlined"
                    value = { dateParser((file.head.circulateDate + file.head.closingDays * 86400).toString()) }
                    size='small'
                  />
                </td>
              </tr>

            </tbody>
          </table>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" sx={{ m:1, mx:3 }} onClick={()=>setOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>

  )
}