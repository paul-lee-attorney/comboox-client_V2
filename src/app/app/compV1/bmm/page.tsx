"use client"

import { useEffect, useState } from "react";

import { Box, Paper, Stack, Toolbar, Typography } from "@mui/material";
import { GetMotionsList } from "../gmm/components/GetMotionsList";
import { Motion, getMotionsList } from "../gmm/meetingMinutes";
import { CreateMotionOfBoardMeeting } from "./components/CreateMotionOfBoardMeeting";
import { ApprovalFormOfBoardMotion } from "./components/ApprovalFormOfBoardMotion";

import { CopyLongStrSpan, CopyLongStrTF } from "../../common/CopyLongStr";

import { AddrZero, booxMap } from "../../common";

import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { SetBookAddr } from "../../components/SetBookAddr";

function BoardMeetingMinutes() {
  const { boox } = useComBooxContext();
  const [addr, setAddr] = useState(boox ? boox[booxMap.BMM] : AddrZero );

  const [ motionsList, setMotionsList ] = useState<Motion[]>();

  const [ open, setOpen ] = useState(false);
  const [ motion, setMotion ] = useState<Motion>();
  const [ time, setTime ] = useState<number>(0);

  const refresh = ()=> {
    setTime(Date.now());
  }

  useEffect(()=>{
    getMotionsList(addr).then(
      ls => setMotionsList(ls)
    );
  }, [addr, time]);

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:2, m:1, border:1, borderColor:'divider', width:'fit-content' }} >

      <Stack direction='row' >
        <Typography variant='h5' sx={{ m:1, textDecoration:'underline'  }}  >
          <b>BMM - Board Meeting Minutes </b>
        </Typography>
        
        <Box width='168'>
          <CopyLongStrTF  title="Addr" src={ addr.toLowerCase() } />      
        </Box>

        <SetBookAddr setAddr={setAddr}/>

      </Stack>
      <Stack direction='column' justifyContent='center' alignItems='start' sx={{m:1}} >

        <CreateMotionOfBoardMeeting  refresh={refresh} />

        {motionsList && (
          <GetMotionsList 
            list={motionsList} 
            title="Motions List - Board Meeting" 
            setMotion={setMotion}
            setOpen={setOpen}
          />
        )}

        {motion && boox && (
          <ApprovalFormOfBoardMotion 
            minutes={boox[booxMap.BMM]}  
            open={open} 
            motion={motion} 
            setOpen={setOpen} 
            refresh={refresh}
          />
        )}       

      </Stack>

    </Paper>
  );
} 

export default BoardMeetingMinutes;