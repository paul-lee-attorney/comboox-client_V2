
import { Paper, Stack, TextField } from "@mui/material";
import { Payment } from "@mui/icons-material";
import { useCompKeeperPayOffRejectedDeal } from "../../../../../../../../../generated";
import { ActionsOfSwapProps } from "../ActionsOfSwap";
import { AddrZero, booxMap, HexType, keepersMap } from "../../../../../../common";
import { FormResults, HexParser, bigIntToStrNum, defFormResults, onlyHex, refreshAfterTx, strNumToBigInt } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useEffect, useState } from "react";
import { getSwap } from "../../../ia";

import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";
import { AuthSig } from "../../../../../../components/usdc_auth/typedData";
import { usePublicClient, useWalletClient } from "wagmi";
import { verifyAuthorization } from "../../../../../../components/usdc_auth/authVerifier";
import { GenerateAuth } from "../../../../../../components/usdc_auth/GenerateAuth";

export function PayOffSwapUsd({ia, seqOfDeal, seqOfSwap, setOpen, refresh}: ActionsOfSwapProps) {

  const { gk, boox, setErrMsg } = useComBooxContext();

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const update = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const [ auth, setAuth ] = useState<AuthSig | undefined>();
  const [ escrow, setEscrow ] = useState(AddrZero);

  useEffect(()=>{
    if (boox) {
      setEscrow(boox[booxMap.Cashier]);
    }
  }, [boox]);

  const [ amt, setAmt ] = useState('0');

  useEffect(()=>{
    if (seqOfSwap > 0) {
      getSwap(ia, seqOfDeal, seqOfSwap).then(
        swap => {
          let value = swap.paidOfTarget * BigInt(swap.priceOfDeal) / 100n;
          setAmt( bigIntToStrNum(value, 6));
        }
      )
    }
  }, [ia, seqOfDeal, seqOfSwap]);

  const [ to, setTo ] = useState<HexType>(AddrZero);
  const {
    isLoading: payOffSwapLoading,
    write: payOffSwap,
  } = useCompKeeperPayOffRejectedDeal({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, update);
    }
  });

  const provider = usePublicClient();
  const {data: signer} = useWalletClient();
  
  const handleClick = ()=>{
    if (auth && signer) {
      let acct = signer.account.address;
      verifyAuthorization(provider, acct, auth).then(
        verified => {
          if (verified) {
            payOffSwap({
              args: [
                auth,
                ia,
                BigInt(seqOfDeal),
                BigInt(seqOfSwap),
                to,
              ]
            });
          }
        }
      )
    }
  }

  return (
    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >

      <Stack direction='row' sx={{ alignItems:'start' }} >        

        <TextField
          variant='outlined'
          label='SeqOfSwap'
          sx={{
            m:1,
            minWidth: 218,
          }}
          inputProps={{readOnly: true}}
          value={ seqOfSwap }
          size='small'
        />

        <TextField 
          size="small"
          variant='outlined'
          label='To'
          error={ valid['To']?.error }
          helperText={ valid['To']?.helpTx ?? ' ' }              
          sx={{
            m:1,
            minWidth: 218,
          }}
          value={ to }
          onChange={e => {
            let input = HexParser(e.target.value);
            onlyHex('To', input, 40, setValid);
            setTo(input);
          }}
        />

        <TextField 
          variant='outlined'
          label='Amount (USD)'
          inputProps={{readOnly:true}}
          sx={{
            m:1,
            minWidth: 218,
          }}
          value={ amt }
          size='small'
        />

        <GenerateAuth value={strNumToBigInt(amt,6)} escrowAcct={escrow} setAuth={setAuth} />

        <LoadingButton
          variant="contained"
          disabled={ seqOfSwap == 0 || !auth || payOffSwapLoading || !seqOfSwap }
          loading = {loading}
          loadingPosition="end"
          endIcon={<Payment />}
          sx={{ m:1, height: 40, minWidth:128 }}
          onClick={ handleClick }
        >
          Pay
        </LoadingButton>

      </Stack>

    </Paper>
  );
}