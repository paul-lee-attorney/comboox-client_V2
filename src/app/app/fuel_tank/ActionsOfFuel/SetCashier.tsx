
import { useState } from 'react';

import { Paper, Stack, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { BorderColor } from '@mui/icons-material';

import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';

import { AddrZero, HexType } from '../../common';
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from '../../common/toolsKit';

import { ActionOfFuelProps } from '../ActionsOfFuel';
import { useUsdFuelTankSetCashier } from '../../../../../generated';

export function SetCashier({ addrFT, refresh }:ActionOfFuelProps) {

  const { setErrMsg } = useComBooxContext();

  const [ newCashier, setNewCashier ] = useState<HexType>(AddrZero);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [loading, setLoading] = useState(false);

  const updateResults = ()=> {
    refresh();
    setLoading(false);
  }

  const {
    isLoading: setCashierLoading,
    write: setCashier
  } = useUsdFuelTankSetCashier({
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

  const setCashierClick = ()=>{
    setCashier({args:[
      newCashier,
    ]})
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{alignItems:'start', justifyContent:'start'}} >

        <TextField 
          size="small"
          variant='outlined'
          label='NewCashier'
          error = { valid['NewCashier']?.error }
          helperText = { valid['NewCashier']?.helpTx ?? ' ' }
          
          sx={{
            m:1,
            minWidth: 456,
          }}
          value={ newCashier }
          onChange={e => {
            let input = HexParser( e.target.value );
            onlyHex('NewCashier', input, 40, setValid);
            setNewCashier(input);
          }}
        />

        <LoadingButton 
          disabled={ setCashierLoading || hasError(valid) } 
          loading={loading}
          loadingPosition='end'
          onClick={ setCashierClick }
          variant='contained'
          sx={{ m:1, ml:2, minWidth:128 }} 
          endIcon={<BorderColor />}
        >
          Set
        </LoadingButton>

      </Stack>
    </Paper>
  )
}
