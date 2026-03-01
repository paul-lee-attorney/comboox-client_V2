"use client"

import { useEffect, useState } from "react";

import { Box, Paper, Stack, Typography } from "@mui/material";

import { CopyLongStrTF } from "../../common/CopyLongStr";
import { AddrZero, booxMap } from "../../common";

import { ActionsOfInvestor } from "./components/ActionsOfInvestor";
import { Investor, investorInfoList } from "./roi";
import { InvestorsList } from "./components/InvestorsList";
import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { SetBookAddr } from "../../components/SetBookAddr";

function RegisterOfInvestors() {

  const { boox } = useComBooxContext();

  const [addr, setAddr] = useState(boox ? boox[booxMap.ROI] : AddrZero );

  const [ invList, setInvList ] = useState<readonly Investor[]>([]);
  const [ time, setTime ] = useState<number>(0);

  const refresh = ()=>{
    setTime(Date.now());
  }

  useEffect(()=>{   
      investorInfoList(addr).then(
        res => setInvList(res)
      );
  }, [addr, time]);
  
  const [ acct, setAcct ] = useState<string>('0');

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:2, m:1, minWidth:1680, border:1, borderColor:'divider', width:'fit-content' }} >

      <Stack direction="row" sx={{alignItems:'center'}} >

          <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
            <b>ROI - Register Of Investors</b>
          </Typography>

          <Box width='168'>
            <CopyLongStrTF title="Addr"  src={ addr.toLowerCase() }  />
          </Box>

          <SetBookAddr setAddr={setAddr} />

      </Stack>

      <ActionsOfInvestor acct={acct} refresh={ refresh } />
      {invList && (
        <InvestorsList list={invList} setAcct={setAcct} />
      )}

    </Paper>
  );
} 

export default RegisterOfInvestors;