import { Collapse, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { PayOffSwap } from "./ActionsOfSwap/PayOffSwap";
import { TerminateSwap } from "./ActionsOfSwap/TerminateSwap";
import { PayOffSwapUsd } from "./ActionsOfSwap/PayOffSwapUsd";

export interface ActionsOfSwapProps{
  seqOfOpt: number;
  seqOfSwap: number;
  setOpen: Dispatch<SetStateAction<boolean>>;
  refresh: ()=>void;
}

export function ActionsOfSwap({seqOfOpt, seqOfSwap, setOpen, refresh}: ActionsOfSwapProps) {

  const [ typeOfAction, setTypeOfAction ] = useState<string>('');

  const typesOfAction = [
    'Pay Off Swap In ETH', 'Pay Off Swap In USD', 'Terminate Swap'
  ]
  
  const compsOfAction = [
    <PayOffSwap key={0} seqOfOpt={seqOfOpt} seqOfSwap={seqOfSwap} setOpen={ setOpen } refresh={ refresh } />, 
    <PayOffSwapUsd key={1} seqOfOpt={seqOfOpt} seqOfSwap={seqOfSwap} setOpen={ setOpen } refresh={ refresh } />, 
    <TerminateSwap key={2} seqOfOpt={seqOfOpt} seqOfSwap={seqOfSwap} setOpen={ setOpen } refresh={ refresh } />,
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

