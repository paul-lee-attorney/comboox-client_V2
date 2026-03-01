
import { useState } from "react";

import { Paper, Stack, TextField } from "@mui/material";

import { EmojiPeopleOutlined } from "@mui/icons-material";
import { useFundKeeperRequestForRedemption } from "../../../../../../../generated";

import { FormResults, defFormResults, hasError, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../common/toolsKit";

import { HexType, MaxData, MaxPrice, } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { ActionsOfRequestProps } from "../ActionsOfRequest";

export function RequestForRedemption({ classOfShare, refresh }: ActionsOfRequestProps) {
  const { gk, setErrMsg } = useComBooxContext();

  const [ paid, setPaid ] = useState('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: requestForRedemptionLoading,
    write:requestForRedemption,
  } = useFundKeeperRequestForRedemption({
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

    requestForRedemption({
      args: [
        BigInt(classOfShare),
        strNumToBigInt(paid, 4),
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
            setPaid(input);
          }}
          value={ paid } 
        />

        <LoadingButton 
          disabled = { requestForRedemptionLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m:1, mx:2, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<EmojiPeopleOutlined />}
          onClick={ handleClick }
          size='small'
        >
          Request
        </LoadingButton>

      </Stack>
      
    </Paper>

  );  

}