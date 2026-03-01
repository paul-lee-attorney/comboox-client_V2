
import { useCompKeeperTakePosition } from "../../../../../../../generated";

import { Paper } from "@mui/material";
import { Chair } from "@mui/icons-material";
import { refreshAfterTx } from "../../../../common/toolsKit";
import { HexType } from "../../../../common";
import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import { ActionsOnMotionProps } from "../../../gmm/components/ActionsOnMotion";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function TakePosition({motion, setOpen, refresh}:ActionsOnMotionProps) {

  const { gk, setErrMsg } = useComBooxContext();
  const [ loading, setLoading ] = useState(false);
  
  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: takePositionLoading,
    write: takePosition,
  } = useCompKeeperTakePosition({
    address: gk,
    args: [motion.head.seqOfMotion, motion.contents],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }} >

      <LoadingButton
        disabled={ !takePosition || takePositionLoading}
        loading={loading}
        loadingPosition="end"
        variant="contained"
        endIcon={<Chair />}
        sx={{ m:1, mr:6 }}
        onClick={()=>takePosition?.()}
      >
        Take Position
      </LoadingButton>

    </Paper>
  );
}