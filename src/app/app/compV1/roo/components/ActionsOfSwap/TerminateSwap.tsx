import { useGeneralKeeperTerminateSwap } from "../../../../../../../generated-v1";
import { Paper, Stack, TextField } from "@mui/material";
import { CancelOutlined } from "@mui/icons-material";
import { useState } from "react";
import { HexType } from "../../../../common";
import { refreshAfterTx } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfSwapProps } from "../ActionsOfSwap";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function TerminateSwap({seqOfOpt, seqOfSwap, setOpen, refresh}:ActionsOfSwapProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: terminateSwapLoading,
    write: terminateSwap,
  } = useGeneralKeeperTerminateSwap({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  })

  const handleClick = ()=> {
    terminateSwap({
      args:[ 
        BigInt(seqOfOpt), 
        BigInt(seqOfSwap)
      ],
    });
  };
  
  return(
    <Paper elevation={3} sx={{alignItems:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' >

        <TextField 
          variant='outlined'
          label='seqOfSwap'
          sx={{
            m:1,
            minWidth: 218,
          }}
          inputProps={{readOnly: true}}
          value={ seqOfSwap }
          size='small'
        />

        <LoadingButton 
          disabled={ seqOfSwap == 0 || terminateSwapLoading }
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={ <CancelOutlined /> }
          onClick={ handleClick }
          size='small'
        >
          Terminate Swap
        </LoadingButton>        

      </Stack>
    </Paper>
    
  );

}

