
import { Divider, Paper, Stack, TextField } from '@mui/material';

import { 
  useRegCenterLockPoints,
} from '../../../../../../generated';

import { AddrOfRegCenter, Bytes32Zero, HexType, MaxLockValue, MaxUserNo } from '../../../common';
import { LockClockOutlined, } from '@mui/icons-material';
import { useState } from 'react';
import { DateTimeField } from '@mui/x-date-pickers';

import { StrHeadOfLocker, defaultStrHeadOfLocker } from '../../../rc';
import { FormResults, HexParser, defFormResults, hasError, onlyHex, onlyInt, onlyNum, refreshAfterTx, stampToUtc, strNumToBigInt, utcToStamp } from '../../../common/toolsKit';
import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';
import { ActionsOfUserProps } from '../ActionsOfUser';


export function LockPoints({refresh}:ActionsOfUserProps) {

  const { setErrMsg } = useComBooxContext();

  const [ amt, setAmt ] = useState('0');

  const [ head, setHead ] = useState<StrHeadOfLocker>(defaultStrHeadOfLocker);
  const [ hashLock, setHashLock ] = useState<HexType>(Bytes32Zero);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [loading, setLoading] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: lockPointsLoading,
    write: lockPoints,
  } = useRegCenterLockPoints({
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

  const lockPointsClick = ()=>{
    lockPoints({
      args:[
        BigInt(head.to),
        strNumToBigInt(amt, 9),
        BigInt(head.expireDate),
        hashLock
      ]
    });
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >

      <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >
        <Stack direction='column' >
          
          <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >

            <TextField 
              size="small"
              variant='outlined'
              label='To'
              error={ valid['To']?.error }
              helperText={ valid['To']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 218,
              }}
              value={ head.to }
              onChange={e => {
                let input = e.target.value;
                onlyInt('To', input, MaxUserNo, setValid);
                setHead(v =>({
                  ...v,
                  to: input,
                }));
              }}
            />

            <TextField 
              size="small"
              variant='outlined'
              label='Amount (CBP)'
              error={ valid['Amount(CBP)']?.error }
              helperText={ valid['Amount(CBP)']?.helpTx ?? ' ' }                            
              sx={{
                m:1,
                minWidth: 218,
              }}
              value={ amt }
              onChange={e => {
                let input = e.target.value ?? '0';
                onlyNum('Amount(CBP)', input, MaxLockValue, 9, setValid);
                setAmt(input);
              }}
            />

            <DateTimeField
              label='ExpireDate'
              helperText=' '
              sx={{
                m:1,
                minWidth: 218,
              }} 
              value={ stampToUtc(head.expireDate) }
              onChange={(date) => setHead((v) => ({
                ...v,
                expireDate: utcToStamp(date),
              }))}
              format='YYYY-MM-DD HH:mm:ss'
              size='small'
            />

          </Stack>

          <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >
            <TextField 
              size="small"
              variant='outlined'
              label='HashLock'
              error={ valid['HashLock']?.error }
              helperText={ valid['HashLock']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 685,
              }}
              value={ hashLock }
              onChange={e => {
                let input = HexParser(e.target.value);
                onlyHex('HashLock', input, 64, setValid);
                setHashLock(input);
              }}
            />
          </Stack>

        </Stack>

        <Divider orientation='vertical' sx={{m:1}} flexItem />

        <LoadingButton 
          disabled={ lockPointsLoading || hasError(valid)} 
          loading={loading}
          loadingPosition='end'
          onClick={ lockPointsClick }
          variant='contained'
          sx={{ m:1, minWidth:128 }} 
          endIcon={<LockClockOutlined />}       
        >
          Lock
        </LoadingButton>

      </Stack>

    </Paper>
  )
}
