import { useEffect, useState } from "react";
import { Divider, Paper, Stack, Toolbar } from "@mui/material";

import { HexType } from "../../../../common";

import { defaultTerms, getRules, getTerm, getTitles } from "../sha";

import { AntiDilution } from "./terms/AntiDilution/AntiDilution";
import { LockUp } from "./terms/LockUp/LockUp";
import { Options } from "./terms/Options/Options";
import { Alongs } from "./terms/Alongs/Alongs";

import { SetGovernanceRule } from "./rules/GovernanceRules/SetGovernanceRule";
import { VotingRules } from "./rules/VotingRules/VotingRules";
import { PositionAllocateRules } from "./rules/PositionAllocationRules/PositionAllocateRules";
import { FirstRefusalRules } from "./rules/FirstRefusalRules/FirstRefusalRules";
import { GroupUpdateOrders } from "./rules/GroupingRules/GroupUpdateOrders";
import { ListingRules } from "./rules/ListingRules/ListingRules";

export async function groupingRules(bigRules: readonly bigint[]): Promise<number[][]>{

  let arrRules = bigRules.map(v => Number(v));
  let rules:number[][] = Array.from(Array(6), ()=>new Array<number>());

  arrRules.forEach( v => {
      if (v == 0) rules[0].push(v);
      else if (v < 256) rules[1].push(v);
      else if (v < 512) rules[2].push(v);
      else if (v < 768) rules[3].push(v);
      else if (v < 1024) rules[4].push(v);
      else if (v < 1280) rules[5].push(v);
  })

  return rules;
}

interface ShaBodyTermsProps {
  sha: HexType;
  finalized: boolean;
}

export function ShaBodyTerms({sha, finalized}: ShaBodyTermsProps) {

  const [ grLs, setGrLs ] = useState<number[]>();
  const [ vrLs, setVrLs ] = useState<number[]>();
  const [ prLs, setPrLs ] = useState<number[]>();
  const [ frLs, setFrLs ] = useState<number[]>();
  const [ guoLs, setGuoLs ] = useState<number[]>();
  const [ lrLs, setLrLs ] = useState<number[]>();

  const [ time, setTime ] = useState<number>(0);

  const refresh = () => {
    setTime(Date.now());
  }

  useEffect(()=>{
    getRules(sha).then(
      res => groupingRules(res).then(
        rules => {
          setGrLs(rules[0]);
          setVrLs(rules[1]);
          setPrLs(rules[2]);
          setFrLs(rules[3]);
          setGuoLs(rules[4]);
          setLrLs(rules[5]);
        }
      )
    )
  }, [sha, time]);

  const [ terms, setTerms ] = useState<HexType[]>(defaultTerms);

  useEffect(()=>{
    getTitles(sha).then(
      res => {
        let titles = res.map(v=>Number(v));
        titles.forEach(async v => {
          let term = await getTerm(sha, v);
          setTerms(k => {
            let out = [...k];
            out[v-1] = term;
            return out;
          })
        })
      }
    )
  }, [sha, time]);

  return (
    <Stack direction={'row'} justifyContent='center' >

      <Stack direction="column"  >
        <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider' }} >
          <Toolbar sx={{ textDecoration:'underline' }} >
            <h4>Rules</h4>
          </Toolbar>

          <Divider />

          <Stack direction="row" sx={{m:1, p:1, alignItems:'center'}}>
            <SetGovernanceRule sha={ sha } seq={ 0 } isFinalized={ finalized } time={time} refresh={ refresh } />
            <VotingRules sha={ sha } initSeqList={ vrLs } isFinalized={ finalized } time={time} refresh={ refresh } />
          </Stack>
          <Stack direction="row" sx={{m:1, p:1, alignItems:'center'}}>
            <PositionAllocateRules sha={ sha } initSeqList={ prLs } isFinalized={ finalized } time={time} refresh={ refresh } />
            <FirstRefusalRules sha={ sha } initSeqList={ frLs } isFinalized={ finalized } time={time} refresh={ refresh } />
          </Stack>
          <Stack direction="row" sx={{m:1, p:1, alignItems:'center'}}>
            {(!finalized || (finalized && guoLs)) && (<GroupUpdateOrders sha={ sha } initSeqList={ guoLs } isFinalized={finalized} time={time} refresh={ refresh } />)}
            <ListingRules sha={ sha } initSeqList={ lrLs } isFinalized={ finalized } time={time} refresh={ refresh } />
          </Stack>

        </Paper>
      </Stack>

      <Stack direction="column" >
        <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider' }} >

          <Toolbar sx={{ textDecoration:'underline' }}>
            <h4>Terms</h4>
          </Toolbar>

          <Divider />

          <Stack direction="row" sx={{m:1, p:1, alignItems:'center'}}>
            <AntiDilution sha={ sha } term={ terms[0] } setTerms={ setTerms } isFinalized={finalized} />
            <LockUp sha={ sha } term={ terms[1] } setTerms={ setTerms } isFinalized={finalized} />
          </Stack>
          <Stack direction="row" sx={{m:1, p:1, alignItems:'center'}}>          
            <Alongs sha={ sha } term={ terms[2] } setTerms={ setTerms } isFinalized={finalized} seqOfTitle={3} />
            <Alongs sha={ sha } term={ terms[3] } setTerms={ setTerms } isFinalized={finalized} seqOfTitle={4} />
          </Stack>
          <Stack direction="row" sx={{m:1, p:1, alignItems:'center'}}>                      
            <Options sha={ sha } term={ terms[4] } setTerms={ setTerms } isFinalized={finalized} />
          </Stack>

        </Paper>
      </Stack>

    </Stack>    
  );
} 