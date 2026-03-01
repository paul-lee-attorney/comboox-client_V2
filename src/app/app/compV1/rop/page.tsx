"use client"

import { useEffect, useState } from "react";

import { 
  Paper, 
  Toolbar,
  Stack,
  Typography,
  Box,
} from "@mui/material";

import { Pledge, getAllPledges } from "./rop";
import { PledgesList } from "./components/PledgesList";
import { CertificateOfPledge } from "./components/CertificateOfPledge";
import { CreatePledge } from "./components/CreatePledge";
import { CopyLongStrTF } from "../../common/CopyLongStr";
import { AddrZero, booxMap } from "../../common";
import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { SetBookAddr } from "../../components/SetBookAddr";

function RegisterOfPledges() {
  const { boox } = useComBooxContext();

  const [addr, setAddr] = useState(boox ? boox[booxMap.ROP] : AddrZero );

  const [ pldList, setPldList ] = useState<readonly Pledge[]>([]);
  const [ time, setTime ] = useState<number>(0);

  const refresh = ()=>{
    setTime(Date.now());
  }

  useEffect(()=>{
    getAllPledges(addr).then(
      res => setPldList(res)
    );
  }, [addr, time]);

  const [ open, setOpen ] = useState<boolean>(false);
  const [ pld, setPld ] = useState<Pledge>();

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:2, m:1, maxWidth:1680, border:1, borderColor:'divider', width:'fit-content' }} >

      <Stack direction="row" >

        <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
          <b>ROP - Register Of Pledges</b>
        </Typography>

        <Box width='168'>
          <CopyLongStrTF title="Addr"  src={ addr.toLowerCase() } />
        </Box>

        <SetBookAddr setAddr={setAddr} />

      </Stack>

      <Stack direction='column' sx={{m:1, p:1}} >

        <CreatePledge refresh={refresh} />

        <PledgesList 
          list={ pldList }  
          setPledge={ setPld }
          setOpen={ setOpen }
        />
      
        {pld && (
          <CertificateOfPledge open={open} pld={pld} setOpen={setOpen} refresh={refresh} />
        )}

      </Stack>

    </Paper>
  );
} 

export default RegisterOfPledges;