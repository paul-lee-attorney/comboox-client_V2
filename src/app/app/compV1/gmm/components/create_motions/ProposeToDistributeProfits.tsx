import { useState } from "react";

import { booxMap, HexType, MaxSeqNo, MaxUserNo } from "../../../../common";

import { cashierABI, useGeneralKeeperCreateActionOfGm, useGeneralKeeperProposeToDistributeProfits } from "../../../../../../../generated-v1";

import { Divider, FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, Stack, TextField } from "@mui/material";
import { EmojiPeople } from "@mui/icons-material";
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, stampToUtc, strNumToBigInt, utcToStamp } from "../../../../common/toolsKit";
import { DateTimeField } from "@mui/x-date-pickers";
import { CreateMotionProps } from "../../../bmm/components/CreateMotionOfBoardMeeting";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { encodeFunctionData, stringToHex } from "viem";

export function ProposeToDistributeProfits({ refresh }:CreateMotionProps) {

  const { gk, boox, setErrMsg } = useComBooxContext();

  const [ typeOfCurrency, setTypeOfCurrency ] = useState(0);

  const [ amt, setAmt ] = useState('0');
  const [ expireDate, setExpireDate ] = useState(0);  
  const [ seqOfVR, setSeqOfVR ] = useState<string>('9');
  const [ executor, setExecutor ] = useState<string>('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults=()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: proposeToDistributeEthLoading,
    write: proposeToDistributeEth
  } = useGeneralKeeperProposeToDistributeProfits({
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
    isLoading: proposeToDistributeUsdLoading,
    write: proposeToDistributeUsd
  } = useGeneralKeeperCreateActionOfGm({
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

    if (typeOfCurrency == 0) {
      
      proposeToDistributeEth({
        args: [
          strNumToBigInt(amt, 9) * 10n ** 9n, 
          BigInt(expireDate), 
          BigInt(seqOfVR), 
          BigInt(executor)
        ],
      });

    } else {

      if (boox) {

        const cashier = boox[booxMap.ROI];
        const amtOfUsd = strNumToBigInt(amt, 6);
        const desHash = stringToHex("DistributeUSD", {size: 32});

        const data = encodeFunctionData({
          abi: cashierABI,
          functionName: 'distributeUsd',
          args: [amtOfUsd],
        });
          
        proposeToDistributeUsd({
          args: [
            BigInt(seqOfVR),
            [cashier],
            [0n],
            [data],
            desHash,
            BigInt(executor)
          ],
        });

      }
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

            <FormControl variant="outlined" size="small" sx={{ m: 1, width: 101 }}>
              <InputLabel id="symbolOfToken-label">Token</InputLabel>
              <Select
                labelId="symbolOfToken-label"
                id="symbolOfToken-select"
                label="Token"
                value={ typeOfCurrency }
                onChange={(e) => setTypeOfCurrency(Number(e.target.value))}
              >
                <MenuItem key={0} value={0} ><b>ETH</b></MenuItem>
                <MenuItem key={1} value={1} ><b>USD</b></MenuItem>
              </Select>
              <FormHelperText>{' '}</FormHelperText>
            </FormControl>

            <TextField 
              variant='outlined'
              label= {typeOfCurrency == 0 ? 'Amount (ETH)' : 'Amount (USDC)'}
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

            {typeOfCurrency == 0 && (
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
            )}

        <Divider orientation="vertical" flexItem sx={{m:1}} />

        <LoadingButton
          disabled={ proposeToDistributeUsdLoading || proposeToDistributeEthLoading || hasError(valid)}
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

