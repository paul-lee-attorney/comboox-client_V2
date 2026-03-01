
import { useEffect, useState } from "react";

import { Paper, Stack, TextField } from "@mui/material";
import { defaultDeal } from "../../../ia";
import { useCompKeeperPayOffApprovedDeal } from "../../../../../../../../../generated";
import { ActionsOfDealProps } from "../ActionsOfDeal";
import { Payment } from "@mui/icons-material";
import { FormResults, HexParser, bigIntToStrNum, defFormResults, hasError, longDataParser, onlyHex, refreshAfterTx } from "../../../../../../common/toolsKit";
import { AddrZero, booxMap, HexType, keepersMap } from "../../../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";
import { usePublicClient, useWalletClient } from "wagmi";
import { AuthSig } from "../../../../../../components/usdc_auth/typedData";
import { verifyAuthorization } from "../../../../../../components/usdc_auth/authVerifier";
import { GenerateAuth } from "../../../../../../components/usdc_auth/GenerateAuth";


export function PayOffInUsd({ addr, deal, setOpen, setDeal, refresh}: ActionsOfDealProps ) {
  const { gk, boox, setErrMsg } = useComBooxContext();

  const [ auth, setAuth ] = useState<AuthSig | undefined>();
  const [ escrow, setEscrow ] = useState(AddrZero);

  useEffect(()=>{
    if (boox) {
      setEscrow(boox[booxMap.Cashier]);
    }
  }, [boox]);

  const [ to, setTo ] = useState<HexType>(AddrZero);

  const [ value, setValue ] = useState<bigint | undefined>();

  useEffect(()=>{
    if (deal) {
      let amount = (((BigInt(deal.body.par) - BigInt(deal.body.paid)) * BigInt(deal.head.priceOfPar) + 
        (BigInt(deal.body.paid) * BigInt(deal.head.priceOfPaid))) / 100n);
      setValue(amount);
    }
  }, [deal]);

  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    setDeal(defaultDeal);
    refresh();
    setLoading(false);
    setOpen(false);    
  }

  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const {
    isLoading: payOffInUsdLoading,
    write: payOffInUsd
  } = useCompKeeperPayOffApprovedDeal({
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

  const provider = usePublicClient();
  const {data: signer} = useWalletClient();

  const payInUsdClick = ()=>{

    if (auth && signer) {
      let acct = signer.account.address;
      verifyAuthorization(provider, acct, auth).then(
        verified => {
          if (verified) { 
            payOffInUsd({
              args: [auth, addr, BigInt(deal.head.seqOfDeal), to]
            });
          } else {
            console.log("authorization NOT verified");
          }
        }
      )
    }
  };

  return (

    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >
        <Stack direction={'row'} sx={{ alignItems:'start'}} >

          <TextField 
            size="small"
            variant="outlined"
            label='To'
            error={ valid['To']?.error }
            helperText={ valid['To']?.helpTx ?? ' ' }          
            sx={{
              m:1,
              minWidth: 550,
            }}
            value={ to }
            onChange={e => {
              let input = HexParser(e.target.value ?? '0');
              onlyHex('To(Addr)', input, 40, setValid);
              setTo(input);
            }}
          />

          <TextField 
            variant='outlined'
            label='Value (USD)'
            inputProps={{readOnly: true}}
            sx={{
              m:1,
              mx:2,
              minWidth: 218,
            }}
            value={ longDataParser(bigIntToStrNum((value ?? 0n), 6)) }
            size="small"
          />

        <GenerateAuth value={value} escrowAcct={escrow} setAuth={setAuth} />

        <LoadingButton 
          disabled = { !auth || payOffInUsdLoading || deal.body.state > 2 || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 128, height: 40 }} 
          variant="contained" 
          endIcon={<Payment />}
          onClick={ payInUsdClick }
          size='small'
        >
          Pay Off
        </LoadingButton>

        </Stack>

    </Paper>

  );  


}