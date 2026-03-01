import { Dispatch, SetStateAction, useState } from "react";
import { Bytes32Zero, HexType } from "../../../common";
import { StrLocker, getLocker } from "../../../rc";
import { Button, Stack, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";
import { FormResults, HexParser, defFormResults, hasError, onlyHex } from "../../../common/toolsKit";

interface LockerFinderProps{
  setLocker: Dispatch<SetStateAction<StrLocker>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function LockerFinder({setLocker, setOpen}: LockerFinderProps) {

  const [ hashLock, setHashLock ] = useState<HexType>(Bytes32Zero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const searchLocker = ()=>{
    if (hashLock) {
      getLocker(hashLock).then(
        locker => {
          setLocker(locker);
          setOpen(true);
        }    
      );
    }
  }

  return(
    <Stack direction='row' sx={{ alignItems:'start' }} >

      <TextField 
        sx={{ m: 1, minWidth: 685 }} 
        id="tfStrLock" 
        label="HashLock" 
        variant="outlined"
        error={ valid['HashLock']?.error }
        helperText={ valid['HashLock']?.helpTx ?? ' ' }
        value = { hashLock }
        size='small'
        onChange={(e) => {
          let input = HexParser(e.target.value);
          onlyHex('HashLock', input, 64, setValid); 
          setHashLock(input);
        }}
      />

      <Button 
        disabled={ hasError(valid) }
        sx={{ m: 1, minWidth: 168, height: 40 }} 
        variant="contained" 
        endIcon={ <Search /> }
        onClick={ searchLocker }
        size='small'
      >
        Search
      </Button>

    </Stack>
  );
}