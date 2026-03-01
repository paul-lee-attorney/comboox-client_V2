
import { useState } from 'react';

import { 
  Stack,
  TextField,
} from '@mui/material';

import { ManageAccountsOutlined }  from '@mui/icons-material';

import { AddrZero, HexType } from '../../../../../../common';
import { FormResults, HexParser, defFormResults, 
  hasError, onlyHex, refreshAfterTx } from '../../../../../../common/toolsKit';

import { ActionsOfOwnerProps } from '../ActionsOfOwner';

import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../../../../../_providers/ComBooxContextProvider';
import { useOwnableSetNewOwner } from '../../../../../../../../../generated-v1';


export function SetNewOwner({ addr, refresh }: ActionsOfOwnerProps) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [loading, setLoading] = useState(false);

  const [ owner, setOwner ] = useState<HexType>(AddrZero);

  const updateResults = ()=>{
    setLoading(false);
    refresh();
  }


  const {
    isLoading: transferOwnershipLoading,
    write: transferOwnership,
  } = useOwnableSetNewOwner({
    address: addr,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash:HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  const handleClick = () => {
    transferOwnership({
      args: [ owner ],
    });
  }

  return (
    <Stack direction={'row'}  sx={{ width: '100%' }} >

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
        value={ owner }
        onChange={e => {
          let input = HexParser(e.target.value ?? '0');
          onlyHex('NewOwner(Addr)', input, 40, setValid);
          setOwner(input);
        }}
      />

      <LoadingButton
        disabled={ transferOwnershipLoading || hasError(valid) } 
        loading={loading}
        loadingPosition='end'
        onClick={ handleClick }
        variant='contained'
        sx={{ m:1, mx:2, minWidth:128, height:40 }} 
        endIcon={<ManageAccountsOutlined />}       
        size='small'
      >
        Transfer
      </LoadingButton>

    </Stack>
  )
}
