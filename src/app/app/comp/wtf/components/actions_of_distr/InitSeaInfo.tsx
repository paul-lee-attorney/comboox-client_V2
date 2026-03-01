
import { useState } from "react";

import { Paper, Stack, TextField, } from "@mui/material";

import { QueryBuilderOutlined } from "@mui/icons-material";
import { useWaterfallsGetInitSeaInfo } from "../../../../../../../generated";

import { defFormResults, FormResults, hasError, onlyInt } from "../../../../common/toolsKit";

import { booxMap, HexType, MaxPrice } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { ActionsOfDistrProps } from "../ActionsOfDistr";

export function InitSeaInfo({setInfo, setList}:ActionsOfDistrProps) {
  const { gk, boox, setErrMsg } = useComBooxContext();

  const [ classOfShare, setClassOfShare ] = useState('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);  
  const [ loading, setLoading ] = useState(false);

  // const updateResults = ()=>{ 
  //   setLoading(false);
  // }

  const {
    isLoading: getInitSeaInfoLoading,
    refetch:getInitSeaInfo,
  } = useWaterfallsGetInitSeaInfo({
    address: boox && boox[booxMap.WTF],
    args: [
      BigInt(classOfShare),
    ],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let info = {...data, name: 'Init Info of Class'};
      setInfo(info);
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
          label='ClassOfShare'
          error={ valid['ClassOfShare']?.error }
          helperText={ valid['ClassOfShare']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyInt('ClassOfShare', input, MaxPrice, setValid);            
            setClassOfShare(input);
          }}
          value={ classOfShare } 
        />

        <LoadingButton 
          disabled = { classOfShare == '0' || getInitSeaInfoLoading || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          sx={{ m:1, mx:2, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<QueryBuilderOutlined />}
          onClick={ ()=>{getInitSeaInfo()} }
          size='small'
        >
          Get 
        </LoadingButton>

      </Stack>
      
    </Paper>

  );  

}