import { useState } from "react";

import { HexType, MaxPrice, MaxUserNo } from "../../../../common";

import { useCompKeeperDistributeProfits, useCompKeeperDistributeIncome } from "../../../../../../../generated";

import { Divider, FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, Stack, TextField } from "@mui/material";
import { SoupKitchenOutlined } from "@mui/icons-material";
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, stampToUtc, strNumToBigInt, utcToStamp } from "../../../../common/toolsKit";
import { DateTimeField } from "@mui/x-date-pickers";
import { LoadingButton } from "@mui/lab";

import { ActionsOnMotionProps } from "../ActionsOnMotion";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";


export function DistributeUsd({ motion, setOpen, refresh }:ActionsOnMotionProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ isIncome, setIsIncome ] = useState(false);

  const [ amt, setAmt ] = useState('0');
  const [ expireDate, setExpireDate ] = useState(0);  
  const [ seqOfDR, setSeqOfDR ] = useState('1280');  
  const [ manager, setManager ] = useState('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults=()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: distributeProfitsLoading,
    write: distributeProfits,
  } = useCompKeeperDistributeProfits({
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

  const {
    isLoading: distributeIncomeLoading,
    write: distributeIncome,
  } = useCompKeeperDistributeIncome({
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

    if (!isIncome) {

      distributeProfits({
        args: [
          strNumToBigInt(amt, 6), 
          BigInt(expireDate), 
          BigInt(seqOfDR),
          BigInt(motion.head.seqOfMotion),
        ],
      });

    } else {

      distributeIncome({
        args: [
          strNumToBigInt(amt, 6), 
          BigInt(expireDate), 
          BigInt(seqOfDR),
          BigInt(manager),
          BigInt(motion.head.seqOfMotion),
        ],
      });
    }

  };

  return (

    <Paper elevation={3} sx={{ m:1, p:1, color:'divider', border:1 }}  >

      <Stack direction="row" sx={{ alignItems:'start' }} >

        <FormControl variant="outlined" size="small" sx={{ m: 1, width: 101 }}>
          <InputLabel id="symbolOfToken-label">IsIncome ?</InputLabel>
          <Select
            labelId="symbolOfToken-label"
            id="symbolOfToken-select"
            label="Token"
            value={ isIncome ? '1' : '0' }
            onChange={(e) => setIsIncome(e.target.value == '1')}
          >
            <MenuItem key={0} value={0} ><b>Profits</b></MenuItem>
            <MenuItem key={1} value={1} ><b>Income</b></MenuItem>
          </Select>
          <FormHelperText>{' '}</FormHelperText>
        </FormControl>

        <TextField 
          variant='outlined'
          label='Amount'
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
            setAmt( input );
          }}
          value={ amt }
        />

        <DateTimeField
          label='ExpireDate'
          size='small'
          sx={{
            m:1,
            minWidth: 218,
          }}
          helperText=' '
          value={ stampToUtc(expireDate) }
          onChange={(date) => setExpireDate( utcToStamp(date) )}
          format='YYYY-MM-DD HH:mm:ss'
        />

        <TextField 
          variant='outlined'
          label='SeqOfDR'
          size="small"
          error={ valid['SeqOfDR']?.error }
          helperText={ valid['SeqOfDR']?.helpTx ?? ' ' }
          sx={{m:1, minWidth: 218,}}
          onChange={(e) => {
            let input = e.target.value;
            onlyInt('SeqOfDR', input, MaxPrice, setValid);
            setSeqOfDR( input );
          }}

          value={ seqOfDR }
        />

        {isIncome && (
          <TextField 
            variant='outlined'
            label='Manager'
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
              setManager( input );
            }}
            value={ manager }
          />
        )}

        <Divider orientation="vertical" flexItem sx={{m:1}} />

        <LoadingButton
          disabled={ distributeProfitsLoading || distributeIncomeLoading || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          variant="contained"
          endIcon={<SoupKitchenOutlined />}
          sx={{ m:1, minWidth:128 }}
          onClick={ handleClick }
        >
          Distribute
        </LoadingButton>

      </Stack>

    </Paper>

  );


}

