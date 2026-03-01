
import { FormControl, FormHelperText, InputLabel, MenuItem, 
  Select, Stack, TextField } from "@mui/material";

import { 
  useCompKeeperCastVoteOfGm,
} from "../../../../../../../generated";

import { Bytes32Zero, HexType, booxMap } from "../../../../common";
import { HowToVote } from "@mui/icons-material";
import { Dispatch, SetStateAction, useState } from "react";
import { VoteResult } from "../VoteResult";
import { VoteCase, getVoteResult } from "../../meetingMinutes";
import { FormResults, HexParser, defFormResults, hasError, 
  onlyHex, refreshAfterTx } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

interface VoteForDocOfGMProps {
  seqOfMotion: bigint;
  setNextStep: Dispatch<SetStateAction<number>>;
}

export function VoteForDocOfGm( { seqOfMotion }: VoteForDocOfGMProps ) {

  const [ voteResult, setVoteResult ] = useState<VoteCase[]>();
  const { gk, boox, setErrMsg } = useComBooxContext();

  const [ attitude, setAttitude ] = useState<string>('1');
  const [ sigHash, setSigHash ] = useState<HexType>(Bytes32Zero);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    setLoading(false);
    if (boox)
      getVoteResult(boox[booxMap.GMM], seqOfMotion).then(
        list => setVoteResult(list)
      );
  }

  const {
    isLoading: castVoteLoading,
    write: castVote,
  } = useCompKeeperCastVoteOfGm({
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
    castVote({
      args: [ 
        seqOfMotion, 
        BigInt(attitude), 
        sigHash 
      ],
    });
  };

  return (
    <Stack direction='column' sx={{m:1, p:1, justifyContent:'center'}} >

      <Stack direction={'row'} sx={{m:1, p:1, alignItems:'start'}}>

        <FormControl variant="outlined" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="attitude-lable">Attitude</InputLabel>
          <Select
            labelId="attitude-lable"
            id="attitude-select"
            value={ attitude }
            onChange={(e) => setAttitude(e.target.value)}
            size="small"
            label="Attitude"
          >
            <MenuItem value={'1'}>Support</MenuItem>
            <MenuItem value={'2'}>Against</MenuItem>
            <MenuItem value={'3'}>Abstain</MenuItem>
          </Select>
          <FormHelperText>{' '}</FormHelperText>
        </FormControl>

        <TextField 
          sx={{ m: 1, minWidth: 650 }} 
          id="tfHashOfAction" 
          label="SigHash / CID in IPFS" 
          variant="outlined"
          error={ valid['SigHash']?.error }
          helperText={ valid['SigHash']?.helpTx ?? ' ' }

          onChange={e => {
            let input = HexParser( e.target.value );
            onlyHex('SigHash', input, 64, setValid);
            setSigHash(input);
          }}
          value = { sigHash }
          size='small'
        />                                            

        <LoadingButton
          disabled={ castVoteLoading || hasError(valid)} 
          loading={loading}
          loadingPosition="end"
          variant="contained"
          endIcon={<HowToVote />}
          sx={{ m:1, height:40, minWidth:128 }}
          onClick={ handleClick }
        >
          Cast Vote
        </LoadingButton>

      </Stack>

      {voteResult && boox && (
        <VoteResult addr={boox[booxMap.GMM]} seqOfMotion={seqOfMotion} />
      )}

    </Stack>
  )

}