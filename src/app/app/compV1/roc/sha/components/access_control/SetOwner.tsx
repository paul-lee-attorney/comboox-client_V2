
import { useState, useEffect } from 'react';

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

import { useOwnableSetNewOwner } from '../../../../../../../../generated-v1';

import { AddrZero, HexType } from '../../../../../common';
import { getOwner } from '../../../../../common/ownable';

import { FormResults, HexParser, defFormResults, 
  hasError, onlyHex, refreshAfterTx 
} from '../../../../../common/toolsKit';
import { useComBooxContext } from '../../../../../../_providers/ComBooxContextProvider';

export interface AccessControlProps{
  addr: HexType;
}

export function SetOwner({ addr }: AccessControlProps) {

  const { setErrMsg } = useComBooxContext();
  
  const [owner, setOwner] = useState<HexType>(AddrZero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ time, setTime ] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = ()=>{
    setTime(Date.now());
    setLoading(false);
  }

  const [ newOwner, setNewOwner ] = useState<HexType>();
  const [ open, setOpen ] = useState(false);

  useEffect(() => { 
    getOwner(addr).then(
      owner => {
        setNewOwner(owner);
        setOpen(true);
    });
  }, [ addr, time ]);

  const {
    isLoading: setOwnrLoading,
    write: setOwnr,
  } = useOwnableSetNewOwner({
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

  const handleClick = () => {
    setOwnr({
      args: [ owner ],
    });
  }

  return (
    <Stack direction={'row'}  sx={{ width: '100%' }} >

      <FormControl sx={{ m: 1, width: '50%' }} variant="outlined">
        <InputLabel htmlFor="setOwner-input">SetOwner</InputLabel>
        <OutlinedInput
          id="setOwner-input"
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                color="primary"
                disabled={ owner == undefined || owner == '0x' || setOwnrLoading || hasError(valid) || loading}
                onClick={ handleClick }
                edge="end"
              >
                <Approval />
              </IconButton>
            </InputAdornment>
          }
          label='SetOwner'
          sx={{ height:55 }}
          aria-describedby='setAcct-Help-Tx'
          error={ valid['AcctAddr']?.error }
          onChange={(e) => {
            let input = HexParser(e.target.value);
            onlyHex('AcctAddr', input, 40, setValid);
            setOwner(input);
          }}
          value={ owner }
        />
        <FormHelperText id='setAcct-Help-Tx'>
          { valid['AcctAddr']?.helpTx ?? ' ' }
        </FormHelperText>                          
      </FormControl>

      <Collapse in={open} sx={{ width:'50%' }}>        
        <Alert 
          action={
            <IconButton
              aria-label="close"
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
          sx={{ m:1, height:55 }} 
        >
          Owner: { newOwner?.substring(0, 6) + '...' + newOwner?.substring(38, 42) } 
        </Alert>
      </Collapse>

    </Stack>
  )
}
