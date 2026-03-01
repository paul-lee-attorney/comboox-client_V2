"use client"

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { 
  FormControl, 
  FormHelperText, 
  IconButton, 
  InputAdornment, 
  InputLabel, 
  MenuItem, 
  OutlinedInput, 
  Select, 
  Stack, 
  Tooltip 
} from '@mui/material';
import { BorderColor } from '@mui/icons-material';

import { waitForTransaction } from '@wagmi/core';

import { useComBooxContext } from '../../_providers/ComBooxContextProvider';

import { AddrZero, HexType } from '../common';
import { counterOfVersions, getDoc, getDocAddr, getTemp, typesOfEntity } from '../rc';
import { FormResults, HexParser, defFormResults, getTypeByName, hasError, onlyHex } from '../common/toolsKit';

import { useCreateNewCompCreateComp } from '../../../../generated';
import { useAccount } from 'wagmi';

export function CreateComp() {
  const { setGK, setErrMsg } = useComBooxContext();
  const router = useRouter();

  const [compFactory, setCompFactory] = useState(AddrZero);

  const { isConnected } = useAccount();

  useEffect(()=>{
    const retrieveCNC = async () => {
      let typeOfDoc = getTypeByName('CreateNewComp');
      let ver = await counterOfVersions(BigInt(typeOfDoc));
      let res = await getDoc(typeOfDoc, BigInt(ver), 1n);
      setCompFactory(res.body);
    }

    retrieveCNC();
  })

  const [ typeOfEntity, setTypeOfEntity ] = useState('');
  const [ dk, setDK ] = useState<HexType>();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const {
    isLoading: createCompLoading, 
    write: createComp,
  } = useCreateNewCompCreateComp({
    address: compFactory,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      waitForTransaction({hash}).then(
        res => {
          console.log("Receipt: ", res);
          getDocAddr(hash).then(
            addrOfGK => {
              setGK(addrOfGK);
              router.push('/app/comp');
            }
          );
          setLoading(false);
        }
      );
    }
  })

  const createCompClick = ()=>{
    if (dk) {
        createComp({
          args: [BigInt(typeOfEntity), dk], 
        });
    }
  }

  return (
    <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >

      <FormControl variant="outlined" size="small" sx={{ m:1, mr:3, width: 218 }}>
        <InputLabel id="typeOfEntity-label">TypeOfEntity</InputLabel>
        <Select
          labelId="typeOfEntity-label"
          id="typeOfEntity-select"
          label="TypeOfEntity"
          value={ typeOfEntity }
          sx={{ height:40 }}
          onChange={(e) => setTypeOfEntity(e.target.value)}
        >
          {typesOfEntity.map((v,i) => (
            <MenuItem key={v} value={ i+1 } > <b>{v}</b> </MenuItem>
          ))}
        </Select>
        <FormHelperText>{' '}</FormHelperText>
      </FormControl>

      <FormControl size='small' sx={{ m:1, ml:3, width: 218 }} variant="outlined">
        <InputLabel size='small' htmlFor="setBookeeper-input" >PrimeKey Of Secretary</InputLabel>
        <OutlinedInput
          size='small'
          id="setBookeeper-input"
          aria-describedby='setBookeeper-input-helper-text'
          label='PrimeKey Of Secretary'
          error={ valid['Bookeeper']?.error }
          sx={{ 
            height:40,
            '&.Mui-disabled': {
              color: 'primary.main',
              borderColor: 'primary.main',
            },
          }}
          endAdornment={
            <InputAdornment position="end">
              <Tooltip title={"Create Boox"} placement='right' arrow >
                <span>
                  <IconButton
                    disabled={ createCompLoading || hasError(valid) || 
                      loading || compFactory == AddrZero || !isConnected }
                    color='primary'
                    onClick={ createCompClick }
                    edge="end"
                  >
                    <BorderColor />
                  </IconButton>
                </span>
              </Tooltip>
            </InputAdornment>
          }
          onChange={(e) => {
            let input = HexParser(e.target.value);
            onlyHex('Bookeeper', input, 40, setValid);
            setDK(input);
          }}
          value={ dk }
        />
        <FormHelperText id='setBookeeper-input-helper-text'>
          { valid['Bookeeper']?.helpTx ?? ' ' }
        </FormHelperText>
      </FormControl>

    </Stack> 
  )
}
