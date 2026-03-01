
import { useEffect, useState } from 'react';

import { 
  Stack,
  Alert,
  Collapse,
  IconButton,
  InputLabel,
  InputAdornment,
  FormControl,
  OutlinedInput,
  FormHelperText,
} from '@mui/material';

import { Approval, Close }  from '@mui/icons-material';

import {
  useDraftControlSetRoleAdmin,
} from '../../../../../../../../generated';

import { AddrZero, HexType } from '../../../../../common';
import { ATTORNEYS, getGeneralCounsel } from '../../../../common/draftControl';

import { FormResults, HexParser, defFormResults, 
  hasError, onlyHex, refreshAfterTx 
} from '../../../../../common/toolsKit';
import { AccessControlProps } from './SetOwner';
import { useComBooxContext } from '../../../../../../_providers/ComBooxContextProvider';

export function SetGeneralCounsel({ addr }: AccessControlProps) {

  const { setErrMsg } = useComBooxContext();

  const [ newGC, setNewGC ] = useState<HexType>();
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ open, setOpen ] = useState(false);
  const [ time, setTime ] = useState(0);

  const [gc, setGC] = useState<HexType>(AddrZero);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    setTime(Date.now());
    setLoading(false);
  }
  
  useEffect(()=>{
    if (addr) {
      getGeneralCounsel(addr).then(
        res => {
          setNewGC(res);
          setOpen(true);
        }
      )
    }
  }, [addr, time])

  const {
    isLoading: setGeneralCounselLoading,
    write: setGeneralCounsel,
  } = useDraftControlSetRoleAdmin({
    address: addr,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      setOpen(false);
      let hash:HexType = data.hash;
      refreshAfterTx(hash, refresh);
    }
  });

  const handleClick = () => {
    setGeneralCounsel({
      args: [
        ATTORNEYS, 
        gc,
      ],
    });
  }

  return (
    <>
      <Stack direction={'row'} >

        <FormControl sx={{ m: 1, width: "50%" }} variant="outlined">
          <InputLabel htmlFor="setGC-input">SetGeneralCounsel</InputLabel>
          <OutlinedInput
            id="setGC-input"
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  disabled={ setGeneralCounselLoading || gc == undefined || gc == '0x' || hasError(valid) || loading}
                  color='primary'
                  onClick={ handleClick }
                  edge="end"
                >
                  <Approval />
                </IconButton>
              </InputAdornment>
            }
            label='SetGeneralCounsel'
            sx={{height: 55}}
            aria-describedby='setAcct-Help-Tx'
            error={ valid['AcctAddr']?.error }
            onChange={(e) => {
              let input = HexParser(e.target.value);
              onlyHex('AcctAddr', input, 40, setValid);
              setGC(input);
            }}
            value={ gc }
          />
        <FormHelperText id='setAcct-Help-Tx'>
          { valid['AcctAddr']?.helpTx ?? ' ' }
        </FormHelperText>                  
        </FormControl>

        <Collapse in={open} sx={{ width:"50%" }} >        
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
            severity='info' 
            sx={{ height: 55,  m: 1 }} 
          >
            General Counsel: { newGC?.substring(0, 6) + '...' + newGC?.substring(38, 42) } 
          </Alert>
        </Collapse>

      </Stack>
    </> 
  )
}
