"use client"

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Tabs, TabList, TabPanel, Tab } from "@mui/joy";
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { BookOutlined } from "@mui/icons-material";

import { HexType, booxMap } from "../../../common";

import { AgrmtAccessControl } from "./components/AgrmtAccessControl";
import { ShaBodyTerms } from "./components/ShaBodyTerms";
import { Signatures } from "./components/sigPage/Signatures";
import { ShaLifecycle } from "./components/ShaLifecycle";

import { InfoOfFile, getFile } from "../components/filesFolder";
import { isFinalized } from "../../common/draftControl";
import { IndexCard } from "../components/IndexCard";

import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";
import AgreementDownloader from "../../../components/file_storage/AgreementDownloader";
// import Bookmark from "../components/Bookmark";


function Sha() {
  const { boox } = useComBooxContext();

  const [ index, setIndex ] = useState(0);

  const searchParams = useSearchParams();
  const sha:HexType = `0x${searchParams.get("addr")?.substring(2) ?? ''}`;

  const [ open, setOpen ] = useState(false);
  const [ file, setFile ] = useState<InfoOfFile>();

  useEffect(()=>{
    if (boox && sha) {
      getFile(boox[booxMap.ROC], sha).then(
        res =>
          setFile({
            addr: sha,
            sn: res.snOfDoc,
            head: res.head,
            ref: res.ref        
          })
      );
    }
  }, [boox, sha]);

  const [ finalized, setFinalized ] = useState<boolean>(false);

  useEffect(()=>{
    if (sha && sha != '0x') {
      isFinalized(sha).then(
        flag => setFinalized(flag)
      );
    }
  }, [sha]);

  return (
    <Stack direction='column' width='100%' height='100%' >
      <Box width={'100%'} height={'100%'} >
        <Paper elevation={3} sx={{m:2, p:1, border:1, height:'100%', borderColor:'divider' }}>
          <Stack direction='column' justifyContent='center' alignItems='center' >

            <Stack direction='row' sx={{ alignItems:'baseline', mb:5 }} >

              <Typography sx={{ mt: 5, mb:2, textDecoration:'underline' }} variant="h4" >
                <b>Shareholders Agreement</b>
              </Typography>

              {file && (
                <IndexCard file={file} open={open} setOpen={setOpen} />
              )}

              <Stack direction="row" sx={{ alignContent:'baseLine'}} >

                <Tooltip title="IndexCard" placement="top" arrow >
                  <IconButton 
                    size="large"
                    color="primary"
                    sx={{ m:1 }}
                    onClick={()=>setOpen(true)}
                  >
                    <BookOutlined />
                  </IconButton>
                </Tooltip>

                <AgreementDownloader typeOfFile="SHA" addrOfFile={sha} />

              </Stack>

            </Stack>


            <Tabs 
              size='md' 
              sx={{ 
                justifyContent:'center', 
                alignItems:'center' 
              }}
              value={index}
              onChange={(e, v) => setIndex(v as number)}
            >

              <TabList tabFlex={1} sx={{ width: 880 }} >
                <Tab><b>Body Term</b></Tab>
                {!finalized && (
                  <Tab><b>Access Control</b></Tab>
                )}
                <Tab><b>Sig Page</b></Tab>
                <Tab><b>Sup Page</b></Tab>
                <Tab><b>Life Cycle</b></Tab>
              </TabList>

              <TabPanel value={0} sx={{ width:'100%', justifyContent:'center', alignItems:'center' }} >
                {finalized != undefined && (
                  <ShaBodyTerms sha={sha} finalized={finalized} />
                )}
              </TabPanel>

              <TabPanel value={1} sx={{ width:'100%', justifyContent:'center', alignItems:'center' }} >
                {sha != '0x' && !finalized && (
                  <AgrmtAccessControl isSha={true} agrmt={sha} />
                )}
              </TabPanel>

              <TabPanel value={2} sx={{ width:'100%', justifyContent:'center', alignItems:'center' }} >
                {sha != '0x' && finalized != undefined && (
                  <Signatures addr={sha} initPage={true} finalized={finalized} isSha={ true } />
                )}
              </TabPanel>

              <TabPanel value={3} sx={{ width:'100%', justifyContent:'center', alignItems:'center' }} >
                {sha != '0x' && finalized != undefined && (
                  <Signatures addr={sha} initPage={false} finalized={finalized} isSha={ true } />
                )}
              </TabPanel>

              <TabPanel value={4} sx={{ width:'100%', justifyContent:'center', alignItems:'center' }} >
                {sha != '0x' && finalized != undefined && (
                  <ShaLifecycle sha={sha} finalized={finalized} />
                )}
              </TabPanel>

            </Tabs>

          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
} 

export default Sha;