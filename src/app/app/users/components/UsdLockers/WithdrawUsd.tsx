
import { Paper, Stack } from '@mui/material';

import { 
  useCashLockersWithdrawUsd,
} from '../../../../../../generated';

import { AddrZero, HexType, } from '../../../common';
import { Undo } from '@mui/icons-material';
import { refreshAfterTx } from '../../../common/toolsKit';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';
import { getCashLockersAddr } from '../../../cl';

interface WithdrawUsdProps{
  hashLock: HexType;
  refresh: ()=>void;
  setOpen: (flag: boolean)=>void;
}

export function WithdrawUsd({hashLock, refresh, setOpen}:WithdrawUsdProps) {

  const { setErrMsg } = useComBooxContext();

  const [loading, setLoading] = useState(false);

  const updateResults = ()=>{
    refresh();
    setOpen(false);
    setLoading(false);
  }

  const [ addrCashLockers, setAddrCashLockers ] = useState<HexType>(AddrZero);
  useEffect(()=>{
    getCashLockersAddr().then(
      addr => {
        if (addr != AddrZero) {
          setAddrCashLockers(addr);
        } else {
          setErrMsg('CashLockers contract is not deployed yet.');
        }
      }
    ) 
  }, [setErrMsg]);  

  const {
    isLoading: withdrawUsdLoading,
    write: withdrawUsd
  } = useCashLockersWithdrawUsd({
    address: addrCashLockers,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  })

  const withdrawUsdClick = ()=>{
    withdrawUsd({
      args: [ hashLock ],
    })
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >    
      <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >

        <LoadingButton 
          size='small'
          disabled={  withdrawUsdLoading || addrCashLockers === AddrZero } 
          loading={loading}
          loadingPosition='end'
          onClick={ withdrawUsdClick }
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
