import { useCompKeeperPayOffSwap } from "../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { Payment } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { AddrZero, HexType, booxMap, keepersMap } from "../../../../common";
import { FormResults, HexParser, bigIntToStrNum, defFormResults, hasError, onlyHex, refreshAfterTx, strNumToBigInt } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { getSwap } from "../../roo";
import { ActionsOfSwapProps } from "../ActionsOfSwap";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { AuthSig } from "../../../../components/usdc_auth/typedData";
import { usePublicClient, useWalletClient } from "wagmi";
import { verifyAuthorization } from "../../../../components/usdc_auth/authVerifier";
import { GenerateAuth } from "../../../../components/usdc_auth/GenerateAuth";

export function PayOffSwapUsd({seqOfOpt, seqOfSwap, setOpen, refresh}:ActionsOfSwapProps) {

  const { gk, boox, setErrMsg } = useComBooxContext();

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);


  const updateResults = ()=>{
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
    if (boox) {
      getSwap(boox[booxMap.ROO], seqOfOpt, seqOfSwap).then(
        swap => {
          let value = swap.paidOfTarget * BigInt(swap.priceOfDeal) / 100n;
          setAmt(bigIntToStrNum(value,6));
        }
      )
    }
  }, [boox, seqOfOpt, seqOfSwap]);

  const [ to, setTo ] = useState<HexType>(AddrZero);
  
  const {
    isLoading: payOffSwapUsdLoading,
    write: payOffSwapUsd,
  } = useCompKeeperPayOffSwap({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  })

  const provider = usePublicClient();
  const {data: signer} = useWalletClient();
  
  const handleClick = ()=>{
    if (auth && signer) {
      let acct = signer.account.address;
      verifyAuthorization(provider, acct, auth).then(
        verified => {
          if (verified) {
            payOffSwapUsd({
              args: [ 
                auth,
                BigInt(seqOfOpt), 
                BigInt(seqOfSwap),
                to,
              ]
            });
          }
        }
      );
    }
  }

  return(
    <Paper elevation={3} sx={{alignItems:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

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
          disabled={ seqOfSwap == 0 || !auth || payOffSwapUsdLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 88, height: 40 }} 
          variant="contained" 
          endIcon={ <Payment /> }
          onClick={ handleClick }
          size='small'
        >
          Pay
        </LoadingButton>

      </Stack>
    </Paper>
    
  );

}

