import { useState } from "react";
import { useGeneralKeeperRefundDebt } from "../../../../../../../generated-v1";
import { Button, Paper, Stack, TextField } from "@mui/material";
import { VolunteerActivismOutlined } from "@mui/icons-material";
import { ActionsOfPledgeProps } from "../ActionsOfPledge";
import { HexType, MaxData } from "../../../../common";
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function RefundDebt({pld, setOpen, refresh}:ActionsOfPledgeProps) {

  const { gk, setErrMsg } = useComBooxContext();
  
  const [ amt, setAmt ] = useState<string>('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: refundDebtLoading,
    write: refundDebt,
  } = useGeneralKeeperRefundDebt({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }    
  });
  
  const handleClick = ()=>{
    refundDebt({
      args: [ 
        BigInt(pld.head.seqOfShare), 
        BigInt(pld.head.seqOfPld), 
        strNumToBigInt(amt, 4),
      ],
    });
  };

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          label='Amount'
          size="small"
          error={ valid['Amount']?.error }
          helperText={ valid['Amount']?.helpTx ?? ' ' }
  
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('Amount', input, MaxData, 4, setValid);
            setAmt(input);
          }}
          value={ amt?.toString() }
        />

        <LoadingButton 
          disabled={ refundDebtLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 168, height: 40 }} 
          variant="contained" 
          endIcon={ <VolunteerActivismOutlined /> }
          onClick={ handleClick }
          size='small'
        >
          Refund Debt
        </LoadingButton>        

      </Stack>
    </Paper>
  );

}


