
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, 
  Grid, Paper, Stack, TextField, Toolbar, Typography } from "@mui/material";

import { GetVotingRule } from "../../roc/sha/components/rules/VotingRules/GetVotingRule";
import { GetPosition } from "../../rod/components/GetPosition";
import Link from "next/link";

import { HexType, booxMap } from "../../../common";

import { Article } from "@mui/icons-material";
import { dateParser, longSnParser } from "../../../common/toolsKit";
import { Motion, motionType, statesOfMotion, voteEnded } from "../../gmm/meetingMinutes";
import { getSnOfFile } from "../../roc/components/filesFolder";
import { VoteResult } from "../../gmm/components/VoteResult";
import { ActionsOnMotionOfBoard } from "./ActionsOnMotionOfBoard";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";
import MotionDownloader from "../../../components/file_storage/MotionDownloader";

export interface ApprovalFormOfBoardMotionProps{
  minutes: HexType;
  open: boolean;
  motion: Motion;
  setOpen: Dispatch<SetStateAction<boolean>>;
  refresh: ()=>void;
}

export function ApprovalFormOfBoardMotion({minutes, open, motion, setOpen, refresh }: ApprovalFormOfBoardMotionProps) {

  const { boox } = useComBooxContext();

  const [ addrOfDoc, setAddrOfDoc ]=useState<HexType>();
  const [ snOfDoc, setSnOfDoc ] = useState<string>();

  useEffect(()=>{
    setAddrOfDoc(`0x${motion.contents.toString(16).padStart(66, '0').substring(26, 66)}`);
    if (boox && addrOfDoc && motion.head.seqOfVR < 9) {
      let folder:HexType = motion.head.seqOfVR == 8
                          ? boox[booxMap.ROC] : boox[booxMap.ROA];
      getSnOfFile(folder, addrOfDoc).then(
        sn => setSnOfDoc(sn)
      );
    }
  }, [motion, addrOfDoc, boox]);

  const [voteIsEnd, setVoteIsEnd] = useState<boolean>(false);

  useEffect(()=>{
    voteEnded(minutes, motion.head.seqOfMotion).then(
      res => {
        setVoteIsEnd(res);
      }
    )
  }, [minutes, motion]);

  return (
    <Dialog
      maxWidth={false}
      open={open}
      onClose={()=>setOpen(false)}
      aria-labelledby="dialog-title"
      sx={{m:1, p:1}} 
    >
      <DialogTitle id="dialog-title" sx={{ textDecoration:'underline' }}>
        <Typography variant="h5">
          <b>Approval Form of Motion</b>
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }} >

          <Stack direction='row' sx={{ alignItems:'center', justifyContent:'space-between' }} >

            <Stack direction='row' >

              <Toolbar sx={{ color:'black', textDecoration:'underline' }}>
                <b>Motion of Board Meeting - {motionType[motion.head.typeOfMotion-1]}</b>
              </Toolbar>

              <MotionDownloader motion={motion} />

            </Stack>

            <Toolbar sx={{ color:'black', textDecoration:'underline' }} >
                No. ({longSnParser(motion.head.seqOfMotion.toString())})
            </Toolbar>
          </Stack>
            
          <Grid container direction='row' spacing={2} >
            <Grid item xs={3}>
              <TextField 
                fullWidth={true}
                inputProps={{readOnly: true}}
                sx={{ m: 1 }} 
                id="tfCreator" 
                label="Creator" 
                variant="outlined"
                value = { longSnParser(motion.head.creator.toString()) }
                size='small'
              />
            </Grid>
            <Grid item xs={3}>
              <TextField 
                fullWidth={true}
                inputProps={{readOnly: true}}
                sx={{ m: 1 }} 
                id="tfCreateDate" 
                label="CreateDate" 
                variant="outlined"
                value = { dateParser(motion.head.createDate.toString()) }
                size='small'
              />
            </Grid>
            <Grid item xs={3}>
              <TextField 
                fullWidth={true}
                inputProps={{readOnly: true}}
                sx={{ m: 1 }} 
                id="tfProposer" 
                label="Proposer" 
                variant="outlined"
                value = { longSnParser(motion.body.proposer.toString()) }
                size='small'
              />
            </Grid>
            <Grid item xs={3}>
              <TextField 
                fullWidth={true}
                inputProps={{readOnly: true}}
                sx={{ m: 1 }} 
                id="tfProposeDate" 
                label="ProposeDate" 
                variant="outlined"
                value = { dateParser(motion.body.proposeDate.toString()) }
                size='small'
              />
            </Grid>
          </Grid>

          {motion.body.state > 1 && (
            <Grid container direction='row' spacing={2} >
              <Grid item xs={3}>
                <TextField 
                  fullWidth={true}
                  inputProps={{readOnly: true}}
                  sx={{ m: 1 }} 
                  id="tfShareRegDate" 
                  label="ShareRegDate" 
                  variant="outlined"
                  value = { dateParser(motion.body.shareRegDate.toString()) }
                  size='small'
                />
              </Grid>
              <Grid item xs={3}>
                <TextField 
                  fullWidth={true}
                  inputProps={{readOnly: true}}
                  sx={{ m: 1 }} 
                  id="tfVoteStartDate" 
                  label="VoteStartDate" 
                  variant="outlined"
                  value = { dateParser(motion.body.voteStartDate.toString()) }
                  size='small'
                />
              </Grid>
              <Grid item xs={3}>
                <TextField 
                  fullWidth={true}
                  inputProps={{readOnly: true}}
                  sx={{ m: 1 }} 
                  id="tfVoteEndDate" 
                  label="VoteEndDate" 
                  variant="outlined"
                  value = { dateParser(motion.body.voteEndDate.toString()) }
                  size='small'
                />
              </Grid>
              <Grid item xs={3}>
                <TextField 
                  fullWidth={true}
                  inputProps={{readOnly: true}}
                  sx={{ m: 1 }} 
                  id="tfStateOfMotion" 
                  label="StateOfMotion" 
                  variant="outlined"
                  value = { statesOfMotion[motion.body.state - 1] }
                  size='small'
                />
              </Grid>

            </Grid>
          )}

          <Grid container direction='row' spacing={2} >
            <Grid item xs={3}>
              <TextField 
                fullWidth
                inputProps={{readOnly: true}}
                sx={{ m: 1 }} 
                id="tfExectuor" 
                label={ motion.head.typeOfMotion == 1 ? "Candidate" : "Executor" } 
                variant="outlined"
                value = { longSnParser(motion.head.executor.toString()) }
                size='small'
              />
            </Grid>
            <Grid item xs={3}>
              <GetVotingRule seq={motion.head.seqOfVR} />          
            </Grid>
            <Grid item xs={6}>
              {motion.head.typeOfMotion < 3 && (
                <GetPosition seq={Number(motion.contents)} />
              )}

              {motion.head.typeOfMotion == 3 && snOfDoc && (
                <Link
                  href={{
                    pathname: motion.head.seqOfVR == 8
                            ? '/app/comp/roc/sha'
                            : '/app/comp/roa/ia'
                    ,
                    query: {
                      addr: addrOfDoc,
                      snOfDoc: snOfDoc.substring(6, 26),
                    }
                  }}
                  // as={motion.head.seqOfVR == 8
                  //     ? '/comp/roc/Sha'
                  //     : '/comp/roa/Ia'}
                >            
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Article />}
                    sx={{ m:1 }}
                  >
                    Doc: {addrOfDoc}
                  </Button>
                </Link>
              )}

              {motion.head.typeOfMotion == 4 && (
                <TextField 
                  fullWidth
                  inputProps={{readOnly: true}}
                  sx={{ m: 1 }} 
                  id="tfHashOfAction" 
                  label="HashOfAction" 
                  variant="outlined"
                  value = { motion.contents.toString(16) }
                  size='small'
                />                                            
              )}
              
            </Grid>
          </Grid>


          {motion.body.state > 2 && (
            <VoteResult addr={minutes} seqOfMotion={motion.head.seqOfMotion} />
          )}

          {motion.body.state < 4 && (
            <Grid container direction='row' spacing={2} >
              <Grid item xs={12}>
                <ActionsOnMotionOfBoard motion={motion} voteIsEnd={voteIsEnd} setOpen={setOpen} refresh={refresh} />
              </Grid>
            </Grid>
          )}

        </Paper>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={()=>setOpen(false)}>Close</Button>
      </DialogActions>

    </Dialog>

  )
}