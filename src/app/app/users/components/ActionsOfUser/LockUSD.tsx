
import { Divider, Paper, Stack, TextField } from '@mui/material';

import { AddrOfCL, AddrZero, Bytes32Zero, HexType } from '../../../common';
import { LockClockOutlined, } from '@mui/icons-material';
import { useState } from 'react';
import { DateTimeField } from '@mui/x-date-pickers';

import { FormResults, HexParser, defFormResults, hasError, onlyHex, onlyNum, refreshAfterTx, stampToUtc, strNumToBigInt, utcToStamp } from '../../../common/toolsKit';
import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';
import { ActionsOfUserProps } from '../ActionsOfUser';
import { usePublicClient, useWalletClient } from 'wagmi';
import { verifyAuthorization } from '../../../components/usdc_auth/authVerifier';
import { AuthSig } from '../../../components/usdc_auth/typedData';
import { GenerateAuth } from '../../../components/usdc_auth/GenerateAuth';
import { useCashLockersLockUsd } from '../../../../../../generated';


export function LockUSD({refresh}:ActionsOfUserProps) {

  const { setErrMsg } = useComBooxContext();

  const [ auth, setAuth ] = useState<AuthSig | undefined>();

  const [ amt, setAmt ] = useState('0');

  const [ to, setTo ] = useState<HexType>(AddrZero);

  const [ expDate, setExpDate ] = useState(0);

  const [ hashLock, setHashLock ] = useState<HexType>(Bytes32Zero);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: lockUSDLoading,
    write: lockUSD,
  } = useCashLockersLockUsd({
    address: AddrOfCL,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  })

  const provider = usePublicClient();
  const {data: signer} = useWalletClient();

  const lockUsdClick = ()=>{
    if (auth && signer) {
      let acct = signer.account.address;
      verifyAuthorization(provider, acct, auth).then(
        verified => {
          if (verified) {
            lockUSD({
              args:[
                auth,
                to,
                BigInt(expDate),
                hashLock
              ]
            });
          }
        }
      );
    }
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >

      <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >
        <Stack direction='column' >
          
          <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >

            <TextField 
              size="small"
              variant='outlined'
              label='To (Addr)'
              error={ valid['To(Addr)']?.error }
              helperText={ valid['To(Addr)']?.helpTx ?? ' ' }                                  
              sx={{
                m:1,
                minWidth: 550,
              }}
              value={ to }
              onChange={e => {
                let input = HexParser(e.target.value ?? '0');
                onlyHex('To(Addr)', input, 40, setValid);
                setTo(input);
              }}
            />

            <TextField 
              size="small"
              variant='outlined'
              label='Amount (USD)'
              error={ valid['Amount(USD)']?.error }
              helperText={ valid['Amount(USD)']?.helpTx ?? ' ' }                            
              sx={{
                m:1,
                minWidth: 218,
              }}
              value={ amt }
              onChange={e => {
                let input = e.target.value ?? '0';
                onlyNum('Amount(USD)', input, 0n, 6, setValid);
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
              value={ stampToUtc(expDate) }
              onChange={(date) => setExpDate(utcToStamp(date))}
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

        <GenerateAuth value={strNumToBigInt(amt,6)} escrowAcct={AddrOfCL} setAuth={setAuth} />

        <LoadingButton 
          disabled={ !auth || lockUSDLoading || hasError(valid)} 
          loading={loading}
          loadingPosition='end'
          onClick={ lockUsdClick }
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
