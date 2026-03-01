import { useCompKeeperExecPledge } from "../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { DoneOutline } from "@mui/icons-material";
import { ActionsOfPledgeProps } from "../ActionsOfPledge";
import { useEffect, useState } from "react";

import { HexType, MaxUserNo, booxMap } from "../../../../common";
import { getShare } from "../../../ros/ros";
import { StrBody, StrHead, defaultStrBody, defaultStrHead } from "../../../roa/ia/ia";
import { FormResults, defFormResults, hasError, onlyInt, refreshAfterTx } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function ExecPledge({pld, setOpen, refresh}:ActionsOfPledgeProps) {

  const { gk, boox, setErrMsg } = useComBooxContext();
  
  const [ head, setHead ] = useState<StrHead>(defaultStrHead);
  const [ body, setBody ] = useState<StrBody>(defaultStrBody);
  const [ version, setVersion ] = useState<string>('1');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  useEffect(()=>{
    if (boox) {
      getShare(boox[booxMap.ROS], pld.head.seqOfShare.toString()).then(
        res => {
          setHead(v => ({
            ...v,
            classOfShare: res.head.class.toString(),
            seqOfShare: pld.head.seqOfShare.toString(),
            seller: res.head.shareholder.toString(),
          }));
          setBody(v => ({
            ...v,
            paid: pld.body.paid.toString(),
            par: pld.body.par.toString(),
          }))
        }
      );
    }
  });

  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: execPledgeLoading,
    write: execPledge,
  } = useCompKeeperExecPledge({
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
    execPledge({
      args: [ 
        BigInt(pld.head.seqOfShare),
        BigInt(pld.head.seqOfPld),
        BigInt(body.buyer),
        BigInt(body.groupOfBuyer)
      ],
    });
  };

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          label='Buyer'
          error={ valid['Buyer']?.error }
          helperText={ valid['Buyer']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyInt('Buyer', input, MaxUserNo, setValid);
            setBody(v=>({
              ...v,
              buyer: e.target.value,
            }));
          }}
          value={ body.buyer }
          size='small'
        />

        <TextField 
          variant='outlined'
          label='GroupRepOfBuyer'
          error={ valid['GroupOfBuyer']?.error }
          helperText={ valid['GroupOfBuyer']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyInt('GroupOfBuyer', input, MaxUserNo, setValid);
            setBody(v=>({
              ...v,
              groupOfBuyer: e.target.value,
            }));
          }}
          value={ body.groupOfBuyer }
          size='small'
        />

        <LoadingButton 
          disabled={ execPledgeLoading || hasError(valid) }
          loading = {loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 168, height: 40 }} 
          variant="contained" 
          endIcon={ <DoneOutline /> }
          onClick={ handleClick }
          size='small'
        >
          Exercise
        </LoadingButton>        

      </Stack>
    </Paper>
  );

}


