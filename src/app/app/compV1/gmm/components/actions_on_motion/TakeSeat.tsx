import { useGeneralKeeperTakeSeat } from "../../../../../../../generated-v1";
import { HexType } from "../../../../common";
import { Paper } from "@mui/material";
import { Chair } from "@mui/icons-material";
import { refreshAfterTx } from "../../../../common/toolsKit";
import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import { ActionsOnMotionProps } from "../ActionsOnMotion";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function TakeSeat({motion, setOpen, refresh}:ActionsOnMotionProps) {

  const { gk, setErrMsg } = useComBooxContext();
  const [ loading, setLoading ] = useState(false);
  
  const updateResults = ()=>{
    refresh();
    setOpen(false);
    setLoading(false);
  }

  const {
    isLoading: takeSeatLoading,
    write: takeSeat,
  } = useGeneralKeeperTakeSeat({
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
    takeSeat({
      args: [ motion.head.seqOfMotion, motion.contents],
    })  
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }} >

      <LoadingButton
        disabled={ !takeSeat || takeSeatLoading}
        loading={loading}
        loadingPosition="end"
        variant="contained"
        endIcon={<Chair />}
        sx={{ m:1, mr:6 }}
        onClick={ handleClick }
      >
        Take Seat
      </LoadingButton>

    </Paper>
  );
}