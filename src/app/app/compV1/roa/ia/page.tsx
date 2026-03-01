"use client"

import { useEffect, useState } from "react";

import { HexType, booxMap } from "../../../common";

import { Tabs, TabList, TabPanel, Tab } from "@mui/joy";
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";

import { AgrmtAccessControl } from "../../roc/sha/components/AgrmtAccessControl";

import IaBodyTerms from "./components/IaBodyTerms";

import { IaLifecycle } from "./components/IaLifecycle";
import { Signatures } from "../../roc/sha/components/sigPage/Signatures";
import { InfoOfFile, getFile } from "../../roc/components/filesFolder";
import { IndexCard } from "../../roc/components/IndexCard";
import { BookOutlined } from "@mui/icons-material";
import { isFinalized } from "../../common/draftControl";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";
import { useSearchParams } from "next/navigation";
import AgreementDownloader from "../../../components/file_storage/AgreementDownloader";
// import Bookmark from "../../roc/components/Bookmark";

function Ia() {
  const { boox } = useComBooxContext();

  const [ index, setIndex ] = useState<number>(0);

  const searchParams = useSearchParams();
  const ia:HexType = `0x${searchParams.get('addr')?.substring(2) ?? '00'}`;

  const [ file, setFile ] = useState<InfoOfFile>();

  useEffect(()=>{
    if (boox && ia != `0x00`) {
      getFile(boox[booxMap.ROA], ia).then(
        res => setFile({
          addr: ia,
          sn: res.snOfDoc,
          head: res.head,
          ref: res.ref
        })
      );
    }
  }, [boox, ia]);

  const [ open, setOpen ] = useState(false);
  const [ finalized, setFinalized ] = useState<boolean>(false);

  useEffect(()=>{
    if (ia && ia != '0x') {
      isFinalized(ia).then(
        res => setFinalized(res)
      );
    } 
  }, [ia]);

  return (
    <Stack direction='column' width='100%' height='100%' >
      <Box width={'100%'} height={'100%'} >
        <Paper elevation={3} sx={{m:2, p:1, border:1, height:'100%', borderColor:'divider' }}>
          <Stack direction='column' justifyContent='center' alignItems='center' >

            <Stack direction='row' sx={{ alignItems:'baseline' }} >

              <Typography sx={{ mt: 5, mb:2, mr:2, textDecoration:'underline' }} variant="h4" >
                <b>Investment Agreement</b>
              </Typography>

              {file && (
                <IndexCard file={file} open={open} setOpen={setOpen} />
              )}

              <Stack direction="row" sx={{ alignContent:'baseLine'}} >

                <Tooltip title="IndexCard" placement="top" arrow >
                  <IconButton 
                    size="large"
                    color="primary"
                    sx={{ mx:1 }}
                    onClick={()=>setOpen(true)}
                  >
                    <BookOutlined />
                  </IconButton>
                </Tooltip>

                <AgreementDownloader typeOfFile="IA" addrOfFile={ia} />

              </Stack>

            </Stack>

            <Tabs 
              size="md" 
              sx={{ 
                justifyContent:'center', 
                alignItems:'center' 
              }}
              value={index}
              onChange={(e,v)=>setIndex(v as number)} 
            >

              <TabList tabFlex={1} sx={{ width: 880 }}  >
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
                  <IaBodyTerms addr={ia} isFinalized={finalized} />
                )}
              </TabPanel>

              {!finalized && (
                <TabPanel value={1} sx={{ width:'100%', justifyContent:'center', alignItems:'center' }} >
                  {ia != '0x' && (
                    <AgrmtAccessControl isSha={false} agrmt={ia} />
                  )}
                </TabPanel>
              )}

              <TabPanel value={2} sx={{ width:'100%', justifyContent:'center', alignItems:'center' }} >
                {ia != '0x' && finalized != undefined && (
                  <Signatures addr={ia} initPage={true} finalized={finalized} isSha={ false }/>
                )}
              </TabPanel>

              <TabPanel value={3} sx={{ width:'100%', justifyContent:'center', alignItems:'center' }} >
                {ia != '0x' && finalized != undefined && (
                  <Signatures addr={ia} initPage={false} finalized={finalized} isSha={ false } />
                )}
              </TabPanel>

              <TabPanel value={4} sx={{ width:'100%', justifyContent:'center', alignItems:'center' }} >
                {finalized != undefined && (
                  <IaLifecycle addr={ia} isFinalized={finalized} />
                )}
              </TabPanel>

            </Tabs>

          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
} 

export default Ia;