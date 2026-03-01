
import { useState } from "react";

import { Divider, Paper, Stack, TextField } from "@mui/material";
import { defaultDeal } from "../../../ia";
import { useCompKeeperExecDragAlong } from "../../../../../../../../../generated";
import { ActionsOfDealProps } from "../ActionsOfDeal";
import {  AgricultureOutlined } from "@mui/icons-material";
import { TargetShare, defaultTargetShare } from "./ExecTagAlong";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, 
  onlyInt, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";
import { Bytes32Zero, HexType, MaxData, MaxPrice } from "../../../../../../common";

export function ExecDragAlong({ addr, deal, setOpen, setDeal, refresh}: ActionsOfDealProps ) {
  const { gk, setErrMsg } = useComBooxContext();

  const [ targetShare, setTargetShare ] = useState<TargetShare>(defaultTargetShare);
  const [ sigHash, setSigHash ] = useState<HexType>(Bytes32Zero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);
          
  const updateResults = ()=>{
    setDeal(defaultDeal);
    refresh();
    setLoading(false);
    setOpen(false);    
  }

  const {
    isLoading: execDragAlongLoading,
    write: execDragAlong,
  } = useCompKeeperExecDragAlong({
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

  const handleClick = ()=> {
    execDragAlong({
      args: [ 
          addr, 
          BigInt(deal.head.seqOfDeal), 
          BigInt(targetShare.seqOfShare),
          strNumToBigInt(targetShare.paid, 4),
          strNumToBigInt(targetShare.par, 4),
          sigHash
      ],
    });
  };
      
  return (

    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >
        <Stack direction={'row'} sx={{ alignItems:'center'}} >

          <Stack direction="column" >
            <Stack direction="row" sx={{ alignItems:'center' }} >

              <TextField 
                variant='outlined'
                size="small"
                label='SeqOfTargetShare'
                error={ valid['SeqOfTarget']?.error }
                helperText={ valid['SeqOfTarget']?.helpTx ?? ' ' }
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                onChange={ e => {
                  let input = e.target.value;
                  onlyInt('SeqOfTarget', input, MaxPrice, setValid);
                  setTargetShare(v => ({
                    ...v,
                    seqOfShare: input,
                  }));
                }}
                value={ targetShare.seqOfShare } 
              />

              <TextField 
                variant='outlined'
                size="small"
                label='Paid'
                error={ valid['Paid']?.error }
                helperText={ valid['Paid']?.helpTx ?? ' ' }
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                onChange={ e => {
                  let input = e.target.value;
                  onlyNum('Paid', input, MaxData, 4, setValid);
                  setTargetShare(v => ({
                    ...v,
                    paid: input,
                  }));
                }}
                value={ targetShare.paid } 
              />

              <TextField 
                variant='outlined'
                size="small"
                label='Par'
                error={ valid['Par']?.error }
                helperText={ valid['Par']?.helpTx ?? ' ' }
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                onChange={ e => {
                  let input = e.target.value;
                  onlyNum('Par', input, MaxData, 4, setValid);
                  setTargetShare(v => ({
                    ...v,
                    par: input,
                  }));
                }}
                value={ targetShare.par } 
              />

            </Stack>
            <Stack direction="row" sx={{ alignItems:'center' }} >
              <TextField
                variant='outlined'
                label='SigHash'
                size="small"
                error={ valid['SigHash']?.error }
                helperText={ valid['SigHash']?.helpTx ?? ' ' }
                sx={{
                  m:1,
                  minWidth: 685,
                }}
                value={ sigHash }
                onChange={(e)=>{
                  let input = HexParser( e.target.value );
                  onlyHex('SigHash', input, 64, setValid); 
                  setSigHash(input);
                }}
              />
            </Stack>

          </Stack>

          <Divider orientation="vertical" flexItem />

          <LoadingButton 
            disabled = { execDragAlongLoading || hasError(valid)}
            loading={loading}
            loadingPosition="end"
            sx={{ m: 1, minWidth: 218, height: 40 }} 
            variant="contained" 
            endIcon={<AgricultureOutlined />}
            onClick={ handleClick }
            size='small'
          >
            Drag Along
          </LoadingButton>

        </Stack>

    </Paper>

  );  

}