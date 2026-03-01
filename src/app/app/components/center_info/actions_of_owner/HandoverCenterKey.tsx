
import { Paper, Stack, TextField } from '@mui/material';

import { 
  useRegCenterHandoverCenterKey,
} from '../../../../../../generated';

import { AddrOfRegCenter, AddrZero, HexType } from '../../../common';
import { BorderColor, } from '@mui/icons-material';
import { useState } from 'react';
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from '../../../common/toolsKit';

import { LoadingButton } from '@mui/lab';
import { ActionsOfOwnerProps } from '../ActionsOfOwner';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';

export function HandoverCenterKey({refresh}:ActionsOfOwnerProps) {

  const { setErrMsg } = useComBooxContext();

  const [ newKeeper, setNewKeeper ] = useState<HexType>(AddrZero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [loading, setLoading] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: handoverCenterKeyLoading,
    write: handoverCenterKey
  } = useRegCenterHandoverCenterKey({
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

  const handoverCenterKeyClick = ()=>{
    handoverCenterKey({args:[newKeeper]});
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{alignItems:'start', justifyContent:'start'}} >

        <TextField 
          size="small"
          variant='outlined'
          label='NewKeeper'
          error={ valid['NewKeeper']?.error }
          helperText={ valid['NewKeeper']?.helpTx ?? ' ' }
          sx={{
            m:1,
            mb:3,
            minWidth: 456,
          }}
          value={ newKeeper }
          onChange={e => {
            let input = HexParser( e.target.value );
            onlyHex('NewKeeper', input, 40, setValid);
            setNewKeeper( input );
          }}
        />

        <LoadingButton 
          disabled={ handoverCenterKeyLoading || hasError(valid) } 
          loading={loading}
          loadingPosition='end'
          onClick={handoverCenterKeyClick}
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
