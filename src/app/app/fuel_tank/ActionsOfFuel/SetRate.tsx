
import { Paper, Stack, TextField } from '@mui/material';

import { useUsdFuelTankSetRate } from '../../../../../generated';

import { HexType } from '../../common';
import { Settings } from '@mui/icons-material';
import { useState } from 'react';
import { FormResults, defFormResults, hasError, onlyNum, refreshAfterTx, strNumToBigInt } from '../../common/toolsKit';
import { LoadingButton } from '@mui/lab';
import { ActionOfFuelProps } from '../ActionsOfFuel';
import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';

export function SetRate({ addrFT, refresh }: ActionOfFuelProps) {

  const { setErrMsg } = useComBooxContext();

  const [ rate, setRate ] = useState('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [loading, setLoading] = useState(false);

  const updateResults = ()=> {
    refresh();
    setLoading(false);
  }

  const {
    isLoading: setNewRateLoading,
    write: setNewRate
  } = useUsdFuelTankSetRate({
    address: addrFT,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  })

  const setRateClick = ()=>{
    setNewRate({
      args: [ strNumToBigInt(rate, 6) ]
    });
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{alignItems:'start', justifyContent:'start'}} >

      <TextField 
          size="small"
          variant='outlined'
          label='Rate (CBP/USD)'
          error={ valid['Rate(CBP/USD)']?.error }
          helperText={ valid['Rate(CBP/USD)']?.helpTx ?? ' ' }                                  
          sx={{
            m:1,
            minWidth: 218,
          }}
          value={ rate }
          onChange={e => {
            let input = (e.target.value ?? '0');
            onlyNum('Rate(CBP/USD)', input, 0n, 6, setValid);
            setRate(input);
          }}
        />

        <LoadingButton
          disabled={ setNewRateLoading || hasError(valid) } 
          loading={loading}
          loadingPosition='end'
          onClick={ setRateClick }
          variant='contained'
          sx={{ m:1, mx:2, minWidth:128 }} 
          endIcon={<Settings />}       
        >
          Set
        </LoadingButton>

      </Stack>
    </Paper>
  )
}
