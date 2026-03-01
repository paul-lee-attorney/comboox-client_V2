
import { Paper, Stack, TextField } from '@mui/material';

import { useFuelTankSetRate, useUsdFuelTankSetRate } from '../../../../../generated';

import { AddrOfTank, HexType } from '../../common';
import { Settings } from '@mui/icons-material';
import { useState } from 'react';
import { FormResults, defFormResults, hasError, onlyNum, refreshAfterTx, strNumToBigInt } from '../../common/toolsKit';
import { LoadingButton } from '@mui/lab';
import { ActionOfFuelProps } from '../ActionsOfFuel';
import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';

export function SetRate({ refresh }: ActionOfFuelProps) {

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
    address: AddrOfTank,
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
      args: [ strNumToBigInt(rate, 4) ]
    });
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{alignItems:'start', justifyContent:'start'}} >

      <TextField 
          size="small"
          variant='outlined'
          label='Rate (CBP/ETH)'
          error={ valid['Rate(CBP/ETH)']?.error }
          helperText={ valid['Rate(CBP/ETH)']?.helpTx ?? ' ' }                                  
          sx={{
            m:1,
            minWidth: 218,
          }}
          value={ rate }
          onChange={e => {
            let input = (e.target.value ?? '0');
            onlyNum('Rate(CBP/ETH)', input, 0n, 4, setValid);
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
