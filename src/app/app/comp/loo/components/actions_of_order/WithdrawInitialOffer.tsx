import { Paper, Stack, TextField } from "@mui/material";


import { RedoOutlined } from "@mui/icons-material";
import { useState } from "react";
import { useCompKeeperWithdrawInitialOffer } from "../../../../../../../generated";
import { ActionsOfOrderProps } from "../ActionsOfOrder";

import { HexType, MaxPrice, MaxSeqNo } from "../../../../common";
import { FormResults, defFormResults, hasError, onlyInt, refreshAfterTx } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { defaultOffer, InitOffer } from "../../../../compV1/loe/loe";

export function WithdrawInitialOffer({ classOfShare, refresh }: ActionsOfOrderProps) {
  const { gk, setErrMsg} = useComBooxContext();

  const [ offer, setOffer ] = useState<InitOffer>(defaultOffer);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    refresh();
    setLoading(false);
  }

  const {
    isLoading: withdrawInitOfferLoading,
    write:withdrawInitOffer,
  } = useCompKeeperWithdrawInitialOffer({
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
    withdrawInitOffer({
      args: [ 
          BigInt(classOfShare),
          BigInt(offer.seqOfOrder),
          BigInt(offer.seqOfLR), 
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

        <TextField 
          variant='outlined'
          size="small"
          label='SeqOfListingRule'
          error={ valid['SeqOfLR']?.error }
          helperText={ valid['SeqOfLR']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyInt('SeqOfLR', input, MaxSeqNo, setValid);
            setOffer( v => ({
              ...v,
              seqOfLR: input,
            }));
          }}

          value={ offer.seqOfLR.toString() } 
        />

        <LoadingButton 
          disabled = { withdrawInitOfferLoading || hasError(valid)}
          loading = { loading }
          loadingPosition="end"
          sx={{ m: 1, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={< RedoOutlined />}
          onClick={ handleClick }
          size='small'
        >
          Withdraw
        </LoadingButton>

      </Stack>

    </Paper>

  );  

}