import { useState } from "react";

import { HexType } from "../../../../common";

import { useCompKeeperTransferFund } from "../../../../../../../generated";

import { Divider, FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, Stack, TextField } from "@mui/material";
import { PaymentOutlined } from "@mui/icons-material";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, onlyNum, refreshAfterTx, stampToUtc, strNumToBigInt, utcToStamp } from "../../../../common/toolsKit";
import { DateTimeField } from "@mui/x-date-pickers";
import { LoadingButton } from "@mui/lab";

import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { ActionsOnMotionProps } from "../../../gmm/components/ActionsOnMotion";
import { ParasOfTransfer, defaultParasOfTransfer } from "../../../gmm/components/create_motions/ProposeToTransferFund";


export function TransferFund({ motion, setOpen, refresh }:ActionsOnMotionProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ paras, setParas ] = useState<ParasOfTransfer>(defaultParasOfTransfer);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults=()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: transferFundLoading,
    write: transferFund
  } = useCompKeeperTransferFund({
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
    transferFund({
      args: [
        true, 
        paras.to, 
        paras.isCBP, 
        strNumToBigInt(paras.amt, 9) * 10n ** 9n, 
        BigInt(paras.expireDate), 
        motion.head.seqOfMotion
      ],
    });
  };

  return (

    <Paper elevation={3} sx={{ m:1, p:1, color:'divider', border:1 }}  >

      <Stack direction="row" sx={{ alignItems:'center' }} >

        <Stack direction="column" >

          <Stack direction="row" sx={{ alignItems:'center' }} >

            <FormControl variant="outlined" size="small" sx={{ m: 1, width: 101 }}>
              <InputLabel id="symbolOfToken-label">Token</InputLabel>
              <Select
                labelId="symbolOfToken-label"
                id="symbolOfToken-select"
                label="Token"
                value={ paras.isCBP ? '1' : '0' }
                onChange={(e) => setParas( v => ({
                  ...v,
                  isCBP: e.target.value == '1',
                }))}
              >
                  <MenuItem value={ '0' } > <b>{'ETH'}</b> </MenuItem>
                  <MenuItem value={ '1' } > <b>{'CBP'}</b> </MenuItem>
              </Select>
              <FormHelperText>{' '}</FormHelperText>
            </FormControl>

            <TextField 
              variant='outlined'
              label='To'
              size="small"
              error={ valid['To']?.error }
              helperText={ valid['To']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 452,
              }}
              onChange={(e) => {
                let input = HexParser( e.target.value );
                onlyHex('To', input, 40, setValid);
                setParas( v => ({
                  ...v,
                  to: input,
                }));
              }}

              value={ paras.to }
            />

          </Stack>

          <Stack direction="row" sx={{ alignItems:'center' }} >

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
                setParas(v => ({
                  ...v,
                  amt: input,
                }));
              }}
              value={ paras.amt.toString() }
            />

            <DateTimeField
              label='ExpireDate'
              size='small'
              sx={{
                m:1,
                minWidth: 218,
              }}
              helperText=' '
              value={ stampToUtc(paras.expireDate) }
              onChange={(date) => setParas((v) => ({
                ...v,
                expireDate: utcToStamp(date),
              }))}
              format='YYYY-MM-DD HH:mm:ss'
            />

          </Stack>

        </Stack>

        <Divider orientation="vertical" flexItem sx={{m:1}} />

        <LoadingButton
          disabled={ transferFundLoading || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          variant="contained"
          endIcon={<PaymentOutlined />}
          sx={{ m:1, minWidth:128 }}
          onClick={ handleClick }
        >
          Transfer
        </LoadingButton>

      </Stack>

    </Paper>

  );


}

