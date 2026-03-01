
import { useState } from "react";

import { Divider, Paper, Stack, TextField } from "@mui/material";
import { RocketLaunchOutlined } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

import { AddrZero, HexType } from "../../../../common";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from "../../../../common/toolsKit";

import { useAccessControlInitKeepers } from "../../../../../../../generated-v1";

import { AccessControlProps } from "./SetOwner";

export function InitKeepers({docAddr, setDocAddr, setOpen}:AccessControlProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ dk, setDK ] = useState<HexType>(AddrZero);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    setOpen(false);
    setLoading(false);
  }

  const {
    isLoading: initKeepersLoading,
    write: initKeepers,
  } = useAccessControlInitKeepers({
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
    initKeepers({
      args: gk 
      ? [ dk, gk ]
      : undefined,
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
            label='DirectKeeper'
            size="small"
            error={ valid['DirectKeeper']?.error }
            helperText={ valid['DirectKeeper']?.helpTx ?? ' ' }
            sx={{
              m:1,
              minWidth: 480,
            }}
            value={ dk }
            onChange={(e)=>{
              let input = HexParser( e.target.value );
              onlyHex('DirectKeeper', input, 40, setValid);
              setDK(input);
            }}
          />

        </Stack>

        <Divider orientation="vertical" flexItem />

        <LoadingButton 
          disabled = {initKeepersLoading || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<RocketLaunchOutlined />}
          onClick={ handleClick }
          size='small'
        >
          Init
        </LoadingButton>

      </Stack>
    </Paper>

  );  

}