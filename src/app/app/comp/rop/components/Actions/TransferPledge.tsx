import { useState } from "react";
import { useCompKeeperTransferPledge } from "../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { CurrencyExchange } from "@mui/icons-material";
import { ActionsOfPledgeProps } from "../ActionsOfPledge";
import { HexType, MaxData, MaxUserNo } from "../../../../common";
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function TransferPledge({pld, setOpen, refresh}:ActionsOfPledgeProps) {

  const { gk, setErrMsg } = useComBooxContext();
  
  const [ buyer, setBuyer ] = useState<string>('0');
  const [ amt, setAmt ] = useState<string>('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: transferPledgeLoading,
    write: transferPledge,
  } = useCompKeeperTransferPledge({
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
    transferPledge({
      args: [ 
        BigInt(pld.head.seqOfShare), 
        BigInt(pld.head.seqOfPld), 
        BigInt(buyer),
        strNumToBigInt(amt, 4)
      ],
    })
  }

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          label='Buyer'
          error={ valid['Buyer']?.error }
          helperText={ valid['Buyer']?.helpTx ?? ' ' }  
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyInt('Buyer', input, MaxUserNo, setValid);
            setBuyer(input);
          }}
          value={ buyer }
          size='small'
        />

        <TextField 
          variant='outlined'
          label='Amount'
          error={ valid['Amount']?.error }
          helperText={ valid['Amount']?.helpTx ?? ' ' }  
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('Amount', input, MaxData, 4, setValid);
            setAmt(input);
          }}
          value={ amt }
          size='small'
        />

        <LoadingButton 
          disabled={ !transferPledge || transferPledgeLoading || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 168, height: 40 }} 
          variant="contained" 
          endIcon={ <CurrencyExchange /> }
          onClick={ handleClick }
          size='small'
        >
          Transfer
        </LoadingButton>        

      </Stack>
    </Paper>
  );

}


