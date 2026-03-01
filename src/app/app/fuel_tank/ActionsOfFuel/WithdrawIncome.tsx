
import { Paper, Stack, TextField } from '@mui/material';

import { useFuelTankWithdrawIncome } from '../../../../../generated';

import { AddrOfTank, HexType } from '../../common';
import { SavingsOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { FormResults, defFormResults, hasError, onlyNum, refreshAfterTx, strNumToBigInt } from '../../common/toolsKit';
import { LoadingButton } from '@mui/lab';
import { ActionOfFuelProps } from '../ActionsOfFuel';
import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';

export function WithdrawIncome({ refresh }: ActionOfFuelProps) {

  const { setErrMsg } = useComBooxContext();

  const [ amt, setAmt ] = useState('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [loading, setLoading] = useState(false);

  const updateResults = ()=> {
    refresh();
    setLoading(false);
  }

  const {
    isLoading: withdrawIncomeLoading,
    write: withdrawIncome
  } = useFuelTankWithdrawIncome({
    address: AddrOfTank,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  })

  const withdrawIncomeClick = ()=>{
    withdrawIncome({
      args:[
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
          label='Amount (ETH)' 
          error={ valid['Amt(ETH)']?.error }
          helperText={ valid['Amt(ETH)']?.helpTx ?? ' ' }                                  
          sx={{
            m:1,
            minWidth: 218,
          }}
          value={ amt }
          onChange={e => {
            let input = e.target.value;
            onlyNum('Amt(ETH)', input, 0n, 9, setValid);
            setAmt(input);
          }}
        />

        <LoadingButton 
          disabled={ withdrawIncomeLoading || hasError(valid) } 
          loading={loading}
          loadingPosition='end'
          onClick={ withdrawIncomeClick }
          variant='contained'
          sx={{ m:1, mx:2, minWidth:128 }} 
          endIcon={<SavingsOutlined />}       
        >
          Withdraw
        </LoadingButton>

      </Stack>
    </Paper>
  )
}
