
import { Dispatch, SetStateAction, useState } from "react";

import { Collapse, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";

import { HexType } from "../../../common";

import { SetCompInfo } from "./actions_of_setting/SetCompInfo";
import { SetOwner } from "./actions_of_setting/SetOwner";
import { SetDK } from "./actions_of_setting/SetDK";
import { RegKeeper } from "./actions_of_setting/RegKeeper";
import { RegBook } from "./actions_of_setting/RegBook";
import { TakeBackKeys } from "./actions_of_setting/TakeBackKeys";
import { InitKeepers } from "./actions_of_setting/InitKeepers";
import { SetNewGK } from "./actions_of_setting/SetNewGK";

export interface ActionsOfSettingProps{
  title: number;
  addr: HexType;
  setTitle: Dispatch<SetStateAction<number>>;
  setAddr: Dispatch<SetStateAction<HexType>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setTime: Dispatch<SetStateAction<number>>;
}

export function ActionsOfSetting({ title, addr, setTitle, setAddr, setOpen, setTime }: ActionsOfSettingProps) {

  const [ typeOfAction, setTypeOfAction ] = useState<string>('0');

  const actionsOfSetting = [
    'SetCompInfo', 'SetOwner', 'SetDK', 'TakeBackKeys', 
    'RegKeeper', 'RegBook',  'InitKeepers', 'SetNewGK' 
  ]

  const compsOfSetting = [
    <SetCompInfo key={0} setOpen={setOpen} setTime={setTime} />,
    <SetOwner key={1} docAddr={addr} setDocAddr={setAddr} setOpen={setOpen} />,
    <SetDK key={2} docAddr={addr} setDocAddr={setAddr} setOpen={setOpen} />,
    <TakeBackKeys key={3} docAddr={addr} setDocAddr={setAddr} setOpen={setOpen} />,
    <RegKeeper key={4} title={title} book={addr} setTitle={setTitle} setBook={setAddr} setOpen={setOpen} />,
    <RegBook key={5} title={title} book={addr} setTitle={setTitle} setBook={setAddr} setOpen={setOpen} />,
    <InitKeepers key={6} docAddr={addr} setDocAddr={setAddr} setOpen={setOpen} />,
    <SetNewGK key={7} docAddr={addr} setDocAddr={setAddr} setOpen={setOpen} />,
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

