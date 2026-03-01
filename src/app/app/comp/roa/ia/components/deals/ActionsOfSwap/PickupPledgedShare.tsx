import { Paper, Stack, TextField } from "@mui/material";
import { LockOpen } from "@mui/icons-material";
import { useCompKeeperPickupPledgedShare } from "../../../../../../../../../generated";
import { ActionsOfSwapProps } from "../ActionsOfSwap";
import { HexType } from "../../../../../../common";
import { refreshAfterTx } from "../../../../../../common/toolsKit";
import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

export function PickUpPledgedShare({ia, seqOfDeal, seqOfSwap, setOpen, refresh}: ActionsOfSwapProps) {

  const { gk, setErrMsg } = useComBooxContext();
  const [ loading, setLoading ] = useState(false);

  const update = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: pickupPledgedShareLoading,
    write: pickupPledgedShare,
  } = useCompKeeperPickupPledgedShare({
    address: gk,
    args: [ia, BigInt(seqOfDeal), BigInt(seqOfSwap)],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, update);
    }
  });

  return (
    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >
      <Stack direction='row' sx={{ alignItems:'start'  }}>

        <TextField 
          variant='outlined'
          label='seqOfSwap'
          sx={{
            m:1,
            minWidth: 218,
          }}
          inputProps={{readOnly: true}}
          value={ seqOfSwap }
          size='small'
        />

        <LoadingButton
          variant="contained"
          disabled={ seqOfSwap == 0 || pickupPledgedShareLoading || !seqOfSwap }
          loading = {loading}
          loadingPosition="end"
          endIcon={<LockOpen />}
          sx={{ m:1, height: 40, minWidth:128 }}
          onClick={ ()=>pickupPledgedShare?.() }
        >
          Pickup 
        </LoadingButton>
      
      </Stack>

    </Paper>
  );
}