import { Paper, Stack } from "@mui/material";
import { defaultDeal } from "../../../ia";
import { useCompKeeperTransferTargetShare } from "../../../../../../../../../generated";
import { ActionsOfDealProps } from "../ActionsOfDeal";
import { CurrencyExchange } from "@mui/icons-material";
import { HexType } from "../../../../../../common";
import { refreshAfterTx } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";


export function TransferShare({ addr, deal, setOpen, setDeal, refresh}: ActionsOfDealProps ) {
  const { gk, setErrMsg } = useComBooxContext();

  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    setDeal(defaultDeal);
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: transferTargetShareLoading,
    write: transferTargetShare
  } = useCompKeeperTransferTargetShare({
    address: gk,
    args: [addr, BigInt(deal.head.seqOfDeal)],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true)
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  return (

    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >
      <Stack direction={'row'} sx={{ alignItems:'center'}} >

        <LoadingButton 
          disabled = { transferTargetShareLoading || deal.body.state > 2}
          loading = {loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<CurrencyExchange />}
          onClick={()=> transferTargetShare?.()}
          size='small'
        >
          Transfer
        </LoadingButton>

      </Stack>

    </Paper>

  );  


}