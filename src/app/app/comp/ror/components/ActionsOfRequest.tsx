import { Collapse, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";
import { useState } from "react";
import { AddRedeemableClass } from "./actions_of_request/AddRedeemableClass";
import { RemoveRedeemableClass } from "./actions_of_request/RemoveRedeemableClass";
import { UpdateNavPrice } from "./actions_of_request/UpdateNavPrice";
import { RequestForRedemption } from "./actions_of_request/RequestForRedemption";
import { Redeem } from "./actions_of_request/Redeem";


export interface ActionsOfRequestProps{
  classOfShare: number;
  refresh: ()=>void;
}

export function ActionsOfRequest({classOfShare, refresh}: ActionsOfRequestProps) {

  const [ typeOfAction, setTypeOfAction ] = useState<string>('');
  
  const actionsOfListing = [
    'Add Class', 'Remove Class', 'Update NAV Price', 'Request Redemption', 'Redeem Pack'
  ]

  const compsOfAction = [
    <AddRedeemableClass key={0} classOfShare={classOfShare} refresh={refresh} />,
    <RemoveRedeemableClass key={1} classOfShare={classOfShare} refresh={refresh} />,
    <UpdateNavPrice key={2} classOfShare={classOfShare} refresh={refresh} />,
    <RequestForRedemption key={3} classOfShare={classOfShare} refresh={refresh} />,
    <Redeem key={4} classOfShare={classOfShare} refresh={refresh} />,
  ]

  return(
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }} >
      <Stack direction={'row'} sx={{ alignItems:'center', color:'black' }} >

        <Toolbar>
          <h4>Actions of Request:</h4>
        </Toolbar>

        <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 218 }}>
          <InputLabel id="typeOfAction-label">TypeOfAction</InputLabel>
          <Select
            labelId="typeOfAction-label"
            id="typeOfAction-select"
            label="TypeOfAction"
            value={ typeOfAction }
            onChange={(e) => setTypeOfAction(e.target.value)}
          >
            {actionsOfListing.map((v, i) => (
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

