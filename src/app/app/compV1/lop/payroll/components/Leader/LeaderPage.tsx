
import { Paper, Stack, Typography } from "@mui/material";

import { useEffect, useState } from "react";
import { ActionsOfLeader } from "./ActionsOfLeader";
import { PayrollProps } from "../Owner/OwnerPage";
import { GetMembersList } from "./GetMembersList";
import { TeamSelector } from "./TeamSelector";
import { MemberInfo } from "../Member/MemberInfo";
import { useComBooxContext } from "../../../../../../_providers/ComBooxContextProvider";
import { Member, defaultMember, getProjectInfo, getTeamInfo } from "../../../lop";

export function LeaderPage({ addr }:PayrollProps) {

  const { userNo } = useComBooxContext();

  const [ time, setTime ] = useState(0);

  const refresh = () => {
    setTime(Date.now());
  }

  const [ seqOfTeam, setSeqOfTeam ] = useState<number>(0);

  const [ memberNo, setMemberNo ] = useState<number>(0);

  const [ pm, setPM ] = useState<number>(0);

  useEffect(()=>{
    getProjectInfo(addr).then(
      res => setPM(res.userNo)
    )
  }, [addr, time]);

  const [ teamInfo, setTeamInfo ] = useState<Member>(defaultMember);

  useEffect(()=>{
    if (seqOfTeam > 0) {
      getTeamInfo(addr, seqOfTeam).then(
        res => setTeamInfo(res)
      )
    }
  }, [seqOfTeam, addr])

  return (
    <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider'}} >
      

        <Stack direction='row' sx={{ justifyContent:'start' }} >

          <Typography variant="h5" sx={{ m:2, textDecoration:'underline' }} >
            <b>Team Info: { seqOfTeam }</b>
          </Typography>

          <TeamSelector addr={addr} time={time} seqOfTeam={seqOfTeam} setSeqOfTeam={setSeqOfTeam} acct={0} />
        
        </Stack>

        <MemberInfo addr={addr} time={time} seqOfTeam={seqOfTeam}  acct={0} />
        <GetMembersList addr={addr} time={time} seqOfTeam={seqOfTeam} setSeq={setMemberNo} acct={0} />

        <ActionsOfLeader addr={ addr } seqOfTeam={ seqOfTeam } memberNo={ memberNo } refresh={ refresh } />

    </Paper>
  );
} 
