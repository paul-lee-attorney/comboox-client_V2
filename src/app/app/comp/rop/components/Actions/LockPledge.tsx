import { useState } from "react";
import { useCompKeeperLockPledge } from "../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { Bytes32Zero, HexType } from "../../../../common";
import { ActionsOfPledgeProps } from "../ActionsOfPledge";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function LockPledge({pld, setOpen, refresh}:ActionsOfPledgeProps) {

  const { gk, setErrMsg } = useComBooxContext();
  
  const [ hashLock, setHashLock ] = useState<HexType>(Bytes32Zero);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: lockPledgeLoading,
    write: lockPledge,
  } = useCompKeeperLockPledge({
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
    lockPledge({
      args: [ 
        BigInt(pld.head.seqOfShare), 
        BigInt(pld.head.seqOfPld), 
        hashLock
      ],
    });
  }

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          label='HashLock'
          error={ valid['HashLock']?.error }
          helperText={ valid['HashLock']?.helpTx ?? ' ' }  
          sx={{
            m:1,
            minWidth: 688,
          }}
          onChange={(e) => {
            let input = HexParser( e.target.value );
            onlyHex('HashLock', input, 64, setValid);
            setHashLock( input );
          }}
          value={ hashLock }
          size='small'
        />

        <LoadingButton 
          disabled={ lockPledgeLoading || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 168, height: 40 }} 
          variant="contained" 
          endIcon={ <LockOutlined /> }
          onClick={ handleClick }
          size='small'
        >
          Lock
        </LoadingButton>        

      </Stack>
    </Paper>
  );

}


