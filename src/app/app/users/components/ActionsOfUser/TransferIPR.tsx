
import { Alert, Collapse, IconButton, Paper, Stack, TextField } from '@mui/material';

import { 
  useRegCenterTransferIpr
} from '../../../../../../generated';

import { AddrOfRegCenter, HexType, MaxPrice, MaxUserNo } from '../../../common';
import { BorderColor, Close } from '@mui/icons-material';
import { useState } from 'react';
import { FormResults, defFormResults, getReceipt, hasError, longSnParser, onlyInt } from '../../../common/toolsKit';
import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';

export function TransferIPR() {

  const { setErrMsg } = useComBooxContext();

  const [ typeOfDoc, setTypeOfDoc ] = useState<string>('0');
  const [ version, setVersion ] = useState<string>('0');
  const [ transferee, setTransferee ] = useState<string>('0');
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ receipt, setReceipt ] = useState<string>('');
  const [ open, setOpen ] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);

  const {
    isLoading: transferIPRLoading,
    write: transferIPR
  } = useRegCenterTransferIpr({
    address: AddrOfRegCenter,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      getReceipt(hash).then(
        r => {
          console.log("Receipt: ", r);
          if (r) {
            let rType = BigInt(r.logs[0].topics[1]).toString();
            let rVersion = BigInt(r.logs[0].topics[2]).toString();
            let rTransferee = BigInt(r.logs[0].topics[3]).toString();

            let str = 'IPR of Doc (type:' + rType + ', version:' + rVersion 
              + ') is transferred to User:' +  longSnParser(rTransferee);

            setReceipt(str);
            setOpen(true);
            setLoading(false);
          }
        }
      )
    }
  })

  const transferIPRClick = ()=>{
    transferIPR({
      args:[ 
          BigInt(typeOfDoc), 
          BigInt(version),
          BigInt(transferee)
      ],
    });
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          size="small"
          variant='outlined'
          label='TypeOfDoc'
          error={ valid['TypeOfDoc']?.error }
          helperText={ valid['TypeOfDoc']?.helpTx ?? ' ' }                        
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ typeOfDoc }
          onChange={e => {
            let input = e.target.value;
            onlyInt('TypeOfDoc', input, MaxPrice, setValid);
            setTypeOfDoc(input);
          }}
        />

        <TextField 
          size="small"
          variant='outlined'
          label='Version'
          error={ valid['Version']?.error }
          helperText={ valid['Version']?.helpTx ?? ' ' }                        
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ version }
          onChange={e => {
            let input = e.target.value;
            onlyInt('Version', input, MaxPrice, setValid); 
            setVersion(input);
          }}
        />

        <TextField 
          size="small"
          variant='outlined'
          label='Transferee'
          error={ valid['Transferee']?.error }
          helperText={ valid['Transferee']?.helpTx ?? ' ' }                        
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ transferee }
          onChange={e => {
            let input = e.target.value;
            onlyInt('Transferee', input, MaxUserNo, setValid);
            setTransferee( input );
          }}
        />

        <LoadingButton 
          disabled={ transferIPRLoading || hasError(valid)}
          loading={loading}
          loadingPosition='end' 
          onClick={ transferIPRClick }
          variant='contained'
          sx={{ m:1, ml:2, minWidth:128, height:40 }} 
          endIcon={<BorderColor />}
        >
          Transfer
        </LoadingButton>

        <Collapse in={ open } sx={{ m:1 }} >
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

            variant="outlined" 
            severity='info' 
            sx={{ height: 45, p:0.5 }} 
          >
            {receipt}
          </Alert>          
        </Collapse>

      </Stack>
    </Paper>
  )
}
