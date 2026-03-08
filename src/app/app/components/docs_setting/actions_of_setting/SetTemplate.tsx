
import { useState } from "react";

import { Paper, Stack, TextField } from "@mui/material";
import { Create } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";

import { AddrOfRegCenter, AddrZero, HexType, MaxUserNo } from "../../../common";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, onlyInt, refreshAfterTx } from "../../../common/toolsKit";

import { useRegCenterSetTemplate } from "../../../../../../generated";
import { CreateDocProps } from "./CreateProxy";

export interface SetTemplateProps extends CreateDocProps{
  titleOfTemp: string;
}

export function SetTemplate({titleOfTemp, typeOfDoc, setOpen, setTime}:SetTemplateProps) {

  const { setErrMsg } = useComBooxContext();

  const [ body, setBody ] = useState<HexType>(AddrZero);
  const [ author, setAuthor ] = useState('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    setLoading(false);
    setTime( Date.now());
    setOpen(false);
  }

  const {
    isLoading: setTemplateLoading,
    write: setTemplate,
  } = useRegCenterSetTemplate({
    address: AddrOfRegCenter,
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
    setTemplate({
      args: body != AddrZero && author > '0'
      ? [ BigInt(typeOfDoc), body, BigInt(HexParser(author)) ]
      : undefined,
    });
  };

  return (

    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >
      <Stack direction='row' sx={{ alignItems:'start'}} >

        <TextField 
          variant='outlined'
          label='TitleOfTemp'
          size="small"
          inputProps={{readOnly: true }}
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ titleOfTemp }
        />

        <TextField 
          variant='outlined'
          label='TypeOfDoc'
          size="small"
          inputProps={{readOnly: true }}
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ HexParser(typeOfDoc.toString(16)) }
        />

        <TextField 
          variant='outlined'
          label='Body'
          size="small"
          error={ valid['Body']?.error }
          helperText={ valid['Body']?.helpTx ?? ' ' }                        
          sx={{
            m:1,
            minWidth: 420,
          }}
          value={ body }
          onChange={(e)=>{
            let input = HexParser( e.target.value );
            onlyHex('Body', input, 40, setValid);
            setBody(input);
          }}
        />

        <TextField 
          variant='outlined'
          label='Author'
          size="small"
          error={ valid['Author']?.error }
          helperText={ valid['Author']?.helpTx ?? ' ' }                        
          sx={{
            m:1,
            minWidth: 218,
          }}
          value={ author }
          onChange={(e)=>{
            let input = e.target.value;
            onlyHex('Author', input, 10, setValid);
            setAuthor(input);
          }}
        />

        <LoadingButton 
          disabled = {setTemplateLoading || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 128, height: 40 }} 
          variant="contained" 
          endIcon={<Create />}
          onClick={ handleClick }
          size='small'
        >
          Set
        </LoadingButton>

      </Stack>
    </Paper>

  );  


}