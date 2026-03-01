
import { Alert, Collapse, IconButton, Paper, Stack, TextField } from '@mui/material';

import { 
  useRegCenterMint, 
} from '../../../../../../generated';

import { AddrOfRegCenter, AddrZero, HexType, MaxUserNo } from '../../../common';
import { Close, Flare } from '@mui/icons-material';
import { useState } from 'react';

import { FormResults, HexParser, defFormResults, hasError, longDataParser, onlyHex, onlyInt, onlyNum, strNumToBigInt } from '../../../common/toolsKit';
import { waitForTransaction } from '@wagmi/core';
import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';
import { ActionsOfUserProps } from '../ActionsOfUser';

interface Receipt{
  to: string;
  amt: string;
}

export function MintPoints({getUser, getBalanceOf}:ActionsOfUserProps) {

  const { setErrMsg } = useComBooxContext();

  const [ to, setTo ] = useState<HexType>(AddrZero);
  const [ amt, setAmt ] = useState<string>('0');
  const [ receipt, setReceipt ] = useState<Receipt>();
  const [ open, setOpen ] = useState(false);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const {
    isLoading: mintPointsLoading,
    write: mintPoints
  } = useRegCenterMint({
    address: AddrOfRegCenter,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      setOpen(false);
      let hash: HexType = data.hash;
      waitForTransaction({hash}).then(
        res => {
          if (res && res.logs[0].topics[3] && res.logs[0].topics[2]) {
            let rpt:Receipt = {
              to: res.logs[0].topics[2],
              amt: BigInt(res.logs[0].topics[3]).toString(),
            }
            setReceipt(rpt);
            setOpen(true);
            getUser();
            getBalanceOf();
            setLoading(false);
          }
          console.log("Receipt: ", res);          
        }
      )
    }
  })

  const mintPointsClick = ()=>{
    mintPoints({
      args: [ 
        to, 
        strNumToBigInt(amt, 9) * (10n ** 9n)
      ]
    });
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{alignItems:'start', justifyContent:'start'}} >
        <TextField 
          size="small"
          variant="outlined"
          label='To'
          error={ valid['To']?.error }
          helperText={ valid['To']?.helpTx ?? ' ' }          
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
          variant="outlined"
          label='Amount (CBP)'
          error={ valid['Amount(CBP)']?.error }
          helperText={ valid['Amount(CBP)']?.helpTx ?? ' ' }          
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ amt }
          onChange={e => {
            let input = e.target.value ?? '0';
            onlyNum('Amount(CBP)', input, 0n, 9, setValid);
            setAmt(input);
          }}
        />

        <LoadingButton 
          size='small'
          disabled={ mintPointsLoading || hasError(valid)} 
          loading={loading}
          loadingPosition='end'
          onClick={ mintPointsClick }
          variant='contained'
          sx={{ m:1, mx:2, minWidth:128, height:40 }} 
          endIcon={<Flare />}       
        >
          Mint
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
            { longDataParser((Number(BigInt(receipt?.amt ?? '0') / (10n ** 12n)) / (10 ** 6)).toString() ) + ' CBP minted to Address: '}               
            ({ '0x' + receipt?.to.substring(26, 30) + '...' + receipt?.to.substring(62, 66) })
          </Alert>          
        </Collapse>

      </Stack>
    </Paper>
  )
}
