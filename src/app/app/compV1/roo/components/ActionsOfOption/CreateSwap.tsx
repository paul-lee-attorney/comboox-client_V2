import { ActionsOfOptionProps } from "../ActionsOfOption";
import { useGeneralKeeperCreateSwap } from "../../../../../../../generated-v1";
import { Button, Paper, Stack, TextField } from "@mui/material";
import { SwapHorizOutlined } from "@mui/icons-material";
import { useState } from "react";
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../common/toolsKit";
import { HexType, MaxData, MaxPrice } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function CreateSwap({seqOfOpt, setOpen, refresh}:ActionsOfOptionProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ seqOfTarget, setSeqOfTarget ] = useState<string>('0');
  const [ paidOfTarget, setPaidOfTarget ] = useState<string>('0');
  const [ seqOfPledge, setSeqOfPledge ] = useState<string>('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: createSwapLoading,
    write: createSwap,
  } = useGeneralKeeperCreateSwap({
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

  const handleClick = ()=>{
    createSwap({
      args: [ 
          BigInt(seqOfOpt), 
          BigInt(seqOfTarget), 
          strNumToBigInt(paidOfTarget, 4), 
          BigInt(seqOfPledge)
      ],
    });
  };

  return(
    <Paper elevation={3} sx={{alignItems:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          label='seqOfTarget'
          error={ valid['SeqOfTarget']?.error }
          helperText={ valid['SeqOfTarget']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyInt('SeqOfTarget', input, MaxPrice, setValid);
            setSeqOfTarget( input );
          }}
          value={ seqOfTarget }
          size='small'
        />

        <TextField 
          variant='outlined'
          label='PaidOfTarget'
          error={ valid['PaidOfTarget']?.error }
          helperText={ valid['PaidOfTarget']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('PaidOfTarget', input, MaxData, 4, setValid);
            setPaidOfTarget(input);
          }}
          value={ paidOfTarget }
          size='small'
        />

        <TextField 
          variant='outlined'
          label='SeqOfPledge'
          error={ valid['SeqOfPledge']?.error }
          helperText={ valid['SeqOfPledge']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyInt('SeqOfPledge', input, MaxPrice, setValid);
            setSeqOfPledge(input);
          }}
          value={ seqOfPledge }
          size='small'
        />

        <LoadingButton 
          disabled={ createSwapLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 168, height: 40 }} 
          variant="contained" 
          endIcon={ <SwapHorizOutlined /> }
          onClick={ handleClick }
          size='small'
        >
          Create Swap
        </LoadingButton>        

      </Stack>
    </Paper>
    
  );

}

