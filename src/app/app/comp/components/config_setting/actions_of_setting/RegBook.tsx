
import { Dispatch, SetStateAction, useState, } from "react";

import { FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, Stack, TextField } from "@mui/material";
import { Create, } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";


import { HexType } from "../../../../common";
import { nameOfBooks } from "../../../gk";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from "../../../../common/toolsKit";

import { useCompKeeperRegBook } from "../../../../../../../generated";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export interface RegBookProps{
  title: number;
  book: HexType;
  setTitle: Dispatch<SetStateAction<number>>;
  setBook: Dispatch<SetStateAction<HexType>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}


export function RegBook({title, book, setTitle, setBook, setOpen}:RegBookProps) {
  const { gk, setErrMsg, setBoox } = useComBooxContext();

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    setBoox(v => {
      if (!v) return;
      let arr = [...v];
      if (arr.length < title) return;
      arr[title] = book;
      return arr;
    });
    setOpen(false);
    setLoading(false);
  }

  const {
    isLoading: regBookLoading,
    write: regBook,
  } = useCompKeeperRegBook({
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
    regBook({
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
              {nameOfBooks.map((v, i) => (
                <MenuItem key={v} value={i} > {v} </MenuItem>
              ))}
            </Select>
            <FormHelperText>{' '}</FormHelperText>
          </FormControl>

          <TextField 
            variant='outlined'
            label='Book'
            size="small"
            error={ valid['Book']?.error }
            helperText={ valid['Book']?.helpTx ?? ' ' }
            sx={{
              m:1,
              minWidth: 480,
            }}
            value={ book }
            onChange={(e)=>{
              let input = HexParser( e.target.value );
              onlyHex('Book', input, 40, setValid); 
              setBook(input);
            }}
          />

          <LoadingButton 
            disabled = {regBookLoading || hasError(valid)}
            loading={loading}
            loadingPosition="end"
            sx={{ m: 1, minWidth: 218, height: 40  }} 
            variant="contained" 
            endIcon={<Create />}
            onClick={ handleClick }
            size='small'
          >
            Register Book
          </LoadingButton>

        </Stack>

    </Paper>

  );  


}