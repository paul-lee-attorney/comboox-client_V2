import { useState } from "react";


import { AddrOfTank, Bytes32Zero, HexType, MaxSeqNo } from "../../../../common";

import { useGeneralKeeperExecActionOfGm } from "../../../../../../../generated-v1";

import { Divider,  Paper, Stack, TextField } from "@mui/material";
import { SavingsOutlined } from "@mui/icons-material";
import { FormResults, HexParser, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { ActionsOnMotionProps } from "../ActionsOnMotion";

export function WithdrawCBP({motion, setOpen, refresh}:ActionsOnMotionProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ amt, setAmt ] = useState('0');
  const [ seqOfVR, setSeqOfVR ] = useState<string>('9');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults=()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: withdrawCBPLoading,
    write: withdrawCBP,
  } = useGeneralKeeperExecActionOfGm({
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
    if (seqOfVR && amt) {
      withdrawCBP({
        args: [
          BigInt(seqOfVR), 
          [AddrOfTank],
          [0n],
          [HexParser('0xbbc446ac' + strNumToBigInt(amt, 18).toString(16).padStart(64, '0'))],
          Bytes32Zero, motion.head.seqOfMotion
        ],
      });
    }
  };

  return (

    <Paper elevation={3} sx={{ m:1, p:1, color:'divider', border:1 }}  >

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
              label='Amount (CBP)'
              size="small"
              error={ valid['Amount']?.error }
              helperText={ valid['Amount']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 218,
              }}
              onChange={(e) => {
                let input = e.target.value;
                onlyNum('Amount', input, 0n, 9, setValid);
                setAmt(input);
              }}
              value={ amt }
            />

        <Divider orientation="vertical" flexItem sx={{m:1}} />

        <LoadingButton
          disabled={ withdrawCBPLoading || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          variant="contained"
          endIcon={<SavingsOutlined />}
          sx={{ m:1, minWidth:128 }}
          onClick={ handleClick }
        >
          Withdraw
        </LoadingButton>

      </Stack>

    </Paper>

  );


}

