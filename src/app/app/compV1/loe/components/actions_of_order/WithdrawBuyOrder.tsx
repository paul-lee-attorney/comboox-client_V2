import { Paper, Stack, TextField } from "@mui/material";

import { RedoOutlined } from "@mui/icons-material";
import { useState } from "react";
import { useGeneralKeeperWithdrawBuyOrder } from "../../../../../../../generated-v1";
import { ActionsOfOrderProps } from "../ActionsOfOrder";
import { InitOffer, defaultOffer } from "../../loe";
import { HexType, MaxPrice } from "../../../../common";
import { FormResults, defFormResults, hasError, onlyInt, refreshAfterTx } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";


export function WithdrawBuyOrder({ classOfShare, refresh }: ActionsOfOrderProps) {
  const { gk, setErrMsg } = useComBooxContext();

  const [ offer, setOffer ] = useState<InitOffer>(defaultOffer);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    refresh();
    setLoading(false);
  }

  const {
    isLoading: withdrawBuyOrderLoading,
    write:withdrawBuyOrder,
  } = useGeneralKeeperWithdrawBuyOrder({
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
      
  const handleClick = ()=> {
    withdrawBuyOrder({
      args: [ 
        BigInt(classOfShare),
        BigInt(offer.seqOfOrder)
      ],
    });
  };

  return (

    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >
      
      <Stack direction="row" sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          size="small"
          label='SeqOfOrder'
          error={ valid['SeqOfOrder']?.error }
          helperText={ valid['SeqOfOrder']?.helpTx ?? ' ' }

          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyInt('SeqOfOrder', input, MaxPrice, setValid);
            setOffer( v => ({
              ...v,
              seqOfOrder: input,
            }));
          }}

          value={ offer.seqOfOrder.toString() } 
        />

        <LoadingButton 
          disabled = { withdrawBuyOrderLoading || hasError(valid)}
          loading = {loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<RedoOutlined />}
          onClick={ handleClick }
          size='small'
        >
          Withdraw
        </LoadingButton>

      </Stack>

    </Paper>

  );  

}