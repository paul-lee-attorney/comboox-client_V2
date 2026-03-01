
import { useState } from "react";

import { Paper, Stack, TextField, } from "@mui/material";
import { Approval } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { AddrZero, HexType } from "../../../common";
import { refreshAfterTx } from "../../../common/toolsKit";

import { useGeneralKeeperCreateCorpSeal } from "../../../../../../generated-v1";
import { CreateDocProps } from "./CreateDoc";

export function CreateCorpSeal({typeOfDoc, version, addr, setOpen, setTime}:CreateDocProps) {

  const [ loading, setLoading ] = useState(false);
  
  const updateResults = ()=>{
    setLoading(false);
    setOpen(false);
    setTime( Date.now());
  }

  const {
    isLoading: createSealLoading,
    write: createSeal, 
   } = useGeneralKeeperCreateCorpSeal({
    address: addr,
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  return (

    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >

      <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >

        <TextField 
          variant='outlined'
          label='DocAddress'
          size="small"
          inputProps={{readonly:'true'}}
          sx={{
            m:1,
            minWidth: 420,
          }}
          value={ addr }
        />

        <LoadingButton 
          disabled = { createSealLoading || addr == AddrZero}
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<Approval />}
          onClick={ ()=>createSeal() }
          size='small'
        >
          Create Seal
        </LoadingButton>

      </Stack>

    </Paper>

  );  


}