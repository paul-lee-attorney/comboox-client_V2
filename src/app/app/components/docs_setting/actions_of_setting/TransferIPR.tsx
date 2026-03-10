
import { Alert, Collapse, IconButton, Paper, Stack, TextField } from '@mui/material';

import { 
  useRegCenterTransferIpr
} from '../../../../../../generated';

import { AddrOfRegCenter, HexType, MaxPrice, MaxUserNo } from '../../../common';
import { BorderColor, Close } from '@mui/icons-material';
import { useState } from 'react';
import { 
  FormResults, defFormResults, getReceipt, hasError, 
  onlyHex, hexToBigInt, HexParser, userNoParser
} from '../../../common/toolsKit';
import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';
import { ActionsOfSettingProps } from '../ActionsOfSetting';

export function TransferIPR({addr, titleOfTemp, typeOfDoc, version, setTime, setOpen}: ActionsOfSettingProps ) {

  const { setErrMsg } = useComBooxContext();

  const [ transferee, setTransferee ] = useState<string>('0');
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ receipt, setReceipt ] = useState<string>('');
  const [ show, setShow ] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);

  const updateResults = ()=>{
    setLoading(false);
    setShow(true);
    setTime( Date.now());
    // setOpen(false);
  }

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
            let rType = Number(r.logs[0].topics[1]).toString(16);
            let rVersion = BigInt(r.logs[0].topics[2]).toString();
            let rTransferee = userNoParser(Number(r.logs[0].topics[3]).toString(16));

            let str = 'IPR of Temp transferred to User: ' +  rTransferee;

            setReceipt(str);
            updateResults();
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
          hexToBigInt(transferee)
      ],
    });
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          size="small"
          variant='outlined'
          label='TitleOfTemp'
          inputProps={{readOnly: true}}
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ titleOfTemp }
        />

        <TextField 
          size="small"
          variant='outlined'
          label='TypeOfDoc'
          inputProps={{readOnly: true}}
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ HexParser(typeOfDoc.toString(16)) }
        />

        <TextField 
          size="small"
          variant='outlined'
          label='Version'
          inputProps={{readOnly: true}}
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ version }
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
            onlyHex('Transferee', input, 10, setValid);
            setTransferee( input );
          }}
        />

        <LoadingButton 
          disabled={ transferIPRLoading || hasError(valid) || !typeOfDoc || !version }
          loading={loading}
          loadingPosition='end' 
          onClick={ transferIPRClick }
          variant='contained'
          sx={{ m:1, ml:2, minWidth:128, height:40 }} 
          endIcon={<BorderColor />}
        >
          Transfer
        </LoadingButton>

        <Collapse in={ show } sx={{ m:1 }} >
          <Alert 
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setShow(false);
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
