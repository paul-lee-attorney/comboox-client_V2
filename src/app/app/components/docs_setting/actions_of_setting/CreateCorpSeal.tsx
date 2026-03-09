
import { useState } from "react";

import { FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, Stack, TextField, } from "@mui/material";
import { Approval } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { AddrZero, HexType } from "../../../common";
import { refreshAfterTx } from "../../../common/toolsKit";

import { useIGeneralKeeperCreateCorpSeal } from "../../../../../../generated";
import { CreateDocProps } from "./CreateProxy";
import { typesOfEntity } from "../../../rc";

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
   } = useIGeneralKeeperCreateCorpSeal({
    address: addr,
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  const [ typeOfEntity, setTypeOfEntity ] = useState<number>(0);

  const handleClick = ()=>{
    createSeal({
      args:[ BigInt(typeOfEntity) ]
    });
  };

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
          inputProps={{readOnly: true }}
          sx={{
            m:1,
            minWidth: 420,
          }}
          value={ addr }
        />

        <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
          <InputLabel id="typeOfEntity-label">TypeOfEntity</InputLabel>
          <Select
            labelId="typeOfEntity-label"
            id="typeOfEntity-select"
            label="TypeOfEntity"
            value={ typeOfEntity }
            onChange={(e) =>  setTypeOfEntity( Number(e.target.value) ) }
          >
            {typesOfEntity.map((v,i) => (
              <MenuItem key={v} value={ i+1 } > <b>{v}</b> </MenuItem>
            ))}
          </Select>
        </FormControl>


        <LoadingButton 
          disabled = { createSealLoading || addr == AddrZero}
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<Approval />}
          onClick={ handleClick }
          size='small'
        >
          Create Seal
        </LoadingButton>

      </Stack>

    </Paper>

  );  


}