import { useGeneralKeeperPayOffSwap } from "../../../../../../../generated-v1";
import { Paper, Stack, TextField } from "@mui/material";
import { Payment } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { HexType, booxMap } from "../../../../common";
import { FormResults, defFormResults, hasError, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { checkValueOfSwap } from "../../roo";
import { ShowValueOf } from "../../../../common/ShowValueOf";
import { ActionsOfSwapProps } from "../ActionsOfSwap";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function PayOffSwap({seqOfOpt, seqOfSwap, setOpen, refresh}:ActionsOfSwapProps) {

  const { gk, boox, setErrMsg } = useComBooxContext();

  const [ value, setValue ] = useState<string>('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const [ valueOfSwap, setValueOfSwap ] = useState(0n);

  useEffect(()=>{
    if (boox) {
      checkValueOfSwap(boox[booxMap.ROO], seqOfOpt, seqOfSwap).then(
        res => setValueOfSwap(res)
      );
    }
  }, [boox, seqOfOpt, seqOfSwap]);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: payOffSwapLoading,
    write: payOffSwap,
  } = useGeneralKeeperPayOffSwap({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  })

  const handleClick = ()=>{
    payOffSwap({
      args: [ 
          BigInt(seqOfOpt), 
          BigInt(seqOfSwap)
      ],
    value: strNumToBigInt(value, 9) * (10n**9n),
    })
  }

  return(
    <Paper elevation={3} sx={{alignItems:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

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
          disabled={ seqOfSwap == 0 || payOffSwapLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 88, height: 40 }} 
          variant="contained" 
          endIcon={ <Payment /> }
          onClick={ handleClick }
          size='small'
        >
          Pay
        </LoadingButton>

        <ShowValueOf value={valueOfSwap} />
      </Stack>
    </Paper>
    
  );

}

