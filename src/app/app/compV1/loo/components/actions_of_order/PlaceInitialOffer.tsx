import { Paper, Stack, TextField } from "@mui/material";

import { Loyalty } from "@mui/icons-material";
import { useState } from "react";
import { useUsdKeeperPlaceInitialOffer } from "../../../../../../../generated-v1";
import { ActionsOfOrderProps } from "../ActionsOfOrder";

import { HexType, keepersMap, MaxData, MaxPrice, MaxSeqNo } from "../../../../common";
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { defaultOffer, InitOffer } from "../../../loe/loe";


export function PlaceInitialOffer({ classOfShare, refresh }: ActionsOfOrderProps) {
  const { keepers, setErrMsg } = useComBooxContext();

  const [ offer, setOffer ] = useState<InitOffer>(defaultOffer);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: placeInitOfferLoading,
    write:placeInitOffer,
  } = useUsdKeeperPlaceInitialOffer({
    address: keepers && keepers[keepersMap.UsdKeeper],
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
    placeInitOffer({
      args: [
        BigInt(classOfShare),
        BigInt(offer.execHours),
        strNumToBigInt(offer.paid, 4),
        strNumToBigInt(offer.price, 4), 
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
          label='ExecHours'
          error={ valid['ExecHours']?.error }
          helperText={ valid['ExecHours']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyInt('ExecHours', input, MaxSeqNo, setValid);
            setOffer( v => ({
              ...v,
              execHours: input,
            }));
          }}
          value={ offer.execHours } 
        />

        <TextField 
          variant='outlined'
          size="small"
          label='SeqOfListingRule'
          error={ valid['SetOfLR']?.error }
          helperText={ valid['SetOfLR']?.helpTx ?? ' ' }
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
          value={ offer.seqOfLR } 
        />

        <TextField 
          variant='outlined'
          size="small"
          label='Paid'
          error={ valid['Paid']?.error }
          helperText={ valid['Paid']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyNum('Paid', input, MaxData, 4, setValid);
            setOffer( v => ({
              ...v,
              paid: input,
            }));
          }}
          value={ offer.paid } 
        />

        <TextField 
          variant='outlined'
          size="small"
          label='Price'
          error={ valid['Price']?.error }
          helperText={ valid['Price']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyNum('Price', input, MaxPrice, 4, setValid);
            setOffer( v => ({
              ...v,
              price: input,
            }));
        }}

          value={ offer.price } 
        />

        <LoadingButton 
          disabled = { placeInitOfferLoading || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<Loyalty />}
          onClick={ handleClick }
          size='small'
        >
          Offer
        </LoadingButton>

      </Stack>

    </Paper>

  );  

}