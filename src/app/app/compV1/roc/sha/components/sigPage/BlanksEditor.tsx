import { useState } from "react";

import { Stack, IconButton, TextField, Tooltip, FormControl,
  InputLabel, Select, MenuItem, FormHelperText,
} from "@mui/material";

import { HexType, MaxUserNo } from "../../../../../common";

import { PersonAdd, PersonRemove } from "@mui/icons-material"

import { useSigPageAddBlank, useSigPageRemoveBlank,
} from "../../../../../../../../generated-v1";


import { FormResults, defFormResults, hasError, 
  onlyInt, refreshAfterTx } from "../../../../../common/toolsKit";

import { ParasOfPageProps } from "./ParasOfPage";
import { useComBooxContext } from "../../../../../../_providers/ComBooxContextProvider";

export function BlanksEditor({ addr, initPage, isSha, setTime }: ParasOfPageProps) {

  const { setErrMsg } = useComBooxContext();

  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ isBuyer, setIsBuyer ] = useState(true);
  const [ acct, setAcct ] = useState<string>();

  const [loadingAddBlk, setLoadingAddBlk] = useState(false);
  const refreshAddBlk = () => {
    setTime(Date.now());
    setLoadingAddBlk(false);
  }

  const {
    isLoading: addBlankIsLoading,
    write: addBlank,
  } = useSigPageAddBlank({
    address: addr,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingAddBlk(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshAddBlk);
    }
  });

  const addBlkClick = ()=> {
    if (acct && isBuyer != undefined)
      addBlank({
        args: [
          initPage,
          isBuyer, 
          BigInt('1'), 
          BigInt(acct),
        ]
      });
  }

  const [loadingRemoveBlk, setLoadingRemoveBlk] = useState(false);
  const refreshRemoveBlk = () => {
    setTime(Date.now());
    setLoadingRemoveBlk(false);
  }

  const {
    isLoading: removeBlankIsLoading,
    write: removeBlank,
  } = useSigPageRemoveBlank({
    address: addr,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingRemoveBlk(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshRemoveBlk);
    }
  });

  const removeBlkClick = ()=> {
    if (acct)
      removeBlank({
        args: [
          initPage,
          BigInt('1'), 
          BigInt(acct),
        ]
      });
  }

  return (
    <Stack direction={'row'} sx={{ alignItems:'start' }} >

      <Tooltip
        title='Add Party'
        placement="top-start"
        arrow
      >
        <span>
        <IconButton 
          disabled={ addBlankIsLoading || hasError(valid) || loadingAddBlk}
          sx={{width: 20, height: 20, m:1, mt: 4 }} 
          onClick={ addBlkClick }
          color="primary"
        >
          < PersonAdd />
        </IconButton>
        </span>
      </Tooltip>

      <FormControl variant="outlined" size="small" sx={{ m: 1, mt:3, minWidth: 218 }}>
        <InputLabel id="isBuyer-label">Role</InputLabel>
        <Select
          labelId="isBuyer-label"
          id="isBuyer-select"
          value={ isBuyer ? 'true' : 'false' }
          onChange={(e) => setIsBuyer(e.target.value == 'true')}
          label="Role"
        >
          <MenuItem value={'true'}>{isSha ? 'Investor' : 'Buyer'}</MenuItem>
          <MenuItem value={'false'}>{isSha? 'Shareholders' : 'Seller'}</MenuItem>
        </Select>
        <FormHelperText>{' '}</FormHelperText>
      </FormControl>

      <TextField
        variant='outlined'
        size='small'
        label='UserNo.'
        error={ valid['UserNo']?.error }
        helperText={ valid['UserNo']?.helpTx ?? ' ' }

        sx={{
          m:1,
          mt:3,
          minWidth: 218,
        }}
        onChange={(e) => {
          let input = e.target.value;
          onlyInt('UserNo', input, MaxUserNo, setValid);
          setAcct(input);
        }}
        value={ acct }                                      
      />

      <Tooltip
        title='Remove Party'
        placement="top-end"
        arrow
      >           
        <span>
        <IconButton
          disabled={ removeBlankIsLoading || hasError(valid) || loadingRemoveBlk} 
          sx={{width: 20, height: 20, m:1, mt:4, mr:2 }} 
          onClick={ removeBlkClick }
          color="primary"
        >
          <PersonRemove/>
        </IconButton>
        </span>

      </Tooltip>

    </Stack>
  );
} 

