import { Collapse, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";
import { useState } from "react";

import { FixBudget } from "./Actions/FixBudget";
import { SetBudget } from "./Actions/SetBudget";
import { IncreaseBudget } from "./Actions/IncreaseBudget";
import { EnrollTeam } from "./Actions/EnrollTeam";
import { IncreaseTeamBudget } from "./Actions/IncreaseTeamBudget";
import { ReplaceLeader } from "./Actions/ReplaceLeader";
import { VerifyTeamWork } from "./Actions/VerifyTeamWork";
import { ActionsOfOwnerProps } from "../Owner/ActionsOfOwner";

export interface ActionsOfManagerProps extends ActionsOfOwnerProps {
  seqOfTeam: number | undefined;
}

export function ActionsOfManager({addr, seqOfTeam, refresh}: ActionsOfManagerProps) {

  const [ typeOfAction, setTypeOfAction ] = useState<string>('');

  const typesOfAction = [
    'Set Budget', 'Fix Budget', 'Increase Budget', 'Enroll Team', 'Increase Team Budget', 'Replace Leader', 'Verify Team Work'
  ]
  
  const compsOfAction = [
    <SetBudget key={0} addr={addr} refresh={refresh} />,
    <FixBudget key={1} addr={addr} refresh={refresh} />,
    <IncreaseBudget key={2} addr={addr} refresh={refresh} />,
    <EnrollTeam key={3} addr={addr} seqOfTeam={seqOfTeam} refresh={refresh} />,
    <IncreaseTeamBudget key={4} addr={addr} seqOfTeam={seqOfTeam} refresh={refresh} />,
    <ReplaceLeader key={5} addr={addr} seqOfTeam={seqOfTeam} refresh={refresh} />,
    <VerifyTeamWork key={6} addr={addr} seqOfTeam={seqOfTeam} refresh={refresh} />,
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

