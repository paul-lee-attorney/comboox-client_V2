
import { BallotsList } from "./BallotsList";
import { HexType } from "../../../common";
import { VoteCase, defaultVoteCase, getVoteResult } from "../meetingMinutes";
import { useEffect, useState } from "react";
import { Grid } from "@mui/material";

interface VoteResultProps {
  addr: HexType;
  seqOfMotion: bigint;
}

export function VoteResult({ addr, seqOfMotion }: VoteResultProps) {

  const [ voteResult, setVoteResult ] = useState<VoteCase[]>([
      defaultVoteCase, 
      defaultVoteCase, 
      defaultVoteCase, 
      defaultVoteCase
  ]);

  useEffect(()=>{
    getVoteResult(addr, seqOfMotion).then(
      res => setVoteResult(res)
    );
  })

  return (
    <Grid container direction='row' spacing={2} >
      <Grid item xs={4}>
        <BallotsList 
          addr={addr} 
          seqOfMotion={seqOfMotion}
          attitude={ 1 } 
          allVote={voteResult[0]} 
          voteCase={voteResult[1]} 
        />
      </Grid>
      <Grid item xs={4}>
        <BallotsList 
          addr={addr} 
          seqOfMotion={seqOfMotion}
          attitude ={ 3 } 
          allVote={voteResult[0]} 
          voteCase={voteResult[3]} 
        />
      </Grid>
      <Grid item xs={4}>
        <BallotsList 
          addr={addr} 
          seqOfMotion={seqOfMotion}
          attitude = { 2 } 
          allVote={voteResult[0]} 
          voteCase={voteResult[2]} 
        />
      </Grid>
    </Grid>
  )
}