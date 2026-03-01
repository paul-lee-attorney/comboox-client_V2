import { Dispatch, SetStateAction, useState } from "react";
import { AddrOfCL, Bytes32Zero, HexType } from "../../../common";

import { Button, Stack, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";
import { FormResults, HexParser, defFormResults, hasError, onlyHex } from "../../../common/toolsKit";
import { getLocker, ItemLocker, parseOrgLocker } from "../../../cl";

interface UsdLockerFinderProps{
  setLocker: Dispatch<SetStateAction<ItemLocker>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function UsdLockerFinder({setLocker, setOpen}: UsdLockerFinderProps) {

  const [ hashLock, setHashLock ] = useState<HexType>(Bytes32Zero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const searchLocker = ()=>{
    if (AddrOfCL && hashLock) {
      getLocker(AddrOfCL, hashLock).then(
        locker => {
          let item: ItemLocker = parseOrgLocker(
            hashLock, locker
          );
          setLocker(item);
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