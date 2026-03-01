
import { useState } from "react";

import { Paper, Stack, TextField, } from "@mui/material";

import { SearchOutlined } from "@mui/icons-material";
import { useWaterfallsGetCreeksOfStream } from "../../../../../../../generated";

import { defFormResults, FormResults, hasError, onlyInt } from "../../../../common/toolsKit";

import { booxMap, MaxSeqNo } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { ActionsOfDistrProps } from "../ActionsOfDistr";

export function CreeksOfStream({setInfo, setList}:ActionsOfDistrProps) {
  const { gk, boox, setErrMsg } = useComBooxContext();

  const [ seqOfDistr, setSeqOfDistr ] = useState('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);  
  const [ loading, setLoading ] = useState(false);

  const {
    isLoading: getCreeksOfStreamLoading,
    refetch:getCreeksOfStream,
  } = useWaterfallsGetCreeksOfStream({
    address: boox && boox[booxMap.WTF],
    args: [
      BigInt(seqOfDistr),
    ],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let list = data.map((v,i)=>({...v, seqNum: i+1}));
      setList(list);
      setLoading(false);
    }
  });

  return (

    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >

      <Stack direction={'row'} sx={{ alignItems:'start'}} >

        <TextField 
          variant='outlined'
          size="small"
          label='SeqOfDistr'
          error={ valid['SeqOfDistr']?.error }
          helperText={ valid['SeqOfDistr']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyInt('SeqOfDistr', input, MaxSeqNo, setValid);
            setSeqOfDistr(input);
          }}
          value={ seqOfDistr } 
        />

        <LoadingButton 
          disabled = { seqOfDistr == '0' || getCreeksOfStreamLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m:1, mx:2, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<SearchOutlined />}
          onClick={ ()=>{getCreeksOfStream()} }
          size='small'
        >
          Get 
        </LoadingButton>

      </Stack>
      
    </Paper>

  );  

}