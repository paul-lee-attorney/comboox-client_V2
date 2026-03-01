import { useState } from "react";

import { 
  useGeneralKeeperCreateMotionToRemoveDirector, 
  useGeneralKeeperNominateDirector, 
} from "../../../../../../../generated-v1";

import { IconButton, Paper, Stack, TextField, Tooltip } from "@mui/material";
import { PersonAdd, PersonRemove } from "@mui/icons-material";
import { CreateMotionProps } from "../../../bmm/components/CreateMotionOfBoardMeeting";
import { HexType, MaxSeqNo, MaxUserNo } from "../../../../common";
import { FormResults, defFormResults, hasError, onlyInt, refreshAfterTx } from "../../../../common/toolsKit";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function CreateMotionForBoardSeats({ refresh }:CreateMotionProps ) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ seqOfPos, setSeqOfPos ] = useState<string>();
  const [ candidate, setCandidate ] = useState<string>();

  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ loading, setLoading ] = useState(false);
  const updateResults = () => {
    refresh();
    setLoading(false);
  }

  const {
    isLoading: addDirectorLoading,
    write: addDirector,
  } = useGeneralKeeperNominateDirector({
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

  const addDirectorClick = ()=>{
    if (seqOfPos && candidate) {
      addDirector({
        args: [
          BigInt(seqOfPos), 
          BigInt(candidate)
        ],
      });
    }
  };

  const [ loadingRemove, setLoadingRemove ] = useState(false);
  const updateResultsRemove = () => {
    refresh();
    setLoadingRemove(false);
  }

  const{
    isLoading: removeDirectorLoading,
    write: removeDirector
  } = useGeneralKeeperCreateMotionToRemoveDirector({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingRemove(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResultsRemove);
    }
  });

  const removeDirectorClick = ()=> {
    if (seqOfPos) {
      removeDirector({
        args: [ BigInt(seqOfPos)],
      });
    }
  };

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction="row" sx={{ alignItems:'start' }} >

        <Tooltip
          title='AddDirector'
          placement="top-start"
          arrow
        >
          <span>
          <IconButton
            disabled={ addDirectorLoading || hasError(valid) || loading}
            sx={{width:20, height:20, m:1}}
            onClick={ addDirectorClick }
            color="primary"
          >
            <PersonAdd />
          </IconButton>
          </span>
        </Tooltip>

        <TextField 
          variant='outlined'
          label='SeqOfPos'
          error={ valid['SeqOfPos']?.error }
          helperText={ valid['SeqOfPos']?.helpTx ?? ' ' }          
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyInt('SeqOfPos', input, MaxSeqNo, setValid);
            setSeqOfPos(input);
          }}
          value={ seqOfPos }
          size='small'
        />

        <TextField 
          variant='outlined'
          label='Candidate'
          error={ valid['Candidate']?.error }
          helperText={ valid['Candidate']?.helpTx ?? ' ' }          
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyInt('Candidate', input, MaxUserNo, setValid);
            setCandidate(input);
          }}
          value={ candidate }
          size='small'
        />

        <Tooltip
          title='RemoveDirector'
          placement="top-end"
          arrow
        >
          <span>
          <IconButton
            disabled={ !removeDirector || removeDirectorLoading || hasError(valid) || loadingRemove}
            sx={{width:20, height:20, m:1}}
            onClick={ removeDirectorClick }
            color="primary"
          >
            <PersonRemove />
          </IconButton>
          </span>
        </Tooltip>

      </Stack>          
    </Paper>
  );
}


