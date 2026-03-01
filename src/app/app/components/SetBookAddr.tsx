"use client"

import { Dispatch, SetStateAction, useState } from 'react';

import { 
  FormControl, 
  FormHelperText, 
  IconButton, 
  Input, 
  InputAdornment, 
  Tooltip 
} from '@mui/material';
import { ChangeCircleOutlined } from '@mui/icons-material';

import { AddrZero, HexType } from '../common';
import { FormResults, HexParser, defFormResults, hasError, onlyHex } from '../common/toolsKit';


export interface SetBookAddrProps {
  setAddr: Dispatch<SetStateAction<HexType>>;
}

export function SetBookAddr({ setAddr}: SetBookAddrProps) {

  const [ temp, setTemp ] = useState<HexType>();
  const [ valid, setValid ] = useState<FormResults>(defFormResults);  

  const setBookAddr = ()=> {
    setAddr(temp ?? AddrZero);
  }

  return (
    <FormControl size='small' sx={{ m:1, ml:50, width: 488 }} variant="outlined">
      <Input
        size='small'
        id="setBookAddr-input"
        aria-describedby='setBookAddr-input-helper-text'
        error={ valid['BookAddr']?.error }
        sx={{ height:40 }}
        endAdornment={
          <InputAdornment position="end">
            <Tooltip title={"SetAddr"} placement='right' arrow >
              <span>
                <IconButton
                  size='small'
                  disabled={ hasError(valid) || !temp}
                  color='primary'
                  onClick={ setBookAddr }
                  edge="end"
                >
                  <ChangeCircleOutlined />
                </IconButton>
              </span>
            </Tooltip>
          </InputAdornment>
        }
        onChange={(e) => {
          let input = HexParser(e.target.value);
          onlyHex('BookAddr', input, 40, setValid);
          setTemp(input);
        }}
        value={ temp }

        placeholder='Input Target Book Address'
      />
      <FormHelperText id='setBookAddr-input-helper-text'>
        { valid['BookAddr']?.helpTx ?? ' ' }
      </FormHelperText>
    </FormControl>
  )
}
