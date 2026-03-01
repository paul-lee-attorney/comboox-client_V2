"use client"

import { useEffect, useState } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

import { GetMotionsList } from "./components/GetMotionsList";

import { CreateMotionOfGm } from "./components/CreateMotionOfGm";
import { Motion, getMotionsList } from "./meetingMinutes";
import { ApprovalFormOfMotion } from "./components/ApprovalFormOfMotion";
import { CopyLongStrTF } from "../../common/CopyLongStr";
import { AddrZero, booxMap, HexType } from "../../common";
import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { SetBookAddr } from "../../components/SetBookAddr";
import { HexParser } from "../../common/toolsKit";
import { HistOfGMM } from "./components/HistOfGMM";

function GeneralMeetingMinutes() {

  const { gk, boox } = useComBooxContext();

  const [ addr, setAddr ] = useState<HexType>(boox ? boox[booxMap.GMM] : AddrZero);

  const [ motionsList, setMotionsList ] = useState<Motion[]>();

  const [ open, setOpen ] = useState(false);
  const [ motion, setMotion ] = useState<Motion>();
  const [ time, setTime ] = useState<number>(0);

  const refresh = ()=>{
    setTime(Date.now());
  }

  useEffect(()=>{
    getMotionsList(addr).then(
      ls => setMotionsList(ls)
    );
  }, [addr, time]);
  
  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, maxWidth:1680, border:1, borderColor:'divider' }} >

      <Stack direction="row" >

        <Typography variant='h5' sx={{ m:2, textDecoration:'underline', minWidth:368}}  >
          <b>GMM - General Meeting Minutes</b>
        </Typography>

        <Box width='188'>
          <CopyLongStrTF title="Addr"  src={ addr.toLowerCase() }  />
        </Box>

        {gk && gk.toLowerCase() == 
                HexParser("0x68233E877575E8C7e057e83eF0D16FFa7F98984D").toLowerCase() && (
            <HistOfGMM setAddr={setAddr} />
        )}

        <SetBookAddr setAddr={setAddr} />

      </Stack>

      <CreateMotionOfGm  refresh={refresh} />

      {motionsList && (
        <GetMotionsList 
          list={motionsList} 
          title="Motions List - General Meeting of Members" 
          setMotion={setMotion}
          setOpen={setOpen}
        />
      )}

      {motion && boox && (
        <ApprovalFormOfMotion 
          minutes={boox[booxMap.GMM]}  
          open={open} 
          motion={motion} 
          setOpen={setOpen} 
          refresh={refresh} 
        />
      )}

    </Paper>
  );
} 

export default GeneralMeetingMinutes;