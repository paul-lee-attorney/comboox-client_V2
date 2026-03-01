
import { useState } from "react";

import { Divider, Paper, Stack, TextField } from "@mui/material";
import { RocketLaunchOutlined } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";

import { AddrZero, HexType } from "../../../common";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from "../../../common/toolsKit";

import { useAccessControlInitKeepers } from "../../../../../../generated";
import { CreateDocProps } from "./CreateDoc";

export function InitKeepers({addr, setOpen, setTime}:CreateDocProps) {

  const { setErrMsg } = useComBooxContext();

  const [ dk, setDK ] = useState<HexType>(AddrZero);
  const [ gk, setGK ] = useState<HexType>(AddrZero);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    setLoading(false);
    setTime( Date.now());
    setOpen(false);
  }

  const {
    isLoading: initKeepersLoading,
    write: initKeepers,
  } = useAccessControlInitKeepers({
    address: addr,
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
      args: dk != AddrZero && gk != AddrZero
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
      <Stack direction='column' sx={{ alignItems:'start'}} >

        <TextField 
          variant='outlined'
          label='TargetDoc'
          size="small"
          inputProps={{readonly:'true'}}
          sx={{
            m:1,
            minWidth: 420,
          }}
          value={ addr }
        />

        <Divider orientation='horizontal' flexItem />

        <Stack direction='row' >

          <TextField 
            variant='outlined'
            label='DirectKeeper'
            size="small"
            error={ valid['DirectKeeper']?.error }
            helperText={ valid['DirectKeeper']?.helpTx ?? ' ' }                        
            sx={{
              m:1,
              minWidth: 420,
            }}
            value={ dk }
            onChange={(e)=>{
              let input = HexParser( e.target.value );
              onlyHex('DirectKeeper', input, 40, setValid);
              setDK(input);
            }}
          />

          <TextField 
            variant='outlined'
            label='GeneralKeeper'
            size="small"
            error={ valid['GeneralKeeper']?.error }
            helperText={ valid['GeneralKeeper']?.helpTx ?? ' ' }                        
            sx={{
              m:1,
              minWidth: 420,
            }}
            value={ gk }
            onChange={(e)=>{
              let input = HexParser( e.target.value );
              onlyHex('GeneralKeeper', input, 40, setValid);
              setGK(input);
            }}
          />

          <LoadingButton 
            disabled = {initKeepersLoading || hasError(valid)}
            loading={loading}
            loadingPosition="end"
            sx={{ m: 1, minWidth: 128, height: 40 }} 
            variant="contained" 
            endIcon={<RocketLaunchOutlined />}
            onClick={ handleClick }
            size='small'
          >
            Init
          </LoadingButton>

        </Stack>

      </Stack>
    </Paper>

  );  


}