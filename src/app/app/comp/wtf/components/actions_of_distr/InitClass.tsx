
import { useState } from "react";

import { Paper, Stack, TextField, } from "@mui/material";

import { RocketLaunchOutlined } from "@mui/icons-material";
import { useFundKeeperInitClass } from "../../../../../../../generated";

import { defFormResults, FormResults, onlyInt, refreshAfterTx } from "../../../../common/toolsKit";

import { HexType, MaxPrice } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function InitClass() {
  const { gk, setErrMsg } = useComBooxContext();

  const [ classOfShare, setClassOfSare ] = useState('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);  
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{ 
    setLoading(false);
  }

  const {
    isLoading: initClassLoading,
    write:initClass,
  } = useFundKeeperInitClass({
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

    initClass({
      args: [
        BigInt(classOfShare)
      ]
    });

  };

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
            setClassOfSare(input);
          }}
          value={ classOfShare } 
        />

        <LoadingButton 
          disabled = { classOfShare == '0' || initClassLoading }
          loading={loading}
          loadingPosition="end"
          sx={{ m:1, mx:2, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<RocketLaunchOutlined />}
          onClick={ handleClick }
          size='small'
        >
          Init
        </LoadingButton>

      </Stack>
      
    </Paper>

  );  

}