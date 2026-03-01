
import { Paper, Stack, TextField } from '@mui/material';

import { 
  useRegCenterTransferOwnership
} from '../../../../../../generated';

import { AddrOfRegCenter, AddrZero, HexType } from '../../../common';
import { BorderColor } from '@mui/icons-material';
import { useState } from 'react';
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from '../../../common/toolsKit';
import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';
import { ActionsOfOwnerProps } from '../ActionsOfOwner';


export function TransferOwnership({ refresh }:ActionsOfOwnerProps) {

  const { setErrMsg } = useComBooxContext();

  const [ newOwner, setNewOwner ] = useState<HexType>(AddrZero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [loading, setLoading] = useState(false);

  const updateResults = ()=> {
    refresh();
    setLoading(false);
  }

  const {
    isLoading: transferOwnershipLoading,
    write: transferOwnership
  } = useRegCenterTransferOwnership({
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

  const transferOwnershipClick = ()=>{
    transferOwnership({args:[
      newOwner,
    ]})
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{alignItems:'start', justifyContent:'start'}} >

        <TextField 
          size="small"
          variant='outlined'
          label='NewOwner'
          error = { valid['NewOwner']?.error }
          helperText = { valid['NewOwner']?.helpTx ?? ' ' }
          
          sx={{
            m:1,
            minWidth: 456,
          }}
          value={ newOwner }
          onChange={e => {
            let input = HexParser( e.target.value );
            onlyHex('NewOwner', input, 40, setValid);
            setNewOwner(input);
          }}
        />

        <LoadingButton 
          disabled={ transferOwnershipLoading || hasError(valid) } 
          loading={loading}
          loadingPosition='end'
          onClick={ transferOwnershipClick }
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
