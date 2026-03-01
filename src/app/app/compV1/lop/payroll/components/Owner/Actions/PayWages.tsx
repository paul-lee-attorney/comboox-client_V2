import { useState } from "react";
import { Paper, Stack, TextField } from "@mui/material";
import { Payment } from "@mui/icons-material";

import { FormResults, defFormResults, hasError, onlyNum, 
  refreshAfterTx, removeKiloSymbol, strNumToBigInt 
} from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfOwnerProps } from "../ActionsOfOwner";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";
import { useListOfProjectsPayWages } from "../../../../../../../../../generated-v1";
import { HexType } from "../../../../../../common";

export function PayWages({ addr, refresh }: ActionsOfOwnerProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [loading, setLoading] = useState(false);

  const updateInfo = ()=>{
    refresh();
    setLoading(false);
  }

  const [ amt, setAmt] = useState<string>('0');

  const {
    isLoading: payWagesLoading,
    write: payWages,
  } = useListOfProjectsPayWages({
    address: addr,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash:HexType = data.hash;
      refreshAfterTx(hash, updateInfo);
    }
  });

  const handleClick = () => {
    payWages({
      value: strNumToBigInt(amt, 18)
    });
  }

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          label='Amount (ETH)'
          error={ valid['Amount']?.error }
          helperText={ valid['Amount']?.helpTx ?? ' ' }  
          sx={{
            m:1,
            minWidth: 456,
          }}
          onChange={(e) => {
            let input = removeKiloSymbol(e.target.value);
            onlyNum('Amount', input, 0n, 18, setValid);
            setAmt(input);
          }}
          value={ amt }
          size='small'
        />

        <LoadingButton 
          disabled = { payWagesLoading || hasError(valid) }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<Payment />}
          onClick={ handleClick }
          size='small'
        >
          Pay Wages
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


