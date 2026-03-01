import { useState } from "react";
import { Box, Collapse, Paper, Stack, Switch, Toolbar, Typography } from "@mui/material";
import { EmojiPeople, } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { useCompKeeperProposeMotionToGeneralMeeting } from "../../../../../../../generated";
import { HexType } from "../../../../common";
import { refreshAfterTx } from "../../../../common/toolsKit";

import { ActionsOnMotionProps } from "../ActionsOnMotion";

import { EntrustDelegaterForGeneralMeeting } from "./EntrustDelegaterForGeneralMeeting";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function ProposeMotionToGeneralMeeting({ motion, setOpen, refresh }: ActionsOnMotionProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ loading, setLoading ] = useState(false);
  
  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: proposeMotionToGmLoading,
    write: proposeMotionToGm,
  } = useCompKeeperProposeMotionToGeneralMeeting({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  const handleClick = ()=>{
    proposeMotionToGm({
      args: [ motion.head.seqOfMotion ],
    })
  }

  const [ appear, setAppear ] = useState(false);

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1, width:'100%' }} >

      <Stack direction={'row'} sx={{ alignItems:'center', color:'black' }} >

        <Box sx={{ minWidth:200 }} >
          <Toolbar >
            <h4>Propose Motion: </h4>
          </Toolbar>
        </Box>

        <Typography>
          Propose Directly
        </Typography>

        <Switch 
          color="primary" 
          onChange={(e) => setAppear( e.target.checked )} 
          checked={ appear } 
        />

        <Typography>
          Entrust Delegate
        </Typography>

      </Stack>

      <Collapse in={ !appear } >
        <Stack direction="row" sx={{ alignItems:'center' }} >
         <LoadingButton
            disabled={ !proposeMotionToGm || proposeMotionToGmLoading }
            loading={loading}
            loadingPosition="end"
            variant="contained"
            endIcon={<EmojiPeople />}
            sx={{ m:1, minWidth:128 }}
            onClick={ handleClick }
          >
            Propose
          </LoadingButton>
        </Stack>
      </Collapse>

      <Collapse in={ appear } >
        <EntrustDelegaterForGeneralMeeting 
          motion={motion}
          setOpen={setOpen}
          refresh={refresh}
        />
      </Collapse>

    </Paper>
  );
}



