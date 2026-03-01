"use client"

import { useEffect, useState } from "react";

import { Button, Paper, TextField, Stack, Typography, Box } from "@mui/material";
import { Search } from "@mui/icons-material";

import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";

import { CopyLongStrTF } from "../../common/CopyLongStr";
import { AddrZero, MaxPrice, booxMap } from "../../common";
import { FormResults, defFormResults, hasError, onlyInt } from "../../common/toolsKit";

import { Share, getListOfClassInfo, getShare, getSharesList } from "./ros";
import { SharesList } from "./components/SharesList";
import { CertificateOfContribution } from "./components/CertificateOfContribution";
import { SetBookAddr } from "../../components/SetBookAddr";
import { ClassesList } from "./components/ClassesList";

function RegisterOfShares() {
  const { boox } = useComBooxContext();

  const [addr, setAddr] = useState(boox ? boox[booxMap.ROS] : AddrZero );

  const [ sharesList, setSharesList ] = useState<readonly Share[]>();
  const [ time, setTime ] = useState<number>(0);  

  const refresh = ()=>{
    setTime(Date.now());
  }

  useEffect(()=>{
    getSharesList(addr).then(
      res => setSharesList(res)
    );
  }, [addr, time]);

  const [ seqOfShare, setSeqOfShare ] = useState<string>();
  const [ open, setOpen ] = useState<boolean>(false);
  const [ share, setShare ] = useState<Share>();

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  
  const searchShare = () => {
    if (seqOfShare && !hasError(valid)) {
      getShare(addr, seqOfShare).then(
        res => {
          setShare(res);
          setOpen(true);
        }
      );
    }
  }

  const [classList, setClassList ] = useState<Share[]>([]);

  useEffect(()=>{
    if (addr) {
      getListOfClassInfo(addr).then(
        res => setClassList(res)
      )
    }
  })

  return (
    <>
      <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:2, m:1, border:1, borderColor:'divider', width:'fit-content' }} >

        <Stack direction="row" >

          <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
            <b>ROS - Register Of Shares</b>
          </Typography>

          <Box width='168'>
            <CopyLongStrTF title="Addr"  src={ addr.toLowerCase() } />
          </Box>

          <SetBookAddr setAddr={setAddr} />

        </Stack>

        <table width={1680} >
          <thead />
          
          <tbody>

            <tr>        
              <td colSpan={2}>
                <Stack direction='row' sx={{ alignItems:'start' }} >

                  <TextField 
                    sx={{ m: 1, minWidth: 218 }} 
                    id="tfSeqOfShare" 
                    label="SeqOfCert" 
                    variant="outlined"
                    error={ valid['SeqOfShare']?.error }
                    helperText={ valid['SeqOfShare']?.helpTx ?? ' ' }          
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyInt('SeqOfShare', input, MaxPrice, setValid);
                      setSeqOfShare(input);
                    }}
                    value = { seqOfShare }
                    size='small'
                  />

                  <Button 
                    disabled={ !seqOfShare || hasError(valid) }
                    sx={{ m: 1, minWidth: 168, height: 40 }} 
                    variant="contained" 
                    endIcon={ <Search /> }
                    onClick={ searchShare }
                    size='small'
                  >
                    Search
                  </Button>

                </Stack>
              </td>
              <td colSpan={2} >
              </td>
            </tr>

            <tr>
              <td colSpan={4}>

                {classList && (
                  <ClassesList 
                    list={ classList }  
                    setShare={ setShare }
                    setOpen={ setOpen }
                  />
                )}

              </td>
            </tr>

            <tr>
              <td colSpan={4}>

                {sharesList && (
                  <SharesList 
                    list={ sharesList }  
                    setShare={ setShare }
                    setOpen={ setOpen }
                  />
                )}

              </td>
            </tr>
          </tbody>

        </table>
        
        {share && (
          <CertificateOfContribution open={open} share={share} setOpen={setOpen} refresh={refresh} />
        )}

      </Paper>
    </>
  );
} 

export default RegisterOfShares;