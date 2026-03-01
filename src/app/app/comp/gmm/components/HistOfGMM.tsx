"use client"

import { useState } from 'react';

import { 
  FormControl, 
  IconButton, 
  InputLabel, 
  MenuItem, 
  Select,
  Stack,
} from '@mui/material';

import { AddrZero, HexType } from '../../../common';
import { HexParser } from '../../../common/toolsKit';
import { SetBookAddrProps } from '../../../components/SetBookAddr';
import { ChangeCircleOutlined } from '@mui/icons-material';

const gmms = [
  "0x5887E0768fdE5Bb1673d7F9A0e084cc87A2488FB",
  "0xd02114Eb9C569b0db4d60988b7aE179a5d170539",
  "0xb183cE2a7787b6319b9f9d1F4ECa5422393D1732",
  "0x7fD7bA313ACb928F92fB7BB67729c999A5b50744",
  "0xa55e249Ca4bfF878E80dE14F16Fe05C7D3B5e844"
];

export function HistOfGMM({ setAddr }: SetBookAddrProps) {

  const [ temp, setTemp ] = useState<HexType>();

  function setBookAddr() {
    setAddr(temp ?? AddrZero);
  };

  return (
    <FormControl variant="outlined" size="small" sx={{ m:1, ml:5 }}>
      <InputLabel id="typeOfAction-label">HistOfGMM:</InputLabel>
      <Stack direction="row" >
        <Select
          labelId="typeOfAction-label"
          id="typeOfAction-select"
          label="HistOfGMM"
          sx={{minWidth: 128}}
          value={ temp }
          onChange={(e) => setTemp(HexParser(e.target.value))}
        >
          {gmms.map((v,i) => (
            <MenuItem key={v} value={ v } > <b>GMM_{i+1}</b> </MenuItem>
          ))}
        </Select>
        <IconButton
          size='small'
          disabled={!temp}
          color='primary'
          onClick={ setBookAddr }
          edge="end"
        >
          <ChangeCircleOutlined />
        </IconButton>
      </Stack>
    </FormControl>
  )
}
