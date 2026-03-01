import { Collapse, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";
import { useState } from "react";

import { HexType } from "../../../../../common";
import { SetCurrency } from "./Actions/SetCurrency";
import { SetManager } from "./Actions/SetManager";
import { PayWages } from "./Actions/PayWages";
import { SetNewOwner } from "./Actions/SetNewOwner";

export interface ActionsOfOwnerProps{
  addr: HexType;
  refresh: ()=>void;
}

export function ActionsOfOwner({addr, refresh}: ActionsOfOwnerProps) {

  const [ typeOfAction, setTypeOfAction ] = useState<string>('');

  const typesOfAction = [
    'Set Currency', 'Set Manager', 'Pay Wages', 'Transfer Ownership'
  ]
  
  const compsOfAction = [
    <SetCurrency key={0} addr={addr} refresh={refresh} />,
    <SetManager key={1} addr={addr} refresh={refresh} />,
    <PayWages key={2} addr={addr} refresh={refresh} />,
    <SetNewOwner key={3} addr={addr} refresh={refresh} />,
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

