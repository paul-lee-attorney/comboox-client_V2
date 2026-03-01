import { Dispatch, SetStateAction, useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";

import { OptWrap, getOptWrap } from "../roo";
import { MaxPrice, booxMap } from "../../../common";
import { FormResults, defFormResults, hasError, onlyInt } from "../../../common/toolsKit";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";

interface SearchOptionProps{
  setOpt: Dispatch<SetStateAction<OptWrap>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function SearchOption({setOpt, setOpen}:SearchOptionProps) {
  const { boox } = useComBooxContext();

  const [ seqOfOpt, setSeqOfOpt ] = useState<string>();

  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const obtainOpt = async ()=>{
    if (boox && seqOfOpt) {
      let opt = await getOptWrap(boox[booxMap.ROO], seqOfOpt);
      setOpt(opt);
      setOpen(true);
    }
  }

  return (
    <Stack direction={'row'} >
      <TextField 
        sx={{ m: 1, minWidth: 120 }} 
        id="tfSeqOfOpt" 
        label="SeqOfOption" 
        variant="outlined"
        error={ valid['SeqOfOpt']?.error }
        helperText={ valid['SeqOfOpt']?.helpTx ?? ' ' }

        onChange={(e) => {
          let input = e.target.value;
          onlyInt('SeqOfOpt', input, MaxPrice, setValid);
          setSeqOfOpt(input);
        }}
        value = { seqOfOpt }
        size='small'
      />

      <Button 
        disabled={ !seqOfOpt || hasError(valid) }
        sx={{ m:1, width:168, height: 40 }} 
        variant="contained" 
        endIcon={ <Search /> }
        onClick={ obtainOpt }
        size='small'
      >
        Search
      </Button>

    </Stack>
  );

}






