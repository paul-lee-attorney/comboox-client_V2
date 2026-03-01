import { useState } from "react";

import { HexType, MaxData, } from "../../../../common";

import { Paper, Stack, TextField } from "@mui/material";
import { Payment, } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

import { 
  FormResults, 
  defFormResults, 
  hasError, 
  onlyNum, 
  refreshAfterTx,
  strNumToBigInt,
} from "../../../../common/toolsKit";
import { ActionsOfCapProps } from "../ActionsOfCap";
import { GetValueOf } from "../../../../common/GetValueOf";

import { useGeneralKeeperPayInCapital } from "../../../../../../../generated-v1";

export function PayInEth({ share, setDialogOpen, refresh }: ActionsOfCapProps ) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ amt, setAmt ] = useState('0.0');
  const [ value, setValue ] = useState('0.0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setDialogOpen(false);
  }

  const {
    isLoading: payInCapLoading,
    write: payInCap,
  } = useGeneralKeeperPayInCapital({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data){
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  const payInCapClick = ()=>{
    payInCap({
      args: [ 
        BigInt(share.head.seqOfShare), 
        strNumToBigInt(amt, 4) 
      ],
      value: strNumToBigInt(value, 9) * (10n ** 9n),
    });
  };

  return (
    <Paper elevation={3} sx={{
      p:1, m:1,
      border: 1, 
      borderColor:'divider' 
      }} 
    >

      <Stack direction={'row'} sx={{ alignItems:'start' }}>

        <TextField 
          variant='outlined'
          label='Amount (Fiat)'
          error={ valid['Amt']?.error }
          helperText={ valid['Amt']?.helpTx ?? ' ' }    
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('Amt', input, MaxData, 4, setValid);
            setAmt(input);
          }}
          value={ amt }
          size="small"
        />

        <TextField 
          variant='outlined'
          label='Value (ETH)'
          error={ valid['Value']?.error }
          helperText={ valid['Value']?.helpTx ?? ' ' }    
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('Value', input, MaxData, 9, setValid);
            setValue(input);
          }}
          value={ value }
          size="small"
        />


        <LoadingButton
          variant='contained'
          disabled={ payInCapLoading || hasError(valid)}
          loading={ loading }
          loadingPosition="end"
          sx={{minWidth: 128, m: 1, }} 
          onClick={ payInCapClick }
          color="primary"
          endIcon={< Payment />}
        >
          Pay
        </LoadingButton>

        <GetValueOf amt={amt} />

      </Stack>

    </Paper>
  )

}





