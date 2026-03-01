import { useState } from "react";
import { Paper, Stack, TextField } from "@mui/material";
import { PanToolOutlined } from "@mui/icons-material";
import { useCompKeeperRequestToBuy } from "../../../../../../../../../generated";
import { ActionsOfDealProps } from "../ActionsOfDeal";
import { HexType, MaxData, MaxPrice } from "../../../../../../common";
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";


export function RequestToBuy({addr, deal, setOpen, refresh}:ActionsOfDealProps) {

  const { gk, setErrMsg } = useComBooxContext();

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
    isLoading: requestToBuyLoading,
    write: requestToBuy,
  } = useCompKeeperRequestToBuy({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true)
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  const handleClick = ()=> {
    requestToBuy({
      args: [ 
          addr,
          BigInt(deal.head.seqOfDeal), 
          strNumToBigInt(paidOfTarget, 4), 
          BigInt(seqOfPledge)
      ],
    });
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
            label='PaidOfTarget'
            size="small"
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
          />

          <TextField 
            variant='outlined'
            label='SeqOfPledge'
            size="small"
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
          />

          <LoadingButton 
            disabled = { requestToBuyLoading || hasError(valid)}
            loading = {loading}
            loadingPosition="end"
            sx={{ m: 1, minWidth: 218, height: 40 }} 
            variant="contained" 
            endIcon={<PanToolOutlined />}
            onClick={ handleClick }
            size='small'
          >
            Request To Buy
          </LoadingButton>

        </Stack>

    </Paper>

  );
  
}