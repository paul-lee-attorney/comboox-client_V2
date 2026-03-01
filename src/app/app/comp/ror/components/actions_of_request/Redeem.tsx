
import { useEffect, useState } from "react";

import { FormControl, InputLabel, MenuItem, Paper, Select, Stack, } from "@mui/material";

import { PaymentsOutlined } from "@mui/icons-material";
import { useFundKeeperRedeem } from "../../../../../../../generated";

import { refreshAfterTx } from "../../../../common/toolsKit";

import { booxMap, HexType } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { ActionsOfRequestProps } from "../ActionsOfRequest";
import { getPacksList } from "../../ror";

export function Redeem({ classOfShare, refresh }: ActionsOfRequestProps) {
  const { gk, boox, setErrMsg } = useComBooxContext();

  const [ list, setList ] = useState<number[]>([]);
  const [ pack, setPack ] = useState('');

  const [ time, setTime ] = useState(0);

  useEffect(()=>{
    if (boox && classOfShare > 0) {
      getPacksList(boox[booxMap.ROR], classOfShare).then(
        res => setList(res)
      );
    }
  }, [boox, classOfShare, time]);

  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setTime(Date.now());
  }

  const {
    isLoading: redeemLoading,
    write:redeem,
  } = useFundKeeperRedeem({
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

    redeem({
      args: [
        BigInt(classOfShare),
        BigInt(pack),
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

        <FormControl size="small" sx={{ minWidth: 218, m:1, mx:2 }}>
          <InputLabel id="typeOfAction-label">SeqOfPack</InputLabel>
          <Select
            labelId="typeOfAction-label"
            id="typeOfAction-select"
            label="SeqOfPack"
            value={ pack }
            onChange={(e) => setPack( e.target.value.toString() )}
          >
            { list.map((v, i) => (
              <MenuItem key={i} value={ v } > <b>{v}</b> </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LoadingButton 
          disabled = { pack == '' || redeemLoading }
          loading={loading}
          loadingPosition="end"
          sx={{ m:1, mx:2, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<PaymentsOutlined />}
          onClick={ handleClick }
          size='small'
        >
          Redeem
        </LoadingButton>

      </Stack>
      
    </Paper>

  );  

}