
import { useState } from "react";

import { Collapse, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";


import { CreateDoc, CreateDocProps } from "./actions_of_setting/CreateDoc";
import { InitKeepers } from "./actions_of_setting/InitKeepers";
import { SetTemplate } from "./actions_of_setting/SetTemplate";
import { CreateCorpSeal } from "./actions_of_setting/CreateCorpSeal";


export function ActionsOfSetting({ addr, typeOfDoc, version, setTime, setOpen }: CreateDocProps) {

  const [ typeOfAction, setTypeOfAction ] = useState<string>('');

  const actionsOfSetting = [
    'CreateDoc', 'InitKeepers', 'SetTemplate', 'CreateSeal'
  ]

  const compsOfSetting = [
    <CreateDoc key={0} addr={addr} typeOfDoc={typeOfDoc} version={version} setTime={setTime} setOpen={setOpen} />,
    <InitKeepers key={1} addr={addr} typeOfDoc={typeOfDoc} version={version} setTime={setTime} setOpen={setOpen} />,
    <SetTemplate key={2} addr={addr} typeOfDoc={typeOfDoc} version={version} setTime={setTime} setOpen={setOpen} />, 
    <CreateCorpSeal key={3} addr={addr} typeOfDoc={typeOfDoc} version={version} setTime={setTime} setOpen={setOpen} />,  ]

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
            {actionsOfSetting.map((v, i) => (
              <MenuItem key={v} value={i} > <b>{v}</b> </MenuItem>
            ))}
          </Select>
        </FormControl>

      </Stack>

      {compsOfSetting.map((v,i)=>(
        <Collapse key={i} in={ typeOfAction == i.toString() } >
          {v}
        </Collapse>
      ))}

    </Paper>
  );
}

