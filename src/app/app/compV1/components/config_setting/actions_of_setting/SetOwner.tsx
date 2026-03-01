
import { Dispatch, SetStateAction, useState } from "react";

import { Divider, Paper, Stack, TextField } from "@mui/material";
import { Update } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

import { AddrZero, HexType } from "../../../../common";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from "../../../../common/toolsKit";

import { useOwnableSetNewOwner } from "../../../../../../../generated-v1";

export interface AccessControlProps{
  docAddr: HexType;
  setDocAddr: Dispatch<SetStateAction<HexType>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function SetOwner({docAddr, setDocAddr, setOpen}:AccessControlProps) {

  const { setErrMsg } = useComBooxContext();

  const [ owner, setOwner ] = useState<HexType>(AddrZero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    setOpen(false);
    setLoading(false);
  }

  const {
    isLoading: updateOwnerLoading,
    write: updateOwner,
  } = useOwnableSetNewOwner({
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
    updateOwner({
      args: [ 
        owner 
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
            label='Owner'
            size="small"
            error={ valid['Owner']?.error }
            helperText={ valid['Owner']?.helpTx ?? ' ' }                        
            sx={{
              m:1,
              minWidth: 480,
            }}
            value={ owner }
            onChange={(e)=>{
              let input = HexParser( e.target.value );
              onlyHex('Owner', input, 40, setValid);
              setOwner(input);
            }}
          />

        </Stack>

        <Divider orientation="vertical" flexItem />

        <LoadingButton 
          disabled = {updateOwnerLoading || hasError(valid)}
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