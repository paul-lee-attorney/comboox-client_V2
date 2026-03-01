"use client"

import { useEffect, useState } from "react";

import { Box, Paper, Stack, Typography } from "@mui/material";

import { Position, getDirectorsFullPosInfo, getManagersFullPosInfo, } from "./rod";

import { GetOfficersList } from "./components/GetOfficersList";
import { CopyLongStrSpan, CopyLongStrTF } from "../../common/CopyLongStr";
import { AddrZero, booxMap } from "../../common";
import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { SetBookAddr } from "../../components/SetBookAddr";

function RegisterOfDirectors() {
  const { boox } = useComBooxContext();

  const [addr, setAddr] = useState(boox ? boox[booxMap.ROD] : AddrZero );

  const [ directorsList, setDirectorsList ] = useState<readonly Position[]>();
  const [ officersList, setOfficersList ] = useState<readonly Position[]>();

  useEffect(()=>{
    getDirectorsFullPosInfo(addr).then(
      ls => setDirectorsList(ls)
    );
    getManagersFullPosInfo(addr).then(
      ls => setOfficersList(ls)
    );
  }, [addr]);

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, maxWidth: 1680, border:1, borderColor:'divider' }} >

      <Stack direction='row' >
        <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
          <b>ROD - Register Of Directors</b>
        </Typography>

        <Box width='168'>
          <CopyLongStrTF title="Addr"  src={addr.toLowerCase()} />
        </Box>

        <SetBookAddr setAddr={setAddr} />
      
      </Stack>

      {directorsList && (
        <GetOfficersList list={directorsList} title="Directors List" />
      )}
        
      {officersList && (
        <GetOfficersList list={officersList} title="Officers List" />
      )}


    </Paper>
  );
} 

export default RegisterOfDirectors;