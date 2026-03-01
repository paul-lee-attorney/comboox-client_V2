
import { Alert, Collapse, IconButton, Paper, Stack, TextField } from '@mui/material';

import { useRegCenterTransfer } from '../../../../../generated';

import { AddrOfRegCenter, AddrOfTank, HexType } from '../../common';
import { Close, OilBarrelOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { getReceipt } from '../../common/toolsKit';
import { FormResults, bigIntToStrNum, defFormResults, hasError, onlyNum, strNumToBigInt } from '../../common/toolsKit';
import { ActionOfFuelProps } from '../ActionsOfFuel';
import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';
import { Receipt } from '../../users/components/ActionsOfUser/TransferPoints';

export function FillTank({ refresh }: ActionOfFuelProps) {

  const { setErrMsg } = useComBooxContext();

  const [ amt, setAmt ] = useState('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ receipt, setReceipt ] = useState<Receipt>();
  const [ open, setOpen ] = useState(false);

  const [loading, setLoading] = useState(false);

  const {
    isLoading: fillTankLoading,
    write: fillTank
  } = useRegCenterTransfer ({
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

  const fillTankClick = ()=>{
    fillTank({
      args:[
        AddrOfTank,
        strNumToBigInt(amt, 9) * (10n ** 9n)
      ]
    });
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{alignItems:'start', justifyContent:'start'}} >

        <TextField 
          size="small"
          variant='outlined'
          label='Amount (CBP)' 
          error={ valid['Amt(CBP)']?.error }
          helperText={ valid['Amt(CBP)']?.helpTx ?? ' ' }                                  
          sx={{
            m:1,
            minWidth: 218,
          }}
          value={ amt }
          onChange={e => {
            let input = e.target.value;
            onlyNum('Amt(CBP)', input, 0n, 9, setValid);
            setAmt(input);
          }}
        />

        <LoadingButton 
          disabled={ fillTankLoading || hasError(valid) } 
          loading={loading}
          loadingPosition='end'
          onClick={ fillTankClick }
          variant='contained'
          sx={{ m:1, mx:2, minWidth:128 }} 
          endIcon={<OilBarrelOutlined />}       
        >
          Fill
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
            Add { bigIntToStrNum(BigInt(receipt?.amt ?? '0') / (10n**9n), 9) + ' CBP' } to Account ({ '0x' + receipt?.to.substring(26, 30) + '...' + receipt?.to.substring(62, 66)})
          </Alert>          
        </Collapse>

      </Stack>
    </Paper>
  )
}
