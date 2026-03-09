import { Dispatch, SetStateAction, useState } from "react";

import { useIbmmKeeperProposeMotionToBoard, ibmmKeeperABI } from "../../../../../../../generated";

import { Box, Collapse, Paper, Stack, Switch, Toolbar, Typography } from "@mui/material";
import { EmojiPeople, } from "@mui/icons-material";
import { HexType, AddrZero } from "../../../../common";
import { EntrustDelegaterForBoardMeeting } from "./EntrustDelegaterForBoardMeeting";
import { refreshAfterTx } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { Hex } from "viem";
import { getPublicClient, getWalletClient } from "@wagmi/core";
import { useWalletClient } from "wagmi";

export interface ProposeMotionProps {
  seqOfMotion: bigint,
  setOpen: Dispatch<SetStateAction<boolean>>,
  refresh: ()=>void;
}

export function ProposeMotionToBoardMeeting({ seqOfMotion, setOpen, refresh }: ProposeMotionProps) {

  const { gk, setErrMsg } = useComBooxContext();
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setOpen(false);
    setLoading(false);
  }

  const {
    isLoading: proposeMotionToBoardLoading,
    write: proposeMotionToBoard,
  } = useIbmmKeeperProposeMotionToBoard({
    address: gk,
    args: [ seqOfMotion ],
    onError(err) {
      console.log("err:", err, "\n");
      setErrMsg(err.message + err.name);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

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
            disabled={ !proposeMotionToBoard || proposeMotionToBoardLoading }
            loading={loading}
            loadingPosition="end"
            variant="contained"
            endIcon={<EmojiPeople />}
            sx={{ m:1, minWidth:118 }}
            onClick={()=>proposeMotionToBoard?.()}
          >
            Propose
          </LoadingButton>
        </Stack>
      </Collapse>

      <Collapse in={ appear } >
        <EntrustDelegaterForBoardMeeting 
          seqOfMotion={seqOfMotion} 
          setOpen={setOpen} 
          refresh={refresh} 
        />
      </Collapse>

    </Paper>
  );
}



