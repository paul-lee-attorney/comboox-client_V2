
import { Paper, Stack } from '@mui/material';

import { 
  useRegCenterWithdrawPoints,
} from '../../../../../../generated';

import { AddrOfRegCenter, HexType } from '../../../common';
import { Undo } from '@mui/icons-material';
import { refreshAfterTx } from '../../../common/toolsKit';
import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';

interface WithdrawPointsProps{
  hashLock: HexType;
  refresh: ()=>void;
  setOpen: (flag: boolean)=>void;
}

export function WithdrawPoints({hashLock, refresh, setOpen}:WithdrawPointsProps) {

  const { setErrMsg } = useComBooxContext();

  const [loading, setLoading] = useState(false);

  const updateResults = ()=>{
    refresh();
    setOpen(false);
    setLoading(false);
  }

  const {
    isLoading: withdrawPointsLoading,
    write: withdrawPoints
  } = useRegCenterWithdrawPoints({
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

  const withdrawPointsClick = ()=>{
    withdrawPoints({
      args: [ hashLock ],
    })
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >    
      <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >

        <LoadingButton 
          size='small'
          disabled={  withdrawPointsLoading } 
          loading={loading}
          loadingPosition='end'
          onClick={ withdrawPointsClick }
          variant='contained'
          sx={{ m:1, minWidth:128 }} 
          endIcon={<Undo />}       
        >
          Withdraw Points
        </LoadingButton>

      </Stack>

    </Paper>
  )
}
