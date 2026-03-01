import { useState } from "react";

import { Collapse, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";

import { ActionsOnMotionSelectProps } from "../../gmm/components/ActionsOnMotion";

import { ProposeMotionToBoardMeeting } from "./actions_on_motion/ProposeMotionToBoardMeeting";
import { CastVoteOfBm } from "./actions_on_motion/CastVoteOfBm";
import { VoteCountingOfBoard } from "./actions_on_motion/VoteCountingOfBoard";
import { TakePosition } from "./actions_on_motion/TakePosition";
import { RemoveOfficer } from "./actions_on_motion/RemoveOfficer";
import { ExecAction } from "./actions_on_motion/ExecAction";
import { TransferFund } from "./actions_on_motion/TransferFund";
import { UploadMotionFile } from "../../gmm/components/actions_on_motion/UploadMotionFile";


export function ActionsOnMotionOfBoard({motion, voteIsEnd, setOpen, refresh}:ActionsOnMotionSelectProps){

  const [ typeOfAction, setTypeOfAction ] = useState<string>('');
  
  const actionsOnMotion = [
    'Propose Motion', 'Upload File', 'Cast Vote', 'Count Results', 'Take Position', 
    'Remove Officer', 'Exec Actions', 'Transfer Fund'
  ]

  const compsOfAction = [
    <ProposeMotionToBoardMeeting key={0} seqOfMotion={motion.head.seqOfMotion} setOpen={setOpen} refresh={refresh} />,
    <UploadMotionFile key={1} motion={motion} setOpen={setOpen} refresh={refresh} />,
    <CastVoteOfBm key={2} seqOfMotion={motion.head.seqOfMotion} setOpen = {setOpen} refresh={refresh} />,
    <VoteCountingOfBoard key={3} seqOfMotion={motion.head.seqOfMotion} setOpen = {setOpen} refresh={refresh} />,
    <TakePosition key={4} motion={motion} setOpen = {setOpen} refresh={refresh} />,
    <RemoveOfficer key={5} motion={motion} setOpen = {setOpen} refresh={refresh} />,
    <ExecAction key={6} motion={motion} setOpen = {setOpen} refresh={refresh} />,
    <TransferFund key={7} motion={motion} setOpen = {setOpen} refresh={refresh} />,  
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
              else if (motion.body.state == 2 && !voteIsEnd && (i<1 || i>3)) return null;
              else if (motion.body.state == 2 && voteIsEnd && i != 3) return null;
              else if (motion.body.state == 3 && motion.head.typeOfMotion == 1 && i != 4) return null;
              else if (motion.body.state == 3 && motion.head.typeOfMotion == 2 && i != 5) return null;
              else if (motion.body.state == 3 && motion.head.typeOfMotion == 4 && i != 6) return null;
              else if (motion.body.state == 3 && motion.head.typeOfMotion == 5 && i != 7) return null;
              else if (motion.body.state > 3) return null;
              return (<MenuItem key={v} value={ i } > <b>{v}</b> </MenuItem>);
            })}
          </Select>
        </FormControl>

      </Stack>

      { compsOfAction.map((v,i)=>{
        if (motion.body.state == 1 && i > 1) return null;
        else if (motion.body.state == 2 && !voteIsEnd && (i<1 || i>3)) return null;
        else if (motion.body.state == 2 && voteIsEnd && i != 3) return null;
        else if (motion.body.state == 3 && motion.head.typeOfMotion == 1 && i != 4) return null;
        else if (motion.body.state == 3 && motion.head.typeOfMotion == 2 && i != 5) return null;
        else if (motion.body.state == 3 && motion.head.typeOfMotion == 4 && i != 6) return null;
        else if (motion.body.state == 3 && motion.head.typeOfMotion == 5 && i != 7) return null;
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