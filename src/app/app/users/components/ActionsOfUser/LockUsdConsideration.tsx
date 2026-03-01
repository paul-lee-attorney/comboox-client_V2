
import { Divider, FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, Stack, TextField } from '@mui/material';

import { AddrOfCL, AddrZero, Bytes32Zero, HexType, MaxSeqNo } from '../../../common';
import { LockClockOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { FormResults, HexParser, defFormResults, hasError, onlyHex, onlyInt, onlyNum, refreshAfterTx, stampToUtc, strNumToBigInt, utcToStamp } from '../../../common/toolsKit';
import { DateTimeField } from '@mui/x-date-pickers';

import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';
import { ActionsOfUserProps } from '../ActionsOfUser';
import { usePublicClient, useWalletClient } from 'wagmi';
import { AuthSig } from '../../../components/usdc_auth/typedData';
import { verifyAuthorization } from '../../../components/usdc_auth/authVerifier';

import { GenerateAuth } from '../../../components/usdc_auth/GenerateAuth';
import { calDefaultParas, constructPayload, funcNames, selectors } from '../../../common/payloadTools';
import { defaultHead, Head } from '../../../cl';
import { useCashLockersLockConsideration } from '../../../../../../generated';


export function LockUsdConsideration({refresh}:ActionsOfUserProps) {

  const { setErrMsg } = useComBooxContext();

  const [ auth, setAuth ] = useState<AuthSig | undefined>();
  const [ amt, setAmt ] = useState('0');

  const [ head, setHead ] = useState<Head>(defaultHead);
  const [ hashLock, setHashLock ] = useState<HexType>(Bytes32Zero);

  const [ counterLocker, setCounterLocker ] = useState<HexType>(AddrZero);

  const [ func, setFunc ] = useState<string>(funcNames[0]);
  const [ paras, setParas ] = useState<string[]>(calDefaultParas(hashLock, selectors[func].offSet));

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [loading, setLoading] = useState(false);

  const updateResults = ()=> {
    console.log('payloads: ', constructPayload(func, paras));
    refresh();
    setLoading(false);
  }

  const {
    isLoading: lockConsiderationLoading,
    write: lockConsideration,
  } = useCashLockersLockConsideration({
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

  const lockUsdConsiderationClick = ()=>{
    if (auth && signer) {
      let acct = signer.account.address;
      verifyAuthorization(provider, acct, auth).then(
        verified => {
          lockConsideration({
            args:[ 
              auth,
              head.to,
              BigInt(head.expireDate),
              counterLocker,
              constructPayload(func, paras),
              hashLock
            ]
          });
        }
      )
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
              label='To'
              error={ valid['To']?.error }
              helperText={ valid['To']?.helpTx ?? ' ' }              
              sx={{
                m:1,
                minWidth: 218,
              }}
              value={ head.to }
              onChange={e => {
                let input = HexParser(e.target.value);
                onlyHex('To', input, 40, setValid);
                setHead(v =>({
                  ...v,
                  to: input,
                }));
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

          <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >

            <TextField 
              size="small"
              variant='outlined'
              label='CounterLockerAddress'
              error={ valid['CounterLockerAddress']?.error }
              helperText={ valid['CounterLockerAddress']?.helpTx ?? ' ' }              
              sx={{
                m:1,
                minWidth: 450,
              }}
              value={ counterLocker }
              onChange={e => {
                let input = HexParser(e.target.value);
                onlyHex('CounterOfAddress', input, 40, setValid);
                setCounterLocker(input);
              }}
            />

            <FormControl variant="outlined" sx={{ m: 1, minWidth: 218 }}>
              <InputLabel id="FuncSig-label">FunctionSignature</InputLabel>
              <Select
                size='small'
                labelId="FuncSig-label"
                id="fincSig-select"
                label="FunctionSignature"
                value={ func }
                onChange={(e) => setFunc(e.target.value)}
              >
                {funcNames.map(v=>(
                  <MenuItem key={v} value={v} >{v}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{' '}</FormHelperText>
            </FormControl>

          </Stack>
          
          <Divider flexItem sx={{m:1}} />
          
          {func == 'requestPaidInCapital' && (
            <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >
              <TextField 
                size="small"
                variant='outlined'
                label='HashLock'
                inputProps={{readOnly: true}}
                sx={{
                  m:1,
                  minWidth: 685,
                }}
                value={ HexParser(hashLock) }
              />
            </Stack>            
          )}

          {func == 'closeDeal' && (
            <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >
                          
              <TextField 
                size="small"
                variant='outlined'
                label='InvestmentAgreement'
                error={ valid['InvestmentAgreement']?.error }
                helperText={ valid['InvestmentAgreement']?.helpTx ?? ' ' }
                sx={{
                  m:1,
                  minWidth: 450,
                }}
                value={ HexParser(paras[0].substring(24,64)) }
                onChange={e => {
                  let input = HexParser(e.target.value);
                  onlyHex('InvestmentAgreement', input, 40, setValid);                  
                  setParas(v => {
                    let out = [...v];
                    out[0] = input.substring(2).padStart(64, '0');
                    return out;
                  });
                }}
              />

              <TextField 
                size="small"
                variant='outlined'
                label='SeqOfDeal'
                error={ valid['SeqOfDeal']?.error }
                helperText={ valid['SeqOfDeal']?.helpTx ?? ' ' }                
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                value={ parseInt(paras[1]?.substring(60,64) ?? '0x00',16).toString()  }
                onChange={e => {
                  let input = e.target.value ?? '0';
                  onlyInt('SeqOfDeal', input, MaxSeqNo, setValid);
                  setParas(v => {
                    let out = [...v];
                    let seq = parseInt(input).toString(16).padStart(64, '0');
                    out[1] = seq;
                    return out;
                  })
                }}
              />

            </Stack>
          )}

          {(func == 'releaseSwapOrder' || func == 'releasePledge' || func == 'releaseSwap') && (
            <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >
                          
              <TextField 
                size="small"
                variant='outlined'
                label={
                  func == 'releaseSwapOrder' 
                    ? 'SeqOfOpt' 
                    : func == 'releasePledge' 
                      ? 'SeqOfShare'
                      : 'SeqOfSwap'
                }

                error={ valid['SeqInfo']?.error }
                helperText={ valid['SeqInfo']?.helpTx ?? ' ' }                

                sx={{
                  m:1,
                  minWidth: 218,
                }}
                value={ parseInt(paras[0]?.substring(0x38,0x40) ?? '0x00',0x10).toString() }
                onChange={e => {
                  let input = e.target.value ?? '0';
                  onlyInt('SeqInfo', input, MaxSeqNo, setValid);
                  setParas(v => {
                    let out = [...v];
                    let seq = parseInt(input).toString(16).padStart(0x40, '0');
                    out[0] = seq;
                    return out;
                  })
                }}
              />

              {(func == 'releaseSwapOrder' || func == 'releasePledge') && (
                <TextField 
                  size="small"
                  variant='outlined'
                  label={func == 'releaseSwapOrder' ? 'SeqOfBrief' : 'SeqOfPledge'}

                  error={ valid['SeqConsider']?.error }
                  helperText={ valid['SeqConsider']?.helpTx ?? ' ' }

                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ parseInt(paras[1]?.substring(0x3c,0x40) ?? '0x00',0x10).toString()  }
                  onChange={e => {
                    let input = e.target.value ?? '0';
                    onlyInt('SeqConsider', input, MaxSeqNo, setValid);
                    setParas(v => {
                      let out = [...v];
                      let seq = parseInt(input).toString(16).padStart(0x40, '0');
                      out[1] = seq;
                      return out;
                    });
                  }}
                />
              )}

            </Stack>
          )}
          
        </Stack>

        <Divider orientation='vertical' sx={{ m:1 }} flexItem />

        <GenerateAuth value={strNumToBigInt(amt,6)} escrowAcct={AddrOfCL} setAuth={setAuth} />

        <LoadingButton 
          disabled={ !auth || lockConsiderationLoading || hasError(valid)} 
          loading={loading}
          loadingPosition='end'
          onClick={ lockUsdConsiderationClick }
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
