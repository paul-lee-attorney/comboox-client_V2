
import { useState } from 'react';

import { 
  Stack,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';

import { Skateboarding, Close, }  from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import { useDraftControlRenounceRole } from '../../../../../../../../generated';

import { AccessControlProps } from './SetOwner';

import { ATTORNEYS } from '../../../../common/draftControl';
import { HexType } from '../../../../../common';
import { refreshAfterTx } from '../../../../../common/toolsKit';
import { useComBooxContext } from '../../../../../../_providers/ComBooxContextProvider';

export function QuitAttorney({ addr }: AccessControlProps) {

  const { setErrMsg } = useComBooxContext();

  const [ flag, setFlag ] = useState(false);
  const [ open, setOpen ] = useState(false);

  const [loading, setLoading] = useState(false);

  const refresh = ()=>{
    setFlag(true);
    setOpen(true);
    setLoading(false);
  }

  const {
    isLoading: quitAttorneyLoading,
    write: quitAttorney,
  } = useDraftControlRenounceRole({
    address: addr,
    args: [ ATTORNEYS ],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash:HexType = data.hash;
      refreshAfterTx(hash, refresh);
    }
  });

  const handleClick = () => {
    quitAttorney?.();
  }

  return (
    <>
      <Stack direction={'row'}  sx={{ width: '100%' }} >

        <LoadingButton
          disabled={ quitAttorneyLoading }
          loading={loading}
          loadingPosition='end'
          sx={{m:1, width: '50%', height:55}}
          variant='outlined'
          endIcon={<Skateboarding />}
          onClick={ handleClick }
        >
          Quit Attorney
        </LoadingButton>

        <Collapse in={open} sx={{width:'50%'}}>        
          <Alert 
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setOpen(false);
                }}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }

            variant='outlined' 
            severity={ flag ? "warning" : "success" } 
            sx={{ height: 55,  m: 1, }} 
          >
            { flag ? 'Not Attorney' : 'Is Attorney' } 
          </Alert>
        </Collapse>

      </Stack>
    </> 
  )
}
