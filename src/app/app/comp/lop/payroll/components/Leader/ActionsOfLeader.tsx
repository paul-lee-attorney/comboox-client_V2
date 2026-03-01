
import { Collapse, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";
import { useState } from "react";

import { ActionsOfManagerProps } from "../Manager/ActionsOfManager";
import { CreateTeam } from "./Actions/CreateTeam";
import { UpdateTeam } from "./Actions/UpdateTeam";
import { EnrollMember } from "./Actions/EnrollMember";
import { RemoveMember } from "./Actions/RemoveMember";
import { RestoreMember } from "./Actions/RestoreMember";
import { VerifyMemberWork } from "./Actions/VerifyMemberWork";
import { IncreaseMemberBudget } from "./Actions/IncreaseMemberBudget";
import { AdjustSalary } from "./Actions/AdjustSalary";

export interface ActionsOfLeaderProps extends ActionsOfManagerProps {
  memberNo: number | undefined;
}

export function ActionsOfLeader({addr, seqOfTeam, memberNo, refresh}: ActionsOfLeaderProps ) {

  const [ typeOfAction, setTypeOfAction ] = useState<string>('');

  const typesOfAction = [
    'Create Team', 'Update Team', 'Enroll Member', 'Remove Member', 
    'Restore Member', 'Increase Member Budget', 'Adjust Salary', "Verify Member's Work"
  ]
  
  const compsOfAction = [
    <CreateTeam key={0} addr={addr} refresh={refresh} />,
    <UpdateTeam key={1} addr={addr} seqOfTeam={seqOfTeam} refresh={refresh} />,
    <EnrollMember key={2} addr={addr} seqOfTeam={seqOfTeam} refresh={refresh} />,
    <RemoveMember key={3} addr={addr} seqOfTeam={seqOfTeam} memberNo={memberNo} refresh={refresh} />,
    <RestoreMember key={4} addr={addr} seqOfTeam={seqOfTeam} memberNo={memberNo} refresh={refresh} />,
    <IncreaseMemberBudget key={5} addr={addr} seqOfTeam={seqOfTeam} memberNo={memberNo} refresh={refresh} />,
    <AdjustSalary key={6} addr={addr} seqOfTeam={seqOfTeam} memberNo={memberNo} refresh={refresh} />,
    <VerifyMemberWork key={7} addr={addr} seqOfTeam={seqOfTeam} memberNo={memberNo} refresh={refresh} />,
  ]

  return(
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }} >

      <Stack direction={'row'} sx={{ alignItems:'center', color:'black' }} >

        <Toolbar sx={{ textDecoration:'underline' }}>
          <h4>Type Of Action:</h4>
        </Toolbar>

        <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 168 }}>
          <InputLabel id="typeOfAction-label">TypeOfAction</InputLabel>
          <Select
            labelId="typeOfAction-label"
            id="typeOfAction-select"
            label="TypeOfAction"
            value={ typeOfAction }
            onChange={(e) => setTypeOfAction(e.target.value)}
          >
            {typesOfAction.map((v, i) => (
              <MenuItem key={v} value={i} ><b>{v}</b></MenuItem>
            ))}
          </Select>
        </FormControl>

      </Stack>

      {compsOfAction.map((v, i) => (
        <Collapse key={i} in={ typeOfAction == i.toString() } >
          {v}
        </Collapse>
      ))}

    </Paper>
  );
}

