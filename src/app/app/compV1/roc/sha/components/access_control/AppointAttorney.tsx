
import { useState } from 'react';

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

import { Close, PersonAdd }  from '@mui/icons-material';

import {
  useDraftControlGrantRole,
} from '../../../../../../../../generated-v1';

import { AddrZero, HexType } from '../../../../../common';
import { ATTORNEYS, hasRole } from '../../../../common/draftControl';
import { FormResults, HexParser, defFormResults, 
  hasError, onlyHex, refreshAfterTx 
} from '../../../../../common/toolsKit';
import { AccessControlProps } from './SetOwner';
import { useComBooxContext } from '../../../../../../_providers/ComBooxContextProvider';

export function AppointAttorney({ addr }: AccessControlProps) {

  const { setErrMsg } = useComBooxContext();

  const [acct, setAcct] = useState<HexType>(AddrZero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ flag, setFlag ] = useState<boolean>();
  const [ open, setOpen ] = useState(false);
  const [ loading, setLoading ] = useState(false);

  const refresh = ()=>{
    setLoading(false);
    if (acct)
      hasRole(addr, ATTORNEYS, acct).then(flag => {
        setFlag(flag);
        setOpen(true);
      }); 
  }

  const {
    isLoading: grantRoleLoading,
    write: grantRole,
  } = useDraftControlGrantRole({
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
    grantRole({
      args: [
        ATTORNEYS, 
        acct
      ],
    });
  }

  return (
      <Stack direction={'row'}  sx={{ width: '100%' }} >

        <FormControl sx={{ m: 1, width: '50%' }} variant="outlined">
          <InputLabel htmlFor="setAcct-input">AppointAttorney</InputLabel>
          <OutlinedInput
            id="setAcct-input"
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  color='primary'
                  disabled={ grantRoleLoading || acct == undefined || acct == '0x' || hasError(valid) || loading}
                  onClick={ handleClick }
                  edge="end"
                >
                  <PersonAdd />
                </IconButton>
              </InputAdornment>
            }
            label='AppointAttorney'
            aria-describedby='setAcct-Help-Tx'
            error={ valid['AcctAddr']?.error }
            sx={{ height:55 }}
            onChange={(e) => {
              let input = HexParser(e.target.value ?? '');
              onlyHex('AcctAddr', input, 40, setValid);
              setAcct(input);
            }}
            value={ acct }
          />
          <FormHelperText id='setAcct-Help-Tx'>
            { valid['AcctAddr']?.helpTx ?? ' ' }
          </FormHelperText>
        </FormControl>

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
            { flag ? 'Is Attorney' : 'Not Attorney' } 
          </Alert>
        </Collapse>

      </Stack>
  )
}
