
import { Paper, Stack, TextField } from '@mui/material';

import { AddrOfCL, HexType } from '../../../common';
import { Redo } from '@mui/icons-material';
import { useState } from 'react';
import { refreshAfterTx } from '../../../common/toolsKit';
import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';
import { useCashLockersUnlockUsd } from '../../../../../../generated';

interface PickupUsdProps{
  hashLock: HexType;
  refresh: ()=>void;
  setOpen: (flag: boolean)=>void;
}

export function PickupUsd({hashLock, refresh, setOpen }:PickupUsdProps) {

  const { setErrMsg } = useComBooxContext();

  const [ hashKey, setHashKey ] = useState<string>();
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setOpen(false);
    setLoading(false);
  }

  const {
    isLoading: pickupUsdLoading,
    write: pickupUsd
  } = useCashLockersUnlockUsd({
    address: AddrOfCL,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  })

  const pickupUsdClick = ()=>{
    if (hashKey) 
      pickupUsd({
        args:[hashLock, hashKey] 
      });
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >

        <TextField 
          size="small"
          variant='outlined'
          label='HashKey'
          sx={{
            m:1,
            minWidth: 456,
          }}
          value={ hashKey }
          onChange={e => setHashKey(e.target.value)}
        />

        <LoadingButton 
          size='small'
          disabled={ pickupUsdLoading } 
          loading={loading}
          loadingPosition='end'
          onClick={ pickupUsdClick }
          variant='contained'
          sx={{ m:1, minWidth:128 }} 
          endIcon={<Redo />}       
        >
          Pickup USD
        </LoadingButton>

      </Stack>

    </Paper>
  )
}
