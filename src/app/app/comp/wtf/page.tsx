"use client"

import { useEffect, useState } from "react";

import { Box, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";

import { CopyLongStrTF } from "../../common/CopyLongStr";
import { AddrZero, booxMap } from "../../common";

import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { SetBookAddr } from "../../components/SetBookAddr";

import { defaultDrop, DropInfo, DropProps, getDropsOfStream, getOceanInfo, getStreamInfo } from "./wtf";
import { ActionsOfDistr } from "./components/ActionsOfDistr";
import { InfoOfDistr } from "./components/InfoOfDistr";
import { DropsList } from "./components/DropsList";

function Waterfalls() {

  const {boox} = useComBooxContext();

  const [addr, setAddr] = useState(boox ? boox[booxMap.WTF] : AddrZero);

  const [ time, setTime ] = useState<number>(0);

  const refresh = ()=>{
    setTime(Date.now());
  }

  const [ seqOfDistr, setSeqOfDistr ] = useState(0);
  const [ maxSeqOfDistr, setMaxSeqOfDistr ] = useState(0);

  useEffect(()=>{
    if (addr) {
      getOceanInfo(addr).
        then(res => setMaxSeqOfDistr(res.seqOfDistr));
    }
  }, [addr, time])

  const [info, setInfo] = useState<DropInfo>({...defaultDrop, name: 'default'});

  useEffect(()=>{
    if (addr != AddrZero && seqOfDistr > 0) {
      getStreamInfo(addr, seqOfDistr).then(
        res => setInfo({...res, name:'Info of Stream'})
      );
    }
  }, [addr, seqOfDistr]);

  const [ list, setList ] = useState<DropProps[]>([]);

  useEffect(()=>{
    if (addr != AddrZero && seqOfDistr > 0) {
      getDropsOfStream(addr, seqOfDistr).then(
        res => setList(res.map((v,i)=>({...v, seqNum: i+1})))
      );
    }
  }, [addr, seqOfDistr]);

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:2, m:1, border:1, borderColor:'divider', width:'fit-content' }} >

      <Stack direction="row" sx={{alignItems:'center'}} >

          <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
            <b>WTF - Distribution Waterfalls</b>
          </Typography>

          <Box width='168'>
            <CopyLongStrTF title="Addr"  src={ addr.toLowerCase() }  />
          </Box>

          <Box width='168' sx={{ m:2 }}>
            <FormControl size="small" sx={{ minWidth: 168 }}>
              <InputLabel id="typeOfAction-label">SeqOfDistr</InputLabel>
              <Select
                labelId="typeOfAction-label"
                id="typeOfAction-select"
                label="SeqOfDistr"
                value={ seqOfDistr == 0 ? '' : seqOfDistr }
                onChange={(e) => setSeqOfDistr( parseInt( e.target.value.toString()))}
              >
                {Array.from({length: maxSeqOfDistr}, (_,i)=>maxSeqOfDistr - i).map(v => (
                  <MenuItem key={v} value={ v } > <b>{v}</b> </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <SetBookAddr setAddr={setAddr} />

      </Stack>
      
      {info && (
        <InfoOfDistr info={info} />
      )}

      <ActionsOfDistr setInfo={setInfo} setList={setList} />

      {list && list.length >0 && (
        <DropsList list={list} />
      )}
        

    </Paper>
  );
} 

export default Waterfalls;