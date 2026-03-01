
import { useState } from "react";

import { Paper, Stack, TextField, } from "@mui/material";

import { SearchOutlined } from "@mui/icons-material";
import { useWaterfallsGetLakeInfo } from "../../../../../../../generated";

import { defFormResults, FormResults, hasError, onlyInt } from "../../../../common/toolsKit";

import { booxMap, MaxUserNo } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { ActionsOfDistrProps } from "../ActionsOfDistr";

export function LakeInfo({setInfo, setList}:ActionsOfDistrProps) {
  const { boox, setErrMsg } = useComBooxContext();

  const [ member, setMember ] = useState('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);  
  const [ loading, setLoading ] = useState(false);

  const {
    isLoading: getLakeInfoLoading,
    refetch:getLakeInfo,
  } = useWaterfallsGetLakeInfo({
    address: boox && boox[booxMap.WTF],
    args: [
      BigInt(member),
    ],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let info = {...data, name: 'Lake Info of Member'};
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
          label='Member'
          error={ valid['Member']?.error }
          helperText={ valid['Member']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyInt('Member', input, MaxUserNo, setValid);            
            setMember(input);
          }}
          value={ member } 
        />

        <LoadingButton 
          disabled = { member == '0' || getLakeInfoLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m:1, mx:2, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<SearchOutlined />}
          onClick={ ()=>{getLakeInfo()} }
          size='small'
        >
          Get 
        </LoadingButton>

      </Stack>
      
    </Paper>

  );  

}