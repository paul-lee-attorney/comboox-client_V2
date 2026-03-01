
import { Paper, Stack, TextField } from '@mui/material';

import { useUsdFuelTankSetNewOwner } from '../../../../../generated';

import { AddrOfTank, AddrZero, HexType } from '../../common';
import { ManageAccountsOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from '../../common/toolsKit';
import { LoadingButton } from '@mui/lab';
import { ActionOfFuelProps } from '../ActionsOfFuel';
import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';

export function SetNewOwner({ refresh }: ActionOfFuelProps) {

  const { setErrMsg } = useComBooxContext();

  const [ newOwner, setNewOwner ] = useState(AddrZero);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [loading, setLoading] = useState(false);

  const updateResults = ()=> {
    refresh();
    setLoading(false);
  }

  const {
    isLoading: setOwnerLoading,
    write: setOwner
  } = useUsdFuelTankSetNewOwner({
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

  const setOwnerClick = ()=>{
    setOwner({
      args:[ newOwner ]
    });
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{alignItems:'start', justifyContent:'start'}} >

      <TextField 
          size="small"
          variant='outlined'
          label='NewOwner (Addr)'
          error={ valid['NewOwner(Addr)']?.error }
          helperText={ valid['NewOwner(Addr)']?.helpTx ?? ' ' }                                  
          sx={{
            m:1,
            minWidth: 550,
          }}
          value={ newOwner }
          onChange={e => {
            let input = HexParser(e.target.value ?? '0');
            onlyHex('NewOwner(Addr)', input, 40, setValid);
            setNewOwner(input);
          }}
        />

        <LoadingButton
          disabled={ setOwnerLoading || hasError(valid) } 
          loading={loading}
          loadingPosition='end'
          onClick={ setOwnerClick }
          variant='contained'
          sx={{ m:1, mx:2, minWidth:128 }} 
          endIcon={<ManageAccountsOutlined />}       
        >
          Set
        </LoadingButton>

      </Stack>
    </Paper>
  )
}
