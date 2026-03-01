
import { useState } from "react";

import { Divider, Paper, Stack, TextField } from "@mui/material";
import { Update } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { AddrZero, HexType } from "../../../../common";

import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from "../../../../common/toolsKit";

import { AccessControlProps } from "./SetOwner";

import { useAccessControlTakeBackKeys } from "../../../../../../../generated";

export function TakeBackKeys({docAddr, setDocAddr, setOpen}:AccessControlProps) {

  const { setErrMsg } = useComBooxContext();

  const [ target, setTarget ] = useState<HexType>(AddrZero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    setOpen(false);
    setLoading(false);
  }

  const {
    isLoading: takeBackKeysLoading,
    write: takeBackKeys,
  } = useAccessControlTakeBackKeys({
    address: docAddr,
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
    takeBackKeys({
      args: [ target ],
    });
  };

  return (

    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >
      <Stack direction={'row'} sx={{ alignItems:'center'}} >

        <Stack direction={'column'} sx={{ justifyContent:'center'}} >

          <TextField 
            variant='outlined'
            label='DocAddress'
            size="small"
            error={ valid['DocAddress']?.error }
            helperText={ valid['DocAddress']?.helpTx ?? ' ' }
            sx={{
              m:1,
              minWidth: 480,
            }}
            value={ docAddr }
            onChange={(e)=>{
              let input = HexParser( e.target.value );
              onlyHex('DocAddress', input, 40, setValid);
              setDocAddr(input);
            }}
          />

          <TextField 
            variant='outlined'
            label='TargetBook'
            size="small"
            error={ valid['TargetBook']?.error }
            helperText={ valid['TargetBook']?.helpTx ?? ' ' }
            sx={{
              m:1,
              minWidth: 480,
            }}
            value={ target }
            onChange={(e)=>{
              let input = HexParser( e.target.value );
              onlyHex('TargetBook', input, 40, setValid);
              setTarget(input);
            }}
          />

        </Stack>

        <Divider orientation="vertical" flexItem />

        <LoadingButton 
          disabled = {takeBackKeysLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<Update />}
          onClick={ handleClick }
          size='small'
        >
          Update
        </LoadingButton>

      </Stack>
    </Paper>

  );  


}