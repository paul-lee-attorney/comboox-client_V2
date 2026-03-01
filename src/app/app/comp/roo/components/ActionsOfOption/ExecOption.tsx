import { ActionsOfOptionProps } from "../ActionsOfOption";
import { useCompKeeperExecOption } from "../../../../../../../generated";
import { Paper, Stack } from "@mui/material";
import { DoneOutline } from "@mui/icons-material";
import { HexType } from "../../../../common";
import { refreshAfterTx } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function ExecOption({seqOfOpt, setOpen, refresh}:ActionsOfOptionProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ loading, setLoading ] = useState(false);
  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: execOptLoading,
    write: execOpt,
  } = useCompKeeperExecOption({
    address: gk,
    args: [ BigInt(seqOfOpt) ],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  })

  return(
    <Paper elevation={3} sx={{alignItems:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' >

        <LoadingButton 
          disabled={ execOptLoading }
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 168, height: 40 }} 
          variant="contained" 
          endIcon={ <DoneOutline /> }
          onClick={()=>execOpt?.() }
          size='small'
        >
          Exercise
        </LoadingButton>        

      </Stack>
    </Paper>
    
  );

}

