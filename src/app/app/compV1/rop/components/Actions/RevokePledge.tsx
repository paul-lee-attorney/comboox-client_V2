import { useGeneralKeeperRevokePledge } from "../../../../../../../generated-v1";
import { Paper, Stack } from "@mui/material";
import { Block } from "@mui/icons-material";
import { ActionsOfPledgeProps } from "../ActionsOfPledge";
import { HexType } from "../../../../common";
import { refreshAfterTx } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function RevokePledge({pld, setOpen, refresh}:ActionsOfPledgeProps) {

  const { gk, setErrMsg } = useComBooxContext();
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: revokePledgeLoading,
    write: revokePledge,
  } = useGeneralKeeperRevokePledge({
    address: gk,
    args: [BigInt(pld.head.seqOfShare), BigInt(pld.head.seqOfPld)],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }    
  });

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <LoadingButton 
          disabled={ !revokePledge || revokePledgeLoading }
          loading = {loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 168, height: 40 }} 
          variant="contained" 
          endIcon={ <Block /> }
          onClick={()=>revokePledge?.() }
          size='small'
        >
          Revoke
        </LoadingButton>        

      </Stack>
    </Paper>
  );

}


