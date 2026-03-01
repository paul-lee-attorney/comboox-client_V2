
import { Paper, Stack, TextField } from "@mui/material";
import { Payment } from "@mui/icons-material";
import { useGeneralKeeperPayOffRejectedDeal } from "../../../../../../../../../generated-v1";
import { ActionsOfSwapProps } from "../ActionsOfSwap";
import { HexType } from "../../../../../../common";
import { FormResults, defFormResults, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useEffect, useState } from "react";
import { checkValueOfSwap } from "../../../ia";

import { ShowValueOf } from "../../../../../../common/ShowValueOf";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

export function PayOffSwap({ia, seqOfDeal, seqOfSwap, setOpen, refresh}: ActionsOfSwapProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ value, setValue ] = useState<string>('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const [ valueOfSwap, setValueOfSwap ] = useState<bigint>(0n);

  useEffect(()=>{
    if (seqOfSwap > 0) {
      checkValueOfSwap(ia, seqOfDeal, seqOfSwap).then(
        res => setValueOfSwap(res)
      );
    }
  }, [ia, seqOfDeal, seqOfSwap]);

  const update = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: payOffSwapLoading,
    write: payOffSwap,
  } = useGeneralKeeperPayOffRejectedDeal({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, update);
    }
  });

  const handleClick = ()=>{
    payOffSwap({
      args: [
        ia,
        BigInt(seqOfDeal),
        BigInt(seqOfSwap)
      ],
      value: strNumToBigInt(value, 9) * (10n ** 9n),
    })
  }

  return (
    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >

      <Stack direction='row' sx={{ alignItems:'start' }} >

      <TextField
          variant='outlined'
          label='SeqOfSwap'
          sx={{
            m:1,
            minWidth: 218,
          }}
          inputProps={{readOnly: true}}
          value={ seqOfSwap }
          size='small'
        />

        <TextField 
          variant='outlined'
          label='Amount (Eth)'
          error={ valid['AmtOfEth']?.error }
          helperText={ valid['AmtOfEth']?.helpTx ?? ' ' }  
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('AmtOfEth', input, 0n, 9, setValid);
            setValue(input);
          }}
          value={ value }
          size='small'
        />

        <LoadingButton
          variant="contained"
          disabled={ seqOfSwap == 0 || payOffSwapLoading || !seqOfSwap }
          loading = {loading}
          loadingPosition="end"
          endIcon={<Payment />}
          sx={{ m:1, height: 40, minWidth:128 }}
          onClick={ handleClick }
        >
          Pay
        </LoadingButton>

        <ShowValueOf value={valueOfSwap} />

      </Stack>

    </Paper>
  );
}