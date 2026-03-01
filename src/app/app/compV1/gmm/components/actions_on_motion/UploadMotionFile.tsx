
import { Paper } from "@mui/material";

import { ActionsOnMotionProps } from "../ActionsOnMotion";
import { getMyUserNo } from "../../../../rc";
import { CheckFilerFunc } from "../../../../components/file_storage/FileUploader";
import MotionUploader from "../../../../components/file_storage/MotionUploader";

export function UploadMotionFile({ motion, setOpen, refresh }:ActionsOnMotionProps) {
  
  const checkProposer:CheckFilerFunc = async (proposer) => {
    if (!proposer) {
      console.log('No Proposer!');
      return false;
    }

    let myNo = await getMyUserNo(proposer.account.address);
    if (!myNo) {
      console.log('UserNo Not Retrieved!');
      return false;
    }
    // console.log('myNo: ', myNo);

    if (myNo == motion.body.proposer) return true;
    else {
      console.log('not proposer');
      return false;
    }
  }

  return (
    <Paper elevation={3} sx={{ m:1, p:1, color:'divider', border:1 }} >
      <MotionUploader motion={motion} checkProposer={checkProposer} />
    </Paper>
  );
}

