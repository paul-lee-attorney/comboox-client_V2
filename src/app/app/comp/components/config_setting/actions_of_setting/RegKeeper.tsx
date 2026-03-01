
import { useState } from "react";

import { FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, Stack, TextField, } from "@mui/material";
import { Create } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

import { RegBookProps } from "./RegBook";

import { titleOfKeepers } from "../../../gk";

import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from "../../../../common/toolsKit";
import { HexType } from "../../../../common";

import { useCompKeeperRegKeeper } from "../../../../../../../generated";

export function RegKeeper({title, book, setTitle, setBook, setOpen}:RegBookProps) {
  const { gk, setErrMsg } = useComBooxContext();

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);
  
  const updateResults = ()=>{
    setOpen(false);
    setLoading(false);
  }

  const {
    isLoading: regKeeperLoading,
    write: regKeeper,
  } = useCompKeeperRegKeeper({
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
    regKeeper({
      args: [
        BigInt(title), 
        book
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
        <Stack direction={'row'} sx={{ justifyContent:'start'}} >

        <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 168 }}>
          <InputLabel id="typeOfAction-label">Title</InputLabel>
          <Select
            labelId="typeOfAction-label"
            id="typeOfAction-select"
            label="Title"
            value={ title }
            onChange={(e) => setTitle(Number(e.target.value))}
          >
            {titleOfKeepers.map((v, i) => (
              <MenuItem key={v} value={i} > {v} </MenuItem>
            ))}
          </Select>
          <FormHelperText>{' '}</FormHelperText>
        </FormControl>

          <TextField 
            variant='outlined'
            label='Keeper'
            size="small"
            error={ valid['Keeper']?.error }
            helperText={ valid['Keeper']?.helpTx ?? ' ' }
            sx={{
              m:1,
              minWidth: 480,
            }}
            value={ book }
            onChange={(e)=>{
              let input = HexParser( e.target.value );
              onlyHex('Keeper', input, 40, setValid);
              setBook(input);
            }}
          />

          <LoadingButton 
            disabled = {regKeeperLoading || hasError(valid)}
            loading={loading}
            loadingPosition="end"
            sx={{ m: 1, minWidth: 218, height: 40 }} 
            variant="contained" 
            endIcon={<Create />}
            onClick={ handleClick }
            size='small'
          >
            Register Keeper
          </LoadingButton>

        </Stack>

    </Paper>

  );  


}