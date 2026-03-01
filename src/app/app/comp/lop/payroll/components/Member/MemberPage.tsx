
import { Card, CardContent, Paper, Stack, Typography } from "@mui/material";

import { useEffect, useState } from "react";
import { BalanceOf, balanceOfWei, defaultBalanceOf, getBalanceOf, } from "../../../lop";
import { PayrollProps } from "../Owner/OwnerPage";
import { ActionsOfMember } from "./ActionsOfMember";
import { useComBooxContext } from "../../../../../../_providers/ComBooxContextProvider";
import { MemberInfo } from "./MemberInfo";
import { TeamSelector } from "../Leader/TeamSelector";
import { getEthPart, getGWeiPart, getWeiPart, longSnParser, weiToEth } from "../../../../../common/toolsKit";

export function MemberPage({ addr }:PayrollProps) {

  const [ time, setTime ] = useState(0);

  const refresh = () => {
    setTime(Date.now());
  }

  const [ seqOfTeam, setSeqOfTeam ] = useState<number>(0);

  const { userNo } = useComBooxContext();

  const [ balanceOf, setBalanceOf ] = useState<BalanceOf>(defaultBalanceOf);

  useEffect(() => {

    if (userNo) {      
      getBalanceOf(addr, userNo).then(
        res => {
          setBalanceOf((v) => ({
            ...v,
            me: res,
          }));
        }
      );
    }
    
    balanceOfWei(addr).then(
      res => {
        setBalanceOf(v => ({
          ...v,
          cash: res,
        }));
      }
    );

    getBalanceOf(addr, 0).then(
      res => {
        setBalanceOf(v => ({
          ...v,
          project: res,
        }));
      }
    );

  }, [ addr, userNo, time ]);
  
  return (
    <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider'}} >
      
      <Stack direction='row' sx={{ justifyContent:'start' }} >

        <Typography variant="h5" sx={{m:2, textDecoration:'underline' }} >
          <b>Member Info: </b> { longSnParser(userNo?.toString() ?? '0') }
        </Typography>

        <TeamSelector addr={addr} time={time} seqOfTeam={seqOfTeam} setSeqOfTeam={setSeqOfTeam} acct={0} />

      </Stack>

      <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider'}} >

        <Typography variant="body1" sx={{ m:1 }} >
          Balance Of Project: { weiToEth(balanceOf.project.toString()) }
        </Typography>

        <Typography variant="body1" sx={{ m:1 }} >
          Cash Available: { weiToEth(balanceOf.cash.toString()) }
        </Typography>

        <Typography variant="body1" sx={{ m:1 }} >
          Balance Of Me: { weiToEth(balanceOf.me.toString()) }
        </Typography>

      </Paper>

      <MemberInfo addr={addr} time={time} seqOfTeam={seqOfTeam} acct={userNo ?? 0} />

      <ActionsOfMember addr={ addr } seqOfTeam={ seqOfTeam } refresh={ refresh } />

    </Paper>
  );
} 
