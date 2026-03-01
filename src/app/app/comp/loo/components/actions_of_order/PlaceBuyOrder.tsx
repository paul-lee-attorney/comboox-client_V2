
import { useEffect, useState } from "react";

import { Paper, Stack, TextField } from "@mui/material";

import { ShoppingCartOutlined } from "@mui/icons-material";
import { useCompKeeperPlaceBuyOrder } from "../../../../../../../generated";
import { ActionsOfOrderProps } from "../ActionsOfOrder";

import { FormResults, bigIntToStrNum, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../common/toolsKit";

import { AddrZero, booxMap, HexType, MaxData, MaxPrice, MaxSeqNo } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { defaultOffer, InitOffer } from "../../../../compV1/loe/loe";
import { AuthSig } from "../../../../components/usdc_auth/typedData";
import { usePublicClient, useWalletClient } from "wagmi";
import { verifyAuthorization } from "../../../../components/usdc_auth/authVerifier";
import { GenerateAuth } from "../../../../components/usdc_auth/GenerateAuth";

export function PlaceBuyOrder({ classOfShare, refresh }: ActionsOfOrderProps) {
  const { gk, boox, setErrMsg } = useComBooxContext();

  const provider = usePublicClient();
  
  const [ order, setOrder ] = useState<InitOffer>(defaultOffer);
  const [ value, setValue ] = useState(0n);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const [ auth, setAuth ] = useState<AuthSig | undefined>();
  const [ escrow, setEscrow ] = useState(AddrZero);

  useEffect(()=>{
    if (boox) {
      setEscrow(boox[booxMap.Cashier]);
    }
  }, [boox]);

  const {data: signer} = useWalletClient();

  const {
    isLoading: placeBuyOrderLoading,
    write:placeBuyOrder,
  } = useCompKeeperPlaceBuyOrder({
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

    if (auth && signer) {

      let acct = signer.account.address;

      verifyAuthorization(provider, acct, auth).then(
        verified => {

          if (verified) {
            placeBuyOrder({
              args: [
                auth, 
                BigInt(classOfShare),
                strNumToBigInt(order.paid, 4),
                strNumToBigInt(order.price, 4),
                BigInt(order.execHours)
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
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >

      <Stack direction={'row'} sx={{ alignItems:'start'}} >

        <TextField 
          variant='outlined'
          size="small"
          label='ExecHours'
          error={ valid['ExecHours']?.error }
          helperText={ valid['ExecHours']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyInt('ExecHours', input, MaxSeqNo, setValid);
            setOrder( v => ({
              ...v,
              execHours: input,
            }));
          }}
          value={ order.execHours.toString() } 
        />


        <TextField 
          variant='outlined'
          size="small"
          label='Paid'
          error={ valid['Paid']?.error }
          helperText={ valid['Paid']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyNum('Paid', input, MaxData, 4, setValid);
            setOrder( v => ({
              ...v,
              paid: input,
            }));
            setValue(strNumToBigInt(input, 4) * strNumToBigInt(order.price, 4) / 100n);
          }}

          value={ order.paid.toString() } 
        />

        <TextField 
          variant='outlined'
          size="small"
          label='Price'
          error={ valid['Price']?.error }
          helperText={ valid['Price']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyNum('Price', input, MaxPrice, 4, setValid);
            setOrder( v => ({
              ...v,
              price: input,
            }));
            setValue(strNumToBigInt(input, 4) * strNumToBigInt(order.paid, 4) / 100n);
          }}

          value={ order.price.toString() } 
        />

        <TextField 
          variant='outlined'
          label='Consideration (USD)'
          inputProps={{readOnly: true}}
          size="small"
          sx={{
            m:1,
            mx:2,
            minWidth: 288,
          }}
          value={ bigIntToStrNum(value, 6) }
        />

        <GenerateAuth value={value} escrowAcct={escrow} setAuth={setAuth} />         

        <LoadingButton 
          disabled = { !auth || !value || placeBuyOrderLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m:1, mx:2, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<ShoppingCartOutlined />}
          onClick={ handleClick }
          size='small'
        >
          Buy
        </LoadingButton>

      </Stack>
      
    </Paper>

  );  

}