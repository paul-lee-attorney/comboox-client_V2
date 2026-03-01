import { useState } from "react";

import { HexType, MaxSeqNo, MaxUserNo } from "../../../../common";
import { useCompKeeperProposeDocOfGm } from "../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { EmojiPeople } from "@mui/icons-material";
import { FormResults, HexParser, defFormResults, hasError, onlyInt, refreshAfterTx } from "../../../../common/toolsKit";
import { CreateMotionProps } from "../../../bmm/components/CreateMotionOfBoardMeeting";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function CreateMotionForDoc({refresh}:CreateMotionProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ doc, setDoc ] = useState<HexType>();
  const [ seqOfVr, setSeqOfVr ] = useState<string>();
  const [ executor, setExecutor ] = useState<string>();

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    refresh();
    setLoading(false);
  }

  const {
    isLoading: proposeDocOfGmLoading,
    write: proposeDocOfGm,
  } = useCompKeeperProposeDocOfGm({
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

  const handleClick = () => {
    if ( doc && seqOfVr && executor) {
      proposeDocOfGm({
        args: [ 
          BigInt(doc), 
          BigInt(seqOfVr), 
          BigInt(executor) 
        ],
      });
    }
  };

  return (

    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >

      <Stack direction="row" sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          label='AddressOfDoc'
          size="small"
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => setDoc(HexParser( e.target.value ))}
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
          disabled={ !proposeDocOfGm || proposeDocOfGmLoading || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          variant="contained"
          endIcon={<EmojiPeople />}
          sx={{ m:1, minWidth:218 }}
          onClick={ handleClick }
        >
          Propose
        </LoadingButton>

      </Stack>

    </Paper>

  );


}

