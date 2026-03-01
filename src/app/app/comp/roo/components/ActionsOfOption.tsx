import { Collapse, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { UpdateOracle } from "./ActionsOfOption/UpdateOracle";
import { ExecOption } from "./ActionsOfOption/ExecOption";
import { CreateSwap } from "./ActionsOfOption/CreateSwap";

export interface ActionsOfOptionProps{
  seqOfOpt: number;
  setOpen: Dispatch<SetStateAction<boolean>>;
  refresh: ()=>void;
}

export function ActionsOfOption({seqOfOpt, setOpen, refresh}: ActionsOfOptionProps) {

  const [ typeOfAction, setTypeOfAction ] = useState<string>('');

  const typesOfAction = [
    'Update Oracle', 'Exec Option', 'Create Swap',
  ]
  
  const compsOfAction = [
    <UpdateOracle key={0} seqOfOpt={seqOfOpt} setOpen={ setOpen } refresh={ refresh } />,
    <ExecOption key={1} seqOfOpt={seqOfOpt} setOpen={ setOpen } refresh={ refresh } />,
    <CreateSwap key={2} seqOfOpt={seqOfOpt} setOpen={ setOpen } refresh={ refresh } />,
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

