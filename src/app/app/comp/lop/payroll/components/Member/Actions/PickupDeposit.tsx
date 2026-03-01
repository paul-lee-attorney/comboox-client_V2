import { useState } from "react";
import { useListOfProjectsPickupDeposit } from "../../../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { BorderColor } from "@mui/icons-material";
import { HexType, MaxData, MaxLockValue } from "../../../../../../common";
import { FormResults, defFormResults, hasError, onlyNum, 
  refreshAfterTx, removeKiloSymbol, strNumToBigInt } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfOwnerProps } from "../../Owner/ActionsOfOwner";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

export function PickupDeposit({ addr, refresh }: ActionsOfOwnerProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }

  const {
    isLoading: pickupDepositLoading,
    write: pickupDeposit,
  } = useListOfProjectsPickupDeposit({
    address: addr,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash:HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  const [ amt, setAmt ] = useState<string>('0');

  const handleClick = () => {
    pickupDeposit({
      args: [ strNumToBigInt(amt, 18) ]
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
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = removeKiloSymbol(e.target.value);
            onlyNum('Amount', input, 0n,18, setValid);
            setAmt(input);
          }}
          value={ amt }
          size='small'
        />

        <LoadingButton 
          disabled = { pickupDepositLoading || hasError(valid) }
          loading = { loading }
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<BorderColor />}
          onClick={ handleClick }
          size='small'
        >
          Pick Up
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


