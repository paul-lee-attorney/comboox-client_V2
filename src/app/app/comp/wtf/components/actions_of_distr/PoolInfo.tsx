
import { useState } from "react";

import { Paper, Stack, TextField, } from "@mui/material";

import { SearchOutlined } from "@mui/icons-material";
import { useWaterfallsGetLakeInfo, useWaterfallsGetPoolInfo, useWaterfallsGetSeaInfo } from "../../../../../../../generated";

import { defFormResults, FormResults, hasError, onlyInt } from "../../../../common/toolsKit";

import { booxMap, MaxPrice, MaxUserNo } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { ActionsOfDistrProps } from "../ActionsOfDistr";

export function PoolInfo({setInfo, setList}:ActionsOfDistrProps) {
  const { boox, setErrMsg } = useComBooxContext();

  const [ member, setMember ] = useState('0');
  const [ classOfShare, setClassOfShare ] = useState('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);  
  const [ loading, setLoading ] = useState(false);

  const {
    isLoading: getPoolInfoLoading,
    refetch:getPoolInfo,
  } = useWaterfallsGetPoolInfo({
    address: boox && boox[booxMap.WTF],
    args: [
      BigInt(member),
      BigInt(classOfShare),
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

        <TextField 
          variant='outlined'
          size="small"
          label='Class'
          error={ valid['Class']?.error }
          helperText={ valid['Class']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyInt('Class', input, MaxPrice, setValid);            
            setClassOfShare(input);
          }}
          value={ classOfShare } 
        />

        <LoadingButton 
          disabled = { member == '0' || getPoolInfoLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m:1, mx:2, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<SearchOutlined />}
          onClick={ ()=>{getPoolInfo()} }
          size='small'
        >
          Get 
        </LoadingButton>

      </Stack>
      
    </Paper>

  );  

}