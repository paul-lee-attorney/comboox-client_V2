import { useState } from "react";
import { useCompKeeperReleasePledge } from "../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { Key } from "@mui/icons-material";
import { ActionsOfPledgeProps } from "../ActionsOfPledge";
import { HexType } from "../../../../common";
import { refreshAfterTx } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function ReleasePledge({pld, setOpen, refresh}:ActionsOfPledgeProps) {

  const { gk, setErrMsg } = useComBooxContext();
  
  const [ key, setKey ] = useState<string>('');
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: releasePledgeLoading,
    write: releasePledge,
  } = useCompKeeperReleasePledge({
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
  
  const handleClick =()=>{
    releasePledge({
      args: [ 
          BigInt(pld.head.seqOfShare), 
          BigInt(pld.head.seqOfPld), 
          key
      ],
    })
  }

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          label='HashKey'
          sx={{
            m:1,
            minWidth: 618,
          }}
          onChange={(e) => setKey(e.target.value ?? '')}
          value={ key }
          size='small'
        />

        <LoadingButton 
          disabled={ releasePledgeLoading }
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 168, height: 40 }} 
          variant="contained" 
          endIcon={ <Key /> }
          onClick={ handleClick }
          size='small'
        >
          Release
        </LoadingButton>        

      </Stack>
    </Paper>
  );

}


