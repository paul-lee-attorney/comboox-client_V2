import { useEffect, useState } from "react";

import { AddrZero, booxMap, HexType, keepersMap, MaxData, } from "../../../../common";

import { Paper, Stack, TextField } from "@mui/material";
import { Payment, } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

import { 
  FormResults, 
  bigIntToStrNum, 
  defFormResults, 
  hasError, 
  longDataParser, 
  onlyNum, 
  refreshAfterTx,
  strNumToBigInt,
} from "../../../../common/toolsKit";
import { ActionsOfCapProps } from "../ActionsOfCap";


import { useUsdKeeperPayInCapital } from "../../../../../../../generated-v1";
import { GenerateAuth } from "../../../../components/usdc_auth/GenerateAuth";
import { usePublicClient, useWalletClient } from "wagmi";
import { AuthSig } from "../../../../components/usdc_auth/typedData";
import { verifyAuthorization } from "../../../../components/usdc_auth/authVerifier";

export function PayInUsd({ share, setDialogOpen, refresh }: ActionsOfCapProps ) {

  const { keepers, boox, setErrMsg } = useComBooxContext();

  const [ auth, setAuth ] = useState<AuthSig | undefined>();
  const [ escrow, setEscrow ] = useState(AddrZero);

  useEffect(()=>{
    if (boox) {
      setEscrow(boox[booxMap.ROI]);
    }
  }, [boox]);

  const [ paid, setPaid ] = useState('0.0');
  const [ value, setValue ] = useState<bigint | undefined>();

  useEffect(()=>{
    let amt = strNumToBigInt(paid, 4);
    if (amt > 0n && share.head.priceOfPaid > 0) {
      let amount = BigInt(share.head.priceOfPaid) * amt / 100n;
      setValue(amount);
    }
  }, [paid, share]);
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setDialogOpen(false);
  }

  const {
    isLoading: payInUsdLoading,
    write: payInUsd,
  } = useUsdKeeperPayInCapital({
    address: keepers && keepers[keepersMap.UsdKeeper],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data){
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
            payInUsd({
              args: [ 
                auth,
                BigInt(share.head.seqOfShare), 
                strNumToBigInt(paid, 4)
              ]
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
      p:1, m:1,
      border: 1, 
      borderColor:'divider' 
      }} 
    >

      <Stack direction={'row'} sx={{ alignItems:'start' }}>

        <TextField 
          variant='outlined'
          label='Paid (USD)'
          error={ valid['Paid']?.error }
          helperText={ valid['Paid']?.helpTx ?? ' ' }    
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('Paid', input, MaxData, 4, setValid);
            setPaid(input);
          }}
          value={ paid }
          size="small"
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
          variant='contained'
          disabled={ !auth || !value || payInUsdLoading || hasError(valid) }
          loading={ loading }
          loadingPosition="end"
          sx={{minWidth: 128, m:1, mx:2 }} 
          onClick={ payInUsdClick }
          color="primary"
          endIcon={< Payment />}
        >
          Pay
        </LoadingButton>

      </Stack>

    </Paper>
  )

}





