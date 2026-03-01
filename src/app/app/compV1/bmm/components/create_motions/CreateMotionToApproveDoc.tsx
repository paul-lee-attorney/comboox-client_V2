import { useState } from "react";
import { HexType, MaxSeqNo, MaxUserNo } from "../../../../common";

import { 
  useGeneralKeeperCreateMotionToApproveDoc, 
} from "../../../../../../../generated-v1";

import { Paper, Stack, TextField } from "@mui/material";
import { EmojiPeople } from "@mui/icons-material";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, onlyInt, refreshAfterTx } from "../../../../common/toolsKit";
import { CreateMotionProps } from "../CreateMotionOfBoardMeeting";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function CreateMotionToApproveDoc({refresh}:CreateMotionProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ doc, setDoc ] = useState<HexType>();
  const [ seqOfVr, setSeqOfVr ] = useState<string>();
  const [ executor, setExecutor ] = useState<string>();

  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: proposeDocLoading,
    write: proposeDoc,
  } = useGeneralKeeperCreateMotionToApproveDoc({
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

  const proposeDocClick = ()=> {
    if ( doc && seqOfVr && executor ) {
      proposeDoc({
        args:[ 
          BigInt(doc), 
          BigInt(seqOfVr), 
          BigInt(executor) 
        ],
      });
    }
  }

  return (

    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >

      <Stack direction="row" sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          label='AddressOfDoc'
          size="small"
          error={ valid['AddressOfDoc']?.error }
          helperText={ valid['AddressOfDoc']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = HexParser(e.target.value);
            onlyHex('AddressOfDoc', input, 40, setValid);
            setDoc(input);
          }}
          value={ doc }
        />

        <TextField 
          variant='outlined'
          label='SeqOfVR'
          size="small"
          error={ valid['SeqOfVR']?.error }
          helperText={ valid['SeqOfVR']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyInt('SeqOfVR', input, MaxSeqNo, setValid);
            setSeqOfVr(input);
          }}
          value={ seqOfVr }
        />

        <TextField 
          variant='outlined'
          label='Executor'
          size="small"
          error={ valid['Executor']?.error }
          helperText={ valid['Executor']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyInt('Executor', input, MaxUserNo, setValid);
            setExecutor(input);
          }}
          value={ executor }
        />

        <LoadingButton
          disabled={ proposeDocLoading || hasError(valid)}
          variant="contained"
          loading={loading}
          loadingPosition="end"
          endIcon={<EmojiPeople />}
          sx={{ m:1, minWidth:218 }}
          onClick={ proposeDocClick }
        >
          Propose
        </LoadingButton>

      </Stack>

    </Paper>

  );


}

