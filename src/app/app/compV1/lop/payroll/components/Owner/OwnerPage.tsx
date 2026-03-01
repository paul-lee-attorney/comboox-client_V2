
import { Paper, Stack, Typography } from "@mui/material";

import { AddrZero, HexType } from "../../../../../common";
import { useEffect, useState } from "react";
import { ActionsOfOwner } from "./ActionsOfOwner";
import { MemberInfo } from "../Member/MemberInfo";
import { CopyLongStrSpan } from "../../../../../common/CopyLongStr";
import { getOwner } from "../../../../../common/ownable";
import { useWalletClient } from "wagmi";

export interface PayrollProps{
  addr: HexType;
}

export function OwnerPage({ addr }:PayrollProps) {
  
  const { data: signer } = useWalletClient();

  const [ time, setTime ] = useState(0);

  const refresh = () => {
    setTime(Date.now());
  }

  const [ owner, setOwner ] = useState<HexType>(AddrZero);

  useEffect(()=>{
    getOwner(addr).then(
      res => setOwner(res)
    )
  }, [addr, time])

  return (
    <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider'}} >

      <Stack direction='row' >
        <Typography variant="h5" sx={{ m:2, ml:4 }} >
          <b>Project Owner:</b>
        </Typography>

        <CopyLongStrSpan title='addr' src={owner} />
      </Stack>
      <MemberInfo addr={addr} time={time} seqOfTeam={0} acct={0}  />
      <ActionsOfOwner addr={ addr } refresh={ refresh } />        

    </Paper>
  );
} 
