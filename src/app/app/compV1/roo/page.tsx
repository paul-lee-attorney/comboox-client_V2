"use client"

import { useEffect, useState } from "react";

import { 
  Paper, 
  Toolbar,
  Stack,
  Typography,
  Box,
} from "@mui/material";


import { AddrZero, booxMap } from "../../common";
import { OptionsList } from "./components/OptionsList";
import { CertificateOfOption } from "./components/CertificateOfOption";
import { CopyLongStrSpan, CopyLongStrTF } from "../../common/CopyLongStr";
import { OptWrap, defaultOptWrap, getAllOpts } from "./roo";
import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { SetBookAddr } from "../../components/SetBookAddr";

function RegisterOfOptions() {
  const { boox } = useComBooxContext();

  const [addr, setAddr] = useState(boox ? boox[booxMap.ROO] : AddrZero );

  const [ optsList, setOptsList ] = useState<readonly OptWrap[]>([defaultOptWrap]);
  const [ time, setTime ] = useState(0);

  const refresh = ()=>{
    setTime(Date.now());
  }

  useEffect(()=>{
    getAllOpts(addr).then(
      res => setOptsList(res)
    );
  }, [addr, time]);

  const [ open, setOpen ] = useState<boolean>(false);
  const [ opt, setOpt ] = useState<OptWrap>( defaultOptWrap );

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:2, m:1, border:1, borderColor:'divider', width:'fit-content' }} >

      <Stack direction="row" >

        <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
          <b>ROO - Register Of Options</b>
        </Typography>

        <Box width='168'>
          <CopyLongStrTF title="Addr"  src={ addr.toLowerCase() } />
        </Box>

        <SetBookAddr setAddr={setAddr} />

      </Stack>

      <Stack direction='column' sx={{ m:1 }} >

        <OptionsList 
          list={ optsList }  
          setOpt={ setOpt }
          setOpen={ setOpen }
        />
      
        {opt && (
          <CertificateOfOption open={open} optWrap={opt} setOpen={setOpen} refresh={refresh} />
        )}

      </Stack>

    </Paper>
  );
} 

export default RegisterOfOptions;