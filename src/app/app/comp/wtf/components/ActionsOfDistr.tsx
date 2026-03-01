import { Collapse, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";

import { InitClass,  } from "./actions_of_distr/InitClass";
import { DropInfo, DropProps } from "../wtf";
import { InitSeaInfo } from "./actions_of_distr/InitSeaInfo";
import { SeaInfo } from "./actions_of_distr/SeaInfo";
import { GulfInfo } from "./actions_of_distr/GulfInfo";
import { LakeInfo } from "./actions_of_distr/LakeInfo";
import { IslandInfo } from "./actions_of_distr/IslandInfo";
import { PoolInfo } from "./actions_of_distr/PoolInfo";
import { AllSeasInfo } from "./actions_of_distr/AllSeasInfo";
import { CreeksOfStream } from "./actions_of_distr/CreeksOfStream";

export interface ActionsOfDistrProps {
  setInfo:Dispatch<SetStateAction<DropInfo>>;
  setList:Dispatch<SetStateAction<DropProps[]>>;
}

export function ActionsOfDistr({setInfo, setList}:ActionsOfDistrProps) {

  const [ typeOfAction, setTypeOfAction ] = useState<string>('');
  
  const actionsOfListing = [
    'Init Class', 'Init Info of Class', 'Sea Info Of Class', 'Gulf Info of Class', 'Island Info of Class',
    'All Seas Info', 'Lake Info of Member', 'Pool Info of Member', 'Creeks of Stream'
  ]

  const compsOfAction = [
    <InitClass key={0} />,
    <InitSeaInfo key={1} setInfo={setInfo} setList={setList} />,
    <SeaInfo key={2} setInfo={setInfo} setList={setList} />,
    <GulfInfo key={3} setInfo={setInfo} setList={setList} />,
    <IslandInfo key={4} setInfo={setInfo} setList={setList} />,
    <AllSeasInfo key={5} setInfo={setInfo} setList={setList} />,
    <LakeInfo key={6} setInfo={setInfo} setList={setList} />,
    <PoolInfo key={7} setInfo={setInfo} setList={setList} />,
    <CreeksOfStream key={8} setInfo={setInfo} setList={setList} />,
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

