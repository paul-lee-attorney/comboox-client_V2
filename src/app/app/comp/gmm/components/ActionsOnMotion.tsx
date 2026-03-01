import { Dispatch, SetStateAction, useState } from "react";

import { Collapse, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";

import { Motion } from "../meetingMinutes";

import { ProposeMotionToGeneralMeeting } from "./actions_on_motion/ProposeMotionToGeneralMeeting";
import { CastVoteOfGm } from "./actions_on_motion/CastVoteOfGm";
import { VoteCountingOfGm } from "./actions_on_motion/VoteCountingOfGm";
import { TakeSeat } from "./actions_on_motion/TakeSeat";
import { RemoveDirector } from "./actions_on_motion/RemoveDirector";
import { ExecActionOfGm } from "./actions_on_motion/ExecActionOfGm";
import { TransferFund } from "./actions_on_motion/TransferFund";
import { DistributeUsd } from "./actions_on_motion/DistributeUsd";
import { DeprecateGK } from "./actions_on_motion/DeprecateGK";
import { UploadMotionFile } from "./actions_on_motion/UploadMotionFile";
import { MintCBP } from "./actions_on_motion/MintCBP";
import { WithdrawCBP } from "./actions_on_motion/WithdrawCBP";

export interface ActionsOnMotionProps {
  motion: Motion;
  setOpen: Dispatch<SetStateAction<boolean>>;
  refresh: ()=>void;
}

export interface ActionsOnMotionSelectProps extends ActionsOnMotionProps{
  voteIsEnd: boolean;
}

export function ActionsOnMotion({motion, voteIsEnd, setOpen, refresh}:ActionsOnMotionSelectProps){

  const [ typeOfAction, setTypeOfAction ] = useState<string>('');
  
  const actionsOnMotion = [
    'Propose Motion', 'Upload File', 'Cast Vote', 'Count Results', 'Take Seat', 
    'Remove Director', 'Exec Actions', 'Transfer Fund', 'Distribute', 'Deprecate GK',
    'Mint CBP', 'Withdraw CBP'
  ]

  const compsOfAction = [
    <ProposeMotionToGeneralMeeting key={0} motion={motion} setOpen={setOpen} refresh={refresh} />,
    <UploadMotionFile key={1} motion={motion} setOpen = {setOpen} refresh={refresh} />,
    <CastVoteOfGm key={2} motion={motion} setOpen = {setOpen} refresh={refresh} />,
    <VoteCountingOfGm key={3} seqOfMotion={motion.head.seqOfMotion} setOpen = {setOpen} refresh={refresh} setResult={(flag:boolean)=>{}} setNextStep={(i:number)=>{}} />,
    <TakeSeat key={4} motion={motion} setOpen = {setOpen} refresh={refresh} />,
    <RemoveDirector key={5} motion={motion} setOpen = {setOpen} refresh={refresh} />,
    <ExecActionOfGm key={6} motion={motion} setOpen = {setOpen} refresh={refresh} />,
    <TransferFund key={7} motion={motion} setOpen = {setOpen} refresh={refresh} />,  
    <DistributeUsd key={8} motion={motion} setOpen = {setOpen} refresh={refresh} />,  
    <DeprecateGK key={9} motion={motion} setOpen = {setOpen} refresh={refresh} />, 
    <MintCBP key={10} motion={motion} setOpen = {setOpen} refresh={refresh} />, 
    <WithdrawCBP key={11} motion={motion} setOpen = {setOpen} refresh={refresh} />, 
  ]

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }} >
      <Stack direction={'row'} sx={{ alignItems:'center', color:'black', }} >

        <Toolbar  sx={{ textDecoration:'underline' }} >
          <h4>Actions on Motion:</h4>
        </Toolbar>

        <FormControl variant="outlined" size="small" sx={{ m:1, mr:5, minWidth: 218 }}>
          <InputLabel id="typeOfAction-label">TypeOfAction</InputLabel>
          <Select
            labelId="typeOfAction-label"
            id="typeOfAction-select"
            label="TypeOfAction"
            value={ typeOfAction }
            onChange={(e) => setTypeOfAction(e.target.value)}
          >
            {actionsOnMotion.map((v, i) => {
              if (motion.body.state == 1 && i > 1) return null;
              else if (motion.body.state == 2 && !voteIsEnd && (i < 1 || i > 3)) return null;
              else if (motion.body.state == 2 && voteIsEnd && i != 3) return null;
              else if (motion.body.state == 3 && motion.head.typeOfMotion == 1 && i != 4) return null;
              else if (motion.body.state == 3 && motion.head.typeOfMotion == 2 && i != 5) return null;
              else if (motion.body.state == 3 && motion.head.typeOfMotion == 4 && (i != 6 && i != 10 && i != 11)) return null;
              else if (motion.body.state == 3 && motion.head.typeOfMotion == 5 && i != 7) return null;
              else if (motion.body.state == 3 && motion.head.typeOfMotion == 6 && i != 8) return null;
              else if (motion.body.state == 3 && motion.head.typeOfMotion == 7 && i != 9) return null;
              else if (motion.body.state > 3) return null;
              return (<MenuItem key={v} value={ i } > <b>{v}</b> </MenuItem>);
            })}
          </Select>
        </FormControl>

      </Stack>

      { compsOfAction.map((v,i)=>{
        if (motion.body.state == 1 && i > 1) return null;
        else if (motion.body.state == 2 && !voteIsEnd && (i < 1 || i > 3)) return null;
        else if (motion.body.state == 2 && voteIsEnd && i != 3) return null;
        else if (motion.body.state == 3 && motion.head.typeOfMotion == 1 && i != 4) return null;
        else if (motion.body.state == 3 && motion.head.typeOfMotion == 2 && i != 5) return null;
        else if (motion.body.state == 3 && motion.head.typeOfMotion == 4 && (i != 6 && i != 10 && i != 11)) return null;
        else if (motion.body.state == 3 && motion.head.typeOfMotion == 5 && i != 7) return null;
        else if (motion.body.state == 3 && motion.head.typeOfMotion == 6 && i != 8) return null;
        else if (motion.body.state == 3 && motion.head.typeOfMotion == 7 && i != 9) return null;
        else if (motion.body.state > 3) return null;
        return (
          <Collapse key={i} in={ typeOfAction == i.toString() } >
            {v}
          </Collapse>
        );
      }) }

    </Paper>
    
  );
}