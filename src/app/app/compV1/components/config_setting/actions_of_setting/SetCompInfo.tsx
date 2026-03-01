
import { Dispatch, SetStateAction, useState } from "react";

import { FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, } from "@mui/material";
import { Update } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

import { HexType, currencies } from "../../../../common";
import { refreshAfterTx, toAscii } from "../../../../common/toolsKit";
import { CompInfo } from "../../../gk";

import { useGeneralKeeperSetCompInfo } from "../../../../../../../generated-v1";
import { defaultInfo } from "../../SetCompInfo";

export interface ConfigSettingProps{
  setOpen: Dispatch<SetStateAction<boolean>>;
  setTime: Dispatch<SetStateAction<number>>;
}

export function SetCompInfo({setOpen, setTime}:ConfigSettingProps) {
  const { gk, setErrMsg, setCompInfo } = useComBooxContext();

  const [ comInfo, setComInfo] = useState<CompInfo>(defaultInfo);  
  const [ loading, setLoading ] = useState(false);
  
  const updateResults = ()=>{
    let temp = {...comInfo, typeOfEntity: 1};
    setTime(Date.now());
    setLoading(false);
    setOpen(false);
    setCompInfo(temp);
  }

  const {
    isLoading: setInfoLoading,
    write: setInfo, 
   } = useGeneralKeeperSetCompInfo({
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
    setInfo({
      args: [
        comInfo.currency, 
        `0x${toAscii(comInfo.symbol).padEnd(38,'0')}`, 
        comInfo.name 
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

      <Stack direction='row' sx={{alignItems:'center', justifyContent:'start'}} >
        <TextField 
          sx={{ m: 1, minWidth: 218 }} 
          id="tfNameOfComp" 
          label="CompanyName" 
          variant="outlined"
          onChange={(e) => {
            setComInfo((v) => ({
              ...v,
              name: (e.target.value ?? ''),
            }))
          }}
          value = { comInfo.name }
          size='small'
        />

        <TextField 
          sx={{ m: 1, minWidth: 120 }} 
          id="tfSymbolOfComp" 
          label="SymbolOfCompany" 
          variant="outlined"
          onChange={(e) => {
            setComInfo((v) => ({
              ...v,
              symbol: (e.target.value ?? ''),
            }))
          }}

          value = { comInfo.symbol }
          size='small'
        />

        <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 218 }}>
          <InputLabel id="bookingCurrency-label">BookingCurrency</InputLabel>
          <Select
            labelId="bookingCurrency-label"
            id="bookingCurrency-select"
            label="BookingCurrency"
            value={ comInfo.currency.toString() }
            onChange={(e) => setComInfo((v) => ({
              ...v,
              currency: Number(e.target.value) ,
            }))}
          >
            {currencies.map((v, i) => (
              <MenuItem key={i} value={i.toString()}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <LoadingButton 
          disabled = { setInfoLoading }
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<Update />}
          onClick={ handleClick }
          size='small'
        >
          Update
        </LoadingButton>

      </Stack>

    </Paper>

  );  


}