import { Collapse, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";

import { Deal, Timeline } from "../../ia";
import { HexType } from "../../../../../common";
import { PushToCoffer } from "./ActionsOfDeal/PushToCoffer";
import { PickupShare } from "./ActionsOfDeal/PickupShare";
import { IssueShare } from "./ActionsOfDeal/IssueShare";
import { TransferShare } from "./ActionsOfDeal/TransferShare";
import { TerminateDeal } from "./ActionsOfDeal/TerminateDeal";
import { ExecDragAlong } from "./ActionsOfDeal/ExecDragAlong";
import { ExecTagAlong } from "./ActionsOfDeal/ExecTagAlong";
import { ExecAntiDilution } from "./ActionsOfDeal/ExecAntiDilution";
import { ExecFirstRefusal } from "./ActionsOfDeal/ExecFirstRefusal";
import { TakeGiftShares } from "./ActionsOfDeal/TakeGiftShares";
import { PayOffInEth } from "./ActionsOfDeal/PayOffInEth";
import { PayOffInUsd } from "./ActionsOfDeal/PayOffInUsd";
import { RequestToBuy } from "./ActionsOfDeal/RequestToBuy";

export interface ActionsOfDealProps{
  addr: HexType;
  deal: Deal;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setDeal: Dispatch<SetStateAction<Deal>>;
  refresh: ()=>void;
}

export interface ActionsOfDealCenterProps extends ActionsOfDealProps{
  timeline: Timeline;
  timestamp: number;
}

export function ActionsOfDeal({addr, deal, setOpen, setDeal, refresh, timeline, timestamp}: ActionsOfDealCenterProps) {

  const [ typeOfAction, setTypeOfAction ] = useState<string>('');

  const actionsOfDeal = [
    'FirstRefusal', 'AntiDilution', 'DragAlong', 'TagAlong', 'PushToCoffer',
    'IssueShare', 'TransferShare', 'PayOffInEth', 'PayOffInUsd', 'RequestToBuy', 
    'PickupShare', 'TerminateDeal', 'TakeGift',
  ]

  const compsOfAction = [
    <ExecFirstRefusal key={0} addr={addr} deal={deal} setOpen={setOpen} setDeal={setDeal} refresh={refresh} />,
    <ExecAntiDilution key={1} addr={addr} deal={deal} setOpen={setOpen} setDeal={setDeal} refresh={refresh} />,
    <ExecDragAlong key={2} addr={addr} deal={deal} setOpen={setOpen} setDeal={setDeal} refresh={refresh} />,
    <ExecTagAlong key={3} addr={addr} deal={deal} setOpen={setOpen} setDeal={setDeal} refresh={refresh} />,
    <PushToCoffer key={4} addr={addr} deal={deal} setOpen={setOpen} setDeal={setDeal} refresh={refresh} />,
    <IssueShare key={5} addr={addr} deal={deal} setOpen={setOpen} setDeal={setDeal} refresh={refresh} />,
    <TransferShare key={6} addr={addr} deal={deal} setOpen={setOpen} setDeal={setDeal} refresh={refresh} />,
    <PayOffInEth key={7} addr={addr} deal={deal} setOpen={setOpen} setDeal={setDeal} refresh={refresh} />,
    <PayOffInUsd key={8} addr={addr} deal={deal} setOpen={setOpen} setDeal={setDeal} refresh={refresh} />,
    <RequestToBuy key={9} addr={addr} deal={deal} setOpen={setOpen} setDeal={setDeal} refresh={refresh} />,
    <PickupShare key={10} addr={addr} deal={deal} setOpen={setOpen} setDeal={setDeal} refresh={refresh} />,
    <TerminateDeal key={11} addr={addr} deal={deal} setOpen={setOpen} setDeal={setDeal} refresh={refresh} />,
    <TakeGiftShares key={12} addr={addr} deal={deal} setOpen={setOpen} setDeal={setDeal} refresh={refresh} />,
  ]

  let activeSteps:number[] = [];
      
  if ( timestamp < timeline.frDeadline ) {

      if (deal.head.typeOfDeal == 1) activeSteps = [ 0, 1 ];
      else activeSteps = [ 0 ];

  } else if ( timestamp < timeline.dtDeadline ) {

      if (deal.head.typeOfDeal == 1) activeSteps = [ 1 ];
      else activeSteps = [ 2, 3 ];

  } else if ( timestamp < timeline.terminateStart ) {

      if (deal.head.typeOfDeal == 1) activeSteps = [ 1 ];
      else activeSteps = [];

  } else if ( timeline.stateOfFile < 3 ) {
      activeSteps = [ 10 ];

  } else if ( timestamp < timeline.closingDeadline ) {

      if (timeline.stateOfFile == 4) {
        
        if (deal.body.state == 1) {

          if (deal.head.typeOfDeal == 1) activeSteps = [ 4, 5, 7, 8 ];
          else if (deal.head.typeOfDeal == 8) activeSteps = [ 11 ];
          else activeSteps = [ 4, 6, 7, 8 ];

        } else if (deal.body.state == 2) {

          if (deal.head.typeOfDeal == 1) activeSteps = [ 5, 7, 8, 9, 10 ];
          else activeSteps = [ 6, 7, 8, 9, 10 ];

        } else activeSteps = [];

      } else if (timeline.stateOfFile >= 5) {
        activeSteps = [ 10 ];
        if (deal.head.typeOfDeal == 2 || deal.head.typeOfDeal == 3) 
          activeSteps = [ 10, 8 ];
      } 

  } else if ( timestamp >= timeline.closingDeadline && timeline.stateOfFile > 1 ) {
    activeSteps = [10];
    if (deal.head.typeOfDeal == 8) activeSteps.push(11);
  } 
  
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
            {activeSteps && activeSteps.map((v, i) => (
              <MenuItem key={i} value={ v } > <b>{ actionsOfDeal[ v ] }</b> </MenuItem>
            ))}

          </Select>
        </FormControl>

      </Stack>

      {activeSteps && activeSteps.map((v, i) => (
        <Collapse key={i} in={ typeOfAction == v.toString() } >
          { compsOfAction[ v ] }
        </Collapse>        
      ))}

    </Paper>
  );
}

