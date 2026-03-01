
import { useState } from "react";

import { Paper, Stack, TextField } from "@mui/material";

import { EditNoteOutlined } from "@mui/icons-material";
import { useFundKeeperUpdateNavPrice } from "../../../../../../../generated";

import { FormResults, defFormResults, hasError, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../common/toolsKit";

import { HexType, MaxPrice, } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { ActionsOfRequestProps } from "../ActionsOfRequest";

export function UpdateNavPrice({ classOfShare, refresh }: ActionsOfRequestProps) {
  const { gk, setErrMsg } = useComBooxContext();

  const [ price, setPrice ] = useState('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: updatePriceLoading,
    write:updatePrice,
  } = useFundKeeperUpdateNavPrice({
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

    updatePrice({
      args: [
        BigInt(classOfShare),
        strNumToBigInt(price, 4),       
      ]
    });

  };

  return (

    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >

      <Stack direction={'row'} sx={{ alignItems:'start'}} >

        <TextField 
          variant='outlined'
          size="small"
          label='NavPrice'
          error={ valid['NavPrice']?.error }
          helperText={ valid['NavPrice']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyNum('NavPrice', input, MaxPrice, 4, setValid);            
            setPrice(input);
          }}
          value={ price } 
        />

        <LoadingButton 
          disabled = { updatePriceLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m:1, mx:2, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<EditNoteOutlined />}
          onClick={ handleClick }
          size='small'
        >
          Update
        </LoadingButton>

      </Stack>
      
    </Paper>

  );  

}