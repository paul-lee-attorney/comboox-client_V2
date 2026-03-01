
import { 
  Alert, 
  Collapse, 
  IconButton, 
  Paper, 
  Stack, 
  TextField 
} from '@mui/material';

import { 
  FormResults, 
  bigIntToStrNum, 
  defFormResults, 
  getReceipt, 
  hasError, 
  onlyNum, 
  strNumToBigInt 
} from '../../common/toolsKit';

import { useUsdFuelTankRefuel } from '../../../../../generated';
import { AddrOfTank, AddrZero, booxMap, HexType } from '../../common';
import { Close, LocalGasStationOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';

import { ActionOfFuelProps } from '../ActionsOfFuel';
import { LoadingButton } from '@mui/lab';
import { Receipt } from '../../users/components/ActionsOfUser/TransferPoints';
import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';
import { AuthSig } from '../../components/usdc_auth/typedData';
import { usePublicClient, useWalletClient } from 'wagmi';
import { verifyAuthorization } from '../../components/usdc_auth/authVerifier';
import { GenerateAuth } from '../../components/usdc_auth/GenerateAuth';
import { rate } from '../ft';

export function RefuelUsd({ refresh }: ActionOfFuelProps) {

  const { boox, setErrMsg } = useComBooxContext();

  const [ amt, setAmt ] = useState('0');
  const [ value, setValue ] = useState<bigint | undefined>();

  const [ receipt, setReceipt ] = useState<Receipt>();
  const [ open, setOpen ] = useState(false);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [loading, setLoading] = useState(false);

  const [ auth, setAuth ] = useState<AuthSig | undefined>();
  const [ escrow, setEscrow ] = useState(AddrZero);

  useEffect(()=>{
    if (boox) {
      setEscrow(boox[booxMap.Cashier]);
    }
  }, [boox]);

  useEffect(()=>{
    if (AddrOfTank) {
      rate().then(
        p => {
          setValue(p * strNumToBigInt(amt, 9) / 10n ** 9n);
        }
      )  
    }
  }, [amt]);

  const {
    isLoading: refuelLoading,
    write: refuel
  } = useUsdFuelTankRefuel({
    address: AddrOfTank,
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
            let rpt:Receipt = {
              from: r.logs[0].topics[1],
              to: r.logs[0].topics[2],
              amt: BigInt(r.logs[0].topics[3]).toString(),
              };
            setReceipt(rpt);
            setOpen(true);
            setLoading(false);
            refresh();
          }
        }
      )
    }
  })

  const provider = usePublicClient();
  const {data: signer} = useWalletClient();

  const refuelClick = ()=>{

    if (auth && signer) {
      let acct = signer.account.address;
      verifyAuthorization(provider, acct, auth).then(
        verified => {
          if (verified) {
            refuel({
              args: [ 
                auth,
                strNumToBigInt(amt, 9) * (10n ** 9n),
              ]
            });
          } else {
            console.log("authorization NOT verified");
          }
        }
      )
    }
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{alignItems:'start', justifyContent:'start'}} >

        <TextField 
          size="small"
          variant='outlined'
          label='Amt (CBP)' 
          error={ valid['Amt(CBP)']?.error }
          helperText={ valid['Amt(CBP)']?.helpTx ?? ' ' }                                  
          sx={{
            m:1,
            minWidth: 218,
          }}
          value={ amt }
          onChange={e => {
            let input = e.target.value ?? '0' ;
            onlyNum('Amt(CBP)', input, 0n, 9, setValid);
            setAmt(input);
          }}
        />

        <TextField 
          variant='outlined'
          label='Payment (USD)'
          error={ valid['Value(USD)']?.error }
          helperText={ valid['Value(USD)']?.helpTx ?? ' ' }           
          sx={{
            m:1,
            mx:2,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('Value(USD)', input, 0n, 6, setValid);
            setValue( strNumToBigInt(input,6));
          }}
          value={ bigIntToStrNum((value ?? 0n), 6) }
          size="small"
        />

        <GenerateAuth value={value} escrowAcct={escrow} setAuth={setAuth} />

        <LoadingButton 
          disabled={ refuelLoading || hasError(valid) || !auth } 
          loading={loading}
          loadingPosition='end'
          onClick={ refuelClick }
          variant='contained'
          sx={{ m:1, mx:2, minWidth:128 }} 
          endIcon={<LocalGasStationOutlined />}       
        >
          Refuel CBP
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

            variant='outlined' 
            severity='info'
            sx={{ height: 45, p:0.5 }}
          >
            Add { bigIntToStrNum(BigInt(receipt?.amt ?? '0') / (10n**9n), 9) + ' CBP' } to Account ({ '0x' + receipt?.from.substring(26, 30) + '...' + receipt?.to.substring(62, 66)})
          </Alert>
        </Collapse>

      </Stack>
    </Paper>
  )
}
