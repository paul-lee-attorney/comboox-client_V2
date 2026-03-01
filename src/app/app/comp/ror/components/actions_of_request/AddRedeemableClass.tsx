
import { useState } from "react";

import { Paper, Stack, TextField } from "@mui/material";

import { AddCircleOutline } from "@mui/icons-material";
import { useFundKeeperAddRedeemableClass } from "../../../../../../../generated";

import { FormResults, defFormResults, hasError, onlyInt, refreshAfterTx } from "../../../../common/toolsKit";

import { HexType, MaxSeqNo } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { ActionsOfRequestProps } from "../ActionsOfRequest";

export function AddRedeemableClass({ refresh }: ActionsOfRequestProps) {
  const { gk, setErrMsg } = useComBooxContext();

  const [ targetClass, setTargetClass ] = useState('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: addClassLoading,
    write:addClass,
  } = useFundKeeperAddRedeemableClass({
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

    addClass({
      args: [
        BigInt(targetClass)
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
          label='TargetClass'
          error={ valid['TargetClass']?.error }
          helperText={ valid['TargetClass']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyInt('TargetClass', input, MaxSeqNo, setValid);
            setTargetClass(input);
          }}
          value={ targetClass } 
        />

        <LoadingButton 
          disabled = { addClassLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m:1, mx:2, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<AddCircleOutline />}
          onClick={ handleClick }
          size='small'
        >
          Add Class
        </LoadingButton>

      </Stack>
      
    </Paper>

  );  

}