import { useState } from "react";

import { booxMap, HexType } from "../../../../common";

import { cashierABI, useGeneralKeeperDistributeProfits, useGeneralKeeperExecActionOfGm } from "../../../../../../../generated-v1";

import { Divider, FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, Stack, TextField } from "@mui/material";
import { SoupKitchenOutlined } from "@mui/icons-material";
import { FormResults, defFormResults, hasError, onlyNum, refreshAfterTx, stampToUtc, strNumToBigInt, utcToStamp } from "../../../../common/toolsKit";
import { DateTimeField } from "@mui/x-date-pickers";
import { LoadingButton } from "@mui/lab";

import { ActionsOnMotionProps } from "../ActionsOnMotion";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { encodeFunctionData, stringToHex } from "viem";


export function DistributeProfits({ motion, setOpen, refresh }:ActionsOnMotionProps) {

  const { gk, boox, userNo, setErrMsg } = useComBooxContext();

  const [ typeOfCurrency, setTypeOfCurrency ] = useState(0);

  const [ amt, setAmt ] = useState('0');
  const [ expireDate, setExpireDate ] = useState(0);  

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults=()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: distributeEthLoading,
    write: distributeEth
  } = useGeneralKeeperDistributeProfits({
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
    isLoading: distributeUsdLoading,
    write: distributeUsd,
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

  const handleClick = ()=> {

    if (typeOfCurrency == 0) {

      distributeEth({
        args: [
          strNumToBigInt(amt, 9) * 10n ** 9n, 
          BigInt(expireDate), 
          BigInt(motion.head.seqOfMotion)
        ],
      });

    } else {

      if (boox && userNo) {

        const cashier = boox[booxMap.ROI];
        const amtOfUsd = strNumToBigInt(amt, 6);
        const desHash = stringToHex("DistributeUSD", {size: 32});

        const data = encodeFunctionData({
          abi: cashierABI,
          functionName: 'distributeUsd',
          args: [amtOfUsd],
        });

        distributeUsd({
          args: [
            BigInt(motion.votingRule.seqOfRule),
            [cashier],
            [0n],
            [data],
            desHash,
            motion.head.seqOfMotion
          ],
        });
      }

    }

  };

  return (

    <Paper elevation={3} sx={{ m:1, p:1, color:'divider', border:1 }}  >

      <Stack direction="row" sx={{ alignItems:'start' }} >

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
            onlyNum('Amount', input, 0n, 9, setValid);
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

        <Divider orientation="vertical" flexItem sx={{m:1}} />

        <LoadingButton
          disabled={ distributeUsdLoading || distributeEthLoading || hasError(valid)}
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

