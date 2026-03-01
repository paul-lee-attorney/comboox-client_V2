
import { useState } from "react";

import { Paper, Stack, TextField, } from "@mui/material";

import { SearchOutlined } from "@mui/icons-material";
import { useWaterfallsGetSeaInfo } from "../../../../../../../generated";

import { defFormResults, FormResults, hasError, onlyInt } from "../../../../common/toolsKit";

import { booxMap, MaxPrice } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { ActionsOfDistrProps } from "../ActionsOfDistr";

export function IslandInfo({setInfo, setList}:ActionsOfDistrProps) {
  const { boox, setErrMsg } = useComBooxContext();

  const [ classOfShare, setClassOfShare ] = useState('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);  
  const [ loading, setLoading ] = useState(false);

  const {
    isLoading: getIslandInfoLoading,
    refetch:getIslandInfo,
  } = useWaterfallsGetSeaInfo({
    address: boox && boox[booxMap.WTF],
    args: [
      BigInt(classOfShare),
    ],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let info = {...data, name: 'Island Info of Class'};
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
          disabled = { classOfShare == '0' || getIslandInfoLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m:1, mx:2, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<SearchOutlined />}
          onClick={ ()=>{getIslandInfo()} }
          size='small'
        >
          Get 
        </LoadingButton>

      </Stack>
      
    </Paper>

  );  

}