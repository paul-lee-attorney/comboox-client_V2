
import { Dispatch, SetStateAction, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { 
  Alert, Collapse, IconButton, Stack,
} from '@mui/material';
import { Close, StopCircleOutlined }  from '@mui/icons-material';

import { useShareholdersAgreementFinalizeSha } from '../../../../../../../../generated-v1';

import { HexType } from '../../../../../common';
import { refreshAfterTx } from '../../../../../common/toolsKit';
import { useComBooxContext } from '../../../../../../_providers/ComBooxContextProvider';

interface FinalizeShaProps {
  addr: HexType;
  setIsFinalized: Dispatch<SetStateAction<boolean>>;
  setNextStep: Dispatch<SetStateAction<number>>;
}

export function FinalizeSha({ addr, setIsFinalized, setNextStep }: FinalizeShaProps) {

  const { setErrMsg } = useComBooxContext();

  const [ flag, setFlag ] = useState<boolean>(false);
  const [ open, setOpen ] = useState(false);

  const [ loading, setLoading ] = useState(false);

  const refresh = () => {
    setFlag(true);
    setIsFinalized(true);
    setLoading(false);
    setNextStep(1);
  }

  const {
    isLoading: finalizeShaLoading,
    write: finalizeSha,
  } = useShareholdersAgreementFinalizeSha({
    address: addr,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash:HexType = data.hash;
      refreshAfterTx(hash, refresh);
    }
  });

  return (
    <Stack direction={'row'}  sx={{ width: '100%' }} >

      <LoadingButton
        disabled={ finalizeShaLoading }
        loading = {loading}
        loadingPosition='end'
        sx={{m:1, width:'50%', height:55}}
        variant='outlined'
        endIcon={<StopCircleOutlined />}
        onClick={ () => finalizeSha?.() }
      >
        Finalize SHA
      </LoadingButton>

      <Collapse in={open} sx={{width:"50%"}}>        
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
          severity={ flag ? "success" : "warning"}
          sx={{ height: 55,  m: 1, }} 
        >
          { flag ? 'Is Finalized' : 'Still Pending' } 
        </Alert>
      </Collapse>


    </Stack>
  );
}
