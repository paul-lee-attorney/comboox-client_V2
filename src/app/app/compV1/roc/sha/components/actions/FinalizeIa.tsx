
import { Dispatch, SetStateAction, useState } from 'react';

import { 
  Alert, Collapse, IconButton, Stack,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Close, StopCircleOutlined }  from '@mui/icons-material';

import { 
  useInvestmentAgreementFinalizeIa,
} from '../../../../../../../../generated-v1';

import { HexType } from '../../../../../common';
import { refreshAfterTx } from '../../../../../common/toolsKit';
import { useComBooxContext } from '../../../../../../_providers/ComBooxContextProvider';

interface FinalizeIaProps {
  addr: HexType;
  setIsFinalized: Dispatch<SetStateAction<boolean>>;
  setNextStep: Dispatch<SetStateAction<number>>;
}

export function FinalizeIa({ addr, setIsFinalized, setNextStep }: FinalizeIaProps) {

  const { setErrMsg } = useComBooxContext();

  const [ flag, setFlag ] = useState<boolean>(false);
  const [ open, setOpen ] = useState(false);
  const [ loading, setLoading ] = useState(false);

  const refresh = ()=>{
    setFlag(true);
    setIsFinalized(true);
    setLoading(false);
    setNextStep(1);
  }

  const {
    isLoading: finalizeIaLoading,
    write: finalizeIa,
  } = useInvestmentAgreementFinalizeIa({
    address: addr,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refresh);
    }
  });

  return (
    <Stack direction={'row'}  sx={{ width: '100%' }} >

      <LoadingButton
        disabled={ finalizeIaLoading }
        loading = {loading}
        loadingPosition='end'
        sx={{m:1, width:'50%', height:55}}
        variant='outlined'
        endIcon={<StopCircleOutlined />}
        onClick={ () => finalizeIa?.() }
      >
        Finalize Ia
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
