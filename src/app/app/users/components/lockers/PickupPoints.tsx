
import { Paper, Stack, TextField } from '@mui/material';

import { 
  useRegCenterPickupPoints,
} from '../../../../../../generated';

import { AddrOfRegCenter, HexType } from '../../../common';
import { Redo } from '@mui/icons-material';
import { useState } from 'react';
import { refreshAfterTx } from '../../../common/toolsKit';
import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';

interface PickupPointsProps{
  hashLock: HexType;
  refresh: ()=>void;
  setOpen: (flag: boolean)=>void;
}

export function PickupPoints({hashLock, refresh, setOpen }:PickupPointsProps) {

  const { setErrMsg } = useComBooxContext();

  const [ hashKey, setHashKey ] = useState<string>();
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setOpen(false);
    setLoading(false);
  }

  const {
    isLoading: pickupPointsLoading,
    write: pickupPoints
  } = useRegCenterPickupPoints({
    address: AddrOfRegCenter,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  })

  const pickupPointsClick = ()=>{
    if (hashKey) 
      pickupPoints({
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
          disabled={ pickupPointsLoading } 
          loading={loading}
          loadingPosition='end'
          onClick={ pickupPointsClick }
          variant='contained'
          sx={{ m:1, minWidth:128 }} 
          endIcon={<Redo />}       
        >
          Pickup Points
        </LoadingButton>

      </Stack>

    </Paper>
  )
}
