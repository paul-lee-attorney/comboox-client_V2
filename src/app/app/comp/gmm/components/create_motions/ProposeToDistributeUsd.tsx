import { useState } from "react";

import { HexType, MaxPrice, MaxSeqNo, MaxUserNo } from "../../../../common";

import {  useCompKeeperProposeToDistributeUsd } from "../../../../../../../generated";

import { Divider, Paper, Stack, TextField } from "@mui/material";
import { EmojiPeople } from "@mui/icons-material";
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, stampToUtc, strNumToBigInt, utcToStamp } from "../../../../common/toolsKit";
import { DateTimeField } from "@mui/x-date-pickers";
import { CreateMotionProps } from "../../../bmm/components/CreateMotionOfBoardMeeting";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function ProposeToDistributeUsd({ refresh }:CreateMotionProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ amt, setAmt ] = useState('0');
  const [ expireDate, setExpireDate ] = useState(0);  
  const [ seqOfVR, setSeqOfVR ] = useState<string>('9');
  const [ seqOfDR, setSeqOfDR ] = useState<string>('1280');
  const [ manager, setManager ] = useState<string>('0');
  const [ executor, setExecutor ] = useState<string>('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults=()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: proposeToDistributeUsdLoading,
    write: proposeToDistributeUsd
  } = useCompKeeperProposeToDistributeUsd({
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
      proposeToDistributeUsd({
        args: [
          strNumToBigInt(amt, 6), 
          BigInt(expireDate), 
          BigInt(seqOfVR),
          BigInt(seqOfDR),
          BigInt(manager),
          BigInt(executor)
        ],
      });
  };


  return (

    <Paper elevation={3} sx={{ m:1, p:1, color:'divider', border:1 }}  >

      <Stack direction="row" sx={{ alignItems:'start' }} >

        <Stack direction="column" >
          <Stack direction="row" sx={{ alignItems:'start' }} >
            <TextField 
              variant='outlined'
              label='SeqOfVR'
              size="small"
              error={ valid['SeqOfVR']?.error }
              helperText={ valid['SeqOfVR']?.helpTx ?? ' ' }
                sx={{
                m:1,
                width: 101,
              }}
              onChange={(e) => {
                let input = e.target.value;
                onlyInt('SeqOfVR', input, MaxSeqNo, setValid);
                setSeqOfVR(input);
              }}
              value={ seqOfVR }
            />

            <TextField 
              variant='outlined'
              label= {'Amount (USDC)'}
              size="small"
              error={ valid['Amount']?.error }
              helperText={ valid['Amount']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 218,
              }}
              onChange={(e) => {
                let input = e.target.value;
                onlyNum('Amount', input, 0n, 6, setValid);
                setAmt(input);
              }}
              value={ amt }
            />

            <TextField 
              variant='outlined'
              label='Executor'
              size="small"
              error={ valid['Executor']?.error }
              helperText={ valid['Executor']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 218,
              }}
              onChange={(e) => {
                let input = e.target.value;
                onlyInt('Executor', input, MaxUserNo, setValid);
                setExecutor(input);
              }}
              value={ executor }
            />

          </Stack>
          <Stack direction="row" sx={{ alignItems:'start' }} >

            <TextField 
              variant='outlined'
              label='SeqOfDR'
              size="small"
              error={ valid['SeqOfDR']?.error }
              helperText={ valid['SeqOfDR']?.helpTx ?? ' ' }
                sx={{
                m:1,
                width: 101,
              }}
              onChange={(e) => {
                let input = e.target.value;
                onlyInt('SeqOfDR', input, MaxSeqNo, setValid);
                setSeqOfDR(input);
              }}
              value={ seqOfDR }
            />

            <DateTimeField
              label='ExpireDate'
              size='small'
              sx={{
                m:1,
                minWidth: 218,
              }}
              helperText=' '
              value={ stampToUtc( expireDate) }
              onChange={(date) => setExpireDate( utcToStamp(date) )}
              format='YYYY-MM-DD HH:mm:ss'
            />

            <TextField 
              variant='outlined'
              label='FundManager'
              size="small"
              error={ valid['Manager']?.error }
              helperText={ valid['Manager']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 218,
              }}
              onChange={(e) => {
                let input = e.target.value;
                onlyInt('Manager', input, MaxUserNo, setValid);
                setManager(input);
              }}
              value={ manager }
            />

          </Stack>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{m:1}} />

        <LoadingButton
          disabled={ proposeToDistributeUsdLoading || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          variant="contained"
          endIcon={<EmojiPeople />}
          sx={{ m:1, minWidth:128 }}
          onClick={ handleClick }
        >
          Propose
        </LoadingButton>

      </Stack>

    </Paper>

  );


}

