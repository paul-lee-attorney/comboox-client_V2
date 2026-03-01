
import { useState } from "react";

import { Paper, Stack, } from "@mui/material";

import { SearchOutlined } from "@mui/icons-material";
import { useWaterfallsGetAllSeasInfo } from "../../../../../../../generated";

import { defFormResults, FormResults, onlyInt } from "../../../../common/toolsKit";

import { booxMap, } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { ActionsOfDistrProps } from "../ActionsOfDistr";

export function AllSeasInfo({setInfo, setList}:ActionsOfDistrProps) {
  const { boox, setErrMsg } = useComBooxContext();

  const [ loading, setLoading ] = useState(false);

  const {
    isLoading: getAllSeaInfoLoading,
    refetch:getAllSeaInfo,
  } = useWaterfallsGetAllSeasInfo({
    address: boox && boox[booxMap.WTF],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let list = data.map((v,i) => ({...v, seqNum:i+1}));
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

        <LoadingButton 
          disabled = { getAllSeaInfoLoading }
          loading={loading}
          loadingPosition="end"
          sx={{ m:1, mx:2, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<SearchOutlined />}
          onClick={ ()=>{getAllSeaInfo()} }
          size='small'
        >
          Get 
        </LoadingButton>

      </Stack>
      
    </Paper>

  );  

}