
import { useEffect, useState } from "react";

import { Paper, Stack, TextField } from "@mui/material";

import { ShoppingCartOutlined } from "@mui/icons-material";
import { useUsdKeeperPlaceMarketBuyOrder } from "../../../../../../../generated-v1";
import { ActionsOfOrderProps } from "../ActionsOfOrder";

import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../common/toolsKit";

import { AddrZero, booxMap, HexType, keepersMap, MaxData, MaxPrice, MaxSeqNo } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { defaultOffer, InitOffer } from "../../../loe/loe";
import { AuthSig } from "../../../../components/usdc_auth/typedData";
import { usePublicClient, useWalletClient } from "wagmi";
import { verifyAuthorization } from "../../../../components/usdc_auth/authVerifier";
import { GenerateAuth } from "../../../../components/usdc_auth/GenerateAuth";

export function PlaceMarketBuyOrder({ classOfShare, refresh }: ActionsOfOrderProps) {
  const { keepers, boox, setErrMsg } = useComBooxContext();

  const [ order, setOrder ] = useState<InitOffer>(defaultOffer);
  const [ value, setValue ] = useState('0');

  // let value = strNumToBigInt(order.paid, 4) * strNumToBigInt(order.price, 4) / 100n;

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
      setEscrow(boox[booxMap.ROI]);
    }
  }, [boox]);

  const provider = usePublicClient();
  const {data: signer} = useWalletClient();

  const {
    isLoading: placeMarketBuyOrderLoading,
    write:placeMarketBuyOrder,
  } = useUsdKeeperPlaceMarketBuyOrder({
    address: keepers && keepers[keepersMap.UsdKeeper],
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
            placeMarketBuyOrder({
              args: [
                auth, 
                BigInt(classOfShare),
                strNumToBigInt(order.paid, 4),
                strNumToBigInt(order.execHours, 0)
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
          }}

          value={ order.paid.toString() } 
        />

        <TextField 
          variant='outlined'
          label='Consideration (USD)'
          size="small"
          error={ valid['Value']?.error }
          helperText={ valid['Value']?.helpTx ?? ' ' }
          sx={{
            m:1,
            mx:2,
            minWidth: 288,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyNum('Value', input, 0n, 6, setValid);
            setValue(input);
          }}

          value={ value }
        />

        <GenerateAuth value={ strNumToBigInt(value, 6) } escrowAcct={escrow} setAuth={setAuth} />         

        <LoadingButton 
          disabled = { !auth || value == '0' || placeMarketBuyOrderLoading || hasError(valid) }
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