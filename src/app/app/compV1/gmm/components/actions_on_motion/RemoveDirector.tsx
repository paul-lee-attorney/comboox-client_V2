import { useGeneralKeeperRemoveDirector } from "../../../../../../../generated-v1";
import { Paper } from "@mui/material";
import { FollowTheSigns } from "@mui/icons-material";
import { HexType } from "../../../../common";
import { refreshAfterTx } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import { ActionsOnMotionProps } from "../ActionsOnMotion";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function RemoveDirector({motion, setOpen, refresh}:ActionsOnMotionProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setOpen(false);
    setLoading(false);
  }

  const {
    isLoading: removeDirectorLoading,
    write: removeDirector,
  } = useGeneralKeeperRemoveDirector({
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
    removeDirector({
      args: [motion.head.seqOfMotion, motion.contents],
    })
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }} >

      <LoadingButton
        disabled={ !removeDirector || removeDirectorLoading}
        loading={loading}
        loadingPosition="end"
        variant="contained"
        endIcon={<FollowTheSigns />}
        sx={{ m:1, mr:6 }}
        onClick={ handleClick }
      >
        Remove Director
      </LoadingButton>

    </Paper>
  );
}