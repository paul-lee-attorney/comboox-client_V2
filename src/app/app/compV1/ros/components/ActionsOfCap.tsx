
import { Dispatch, SetStateAction, useState } from "react";

import { Collapse, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";

import { Share } from "../ros";

import { PayInUsd } from "./Actions/PayInUsd";
import { SetPayInAmt } from "./Actions/SetPayInAmt";
import { RequestPaidInCap } from "./Actions/RequestPaidInCap";
import { WithdrawPayInAmt } from "./Actions/WithdrawPayInAmt";
import { PayInEth } from "./Actions/PayInEth";

export interface ActionsOfCapProps {
  share: Share;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  refresh: ()=>void;
}

export function ActionsOfCap({share, setDialogOpen, refresh}: ActionsOfCapProps) {

  const [ typeOfAction, setTypeOfAction ] = useState<string>('');
  
  const actionsOfCap = [
    'PayIn ETH', 'PayIn USD', 'Lock PayInAmt', 'Pickup PayInAmt', 'Withdraw PayInAmt' 
  ]

  const compsOfAction = [
    <PayInEth key={0} share={share} setDialogOpen={setDialogOpen} refresh={refresh} />, 
    <PayInUsd key={1} share={share} setDialogOpen={setDialogOpen} refresh={refresh} />, 
    <SetPayInAmt key={2} share={share} setDialogOpen={setDialogOpen} refresh={refresh} />, 
    <RequestPaidInCap key={3} share={share} setDialogOpen={setDialogOpen} refresh={refresh} />, 
    <WithdrawPayInAmt key={4} share={share} setDialogOpen={setDialogOpen} refresh={refresh} />, 
  ]

  return(
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }} >
      <Stack direction={'row'} sx={{ alignItems:'center', color:'black' }} >

        <Toolbar>
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
            {actionsOfCap.map((v, i) => (
              <MenuItem key={v} value={ i } > <b>{v}</b> </MenuItem>
            ))}
          </Select>
        </FormControl>

      </Stack>

      { compsOfAction.map((v,i)=>(
        <Collapse key={i} in={ typeOfAction == i.toString() } >
          {v}
        </Collapse>
      )) }

    </Paper>
  );
}

