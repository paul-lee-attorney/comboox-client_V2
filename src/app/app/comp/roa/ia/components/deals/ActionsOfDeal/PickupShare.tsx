import { Paper, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { defaultDeal } from "../../../ia";
import { useCompKeeperCloseDeal } from "../../../../../../../../../generated";
import { ActionsOfDealProps } from "../ActionsOfDeal";
import { LockOpen } from "@mui/icons-material";
import { HexType } from "../../../../../../common";
import { refreshAfterTx } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

export function PickupShare({ addr, deal, setOpen, setDeal, refresh}: ActionsOfDealProps ) {
  const { gk, setErrMsg } = useComBooxContext();

  const [ hashKey, setHashKey ] = useState<string>('Input your key string here');
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    setDeal(defaultDeal);
    refresh();
    setLoading(false);
    setOpen(false);    
  }

  const {
    isLoading: closeDealLoading,
    write: closeDeal
  } = useCompKeeperCloseDeal({
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
    closeDeal({
      args: [
        addr, 
        BigInt(deal.head.seqOfDeal), 
        hashKey
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
        <Stack direction={'row'} sx={{ alignItems:'center'}} >

          <TextField 
            variant='outlined'
            label='HashKey'
            size="small"
            sx={{
              m:1,
              minWidth: 680,
            }}
            value={ hashKey }
            onChange={(e)=>setHashKey(e.target.value)}
          />

          <LoadingButton 
            disabled = {closeDealLoading || deal.body.state > 2 }
            loading ={loading}
            loadingPosition="end"
            sx={{ m: 1, minWidth: 218, height: 40 }} 
            variant="contained" 
            endIcon={<LockOpen />}
            onClick={ handleClick }
            size='small'
          >
            Pickup Share
          </LoadingButton>

        </Stack>

    </Paper>

  );  


}