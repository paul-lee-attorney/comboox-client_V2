
import { Dispatch, SetStateAction, useState } from "react";

import { Paper } from "@mui/material";
import { useCompKeeperVoteCountingOfGm } from "../../../../../../../generated";

import { Calculate } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { isPassed } from "../../meetingMinutes";
import { HexType, booxMap } from "../../../../common";
import { refreshAfterTx } from "../../../../common/toolsKit";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export interface VoteCountingOfGMProps {
  seqOfMotion: bigint;
  setOpen: Dispatch<SetStateAction<boolean>>;
  refresh: ()=>void;
  setResult: (flag:boolean)=>void;
  setNextStep: (i:number)=>void;
}

export function VoteCountingOfGm({ seqOfMotion, setResult, setNextStep, setOpen, refresh }: VoteCountingOfGMProps ) {

  const { gk, boox, setErrMsg } = useComBooxContext();

  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
    if (boox) {
      isPassed(boox[booxMap.GMM], seqOfMotion).then(
        flag => {
          setResult(flag);
          setNextStep(flag ? 6 : 8);
        }
      )
    }
    setOpen(false);
  }

  const {
    isLoading,
    write
  } = useCompKeeperVoteCountingOfGm({
    address: gk,
    args: [ seqOfMotion ],
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

    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }} >

      <LoadingButton
        disabled={ !write || isLoading}
        loading={loading}
        loadingPosition="end"
        variant="contained"
        endIcon={<Calculate />}
        sx={{ m:1, mr:6, width:218 }}
        onClick={()=>write?.()}
      >
        Count
      </LoadingButton>

    </Paper>
  )

}