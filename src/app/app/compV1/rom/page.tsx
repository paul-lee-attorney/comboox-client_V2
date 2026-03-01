"use client"

import { useState } from "react";

import { Box, Paper, Stack, Typography } from "@mui/material";

import { MembersEquityList } from "./components/MembersList";

import { CopyLongStrTF } from "../../common/CopyLongStr";
import { InvHistoryOfMember } from "./components/InvHistoryOfMember";
import { AddrZero, booxMap } from "../../common";

import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { SetBookAddr } from "../../components/SetBookAddr";

function RegisterOfMembers() {
  const {boox} = useComBooxContext();

  const [addr, setAddr] = useState(boox ? boox[booxMap.ROM] : AddrZero );

  const [ acct, setAcct ] = useState<number>(0);
  const [ open, setOpen ] = useState(false);
  
  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider', width:'fit-content' }} >

      <Stack direction='row' >
        <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
          <b>ROM - Register Of Members</b>
        </Typography>

        <Box width='168'>
          <CopyLongStrTF title="Addr"  src={addr.toLowerCase()} />
        </Box>

        <SetBookAddr setAddr={setAddr} />

      </Stack>

      <MembersEquityList setAcct={setAcct} setOpen={setOpen} />

      {acct > 0 && open && (
        <InvHistoryOfMember acct={ acct } open={ open } setOpen={ setOpen } />
      )}

    </Paper>
  );
} 

export default RegisterOfMembers;