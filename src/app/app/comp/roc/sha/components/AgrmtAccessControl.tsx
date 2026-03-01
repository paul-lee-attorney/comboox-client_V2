
import { 
  Paper, Stack,
} from "@mui/material";

import { HexType } from "../../../../common";

import { SetOwner } from "./access_control/SetOwner";
import { SetGeneralCounsel } from "./access_control/SetGeneralCounsel";
import { AppointAttorney } from "./access_control/AppointAttorney";
import { RemoveAttorney } from "./access_control/RemoveAttorney";
import { QuitAttorney } from "./access_control/QuitAttorney";

import { FinalizeSha } from "./actions/FinalizeSha";
import { FinalizeIa } from "./actions/FinalizeIa";

interface AgrmtAccessControlProps{
  isSha: boolean;
  agrmt: HexType;
}

export function AgrmtAccessControl({ isSha, agrmt }:AgrmtAccessControlProps) {

  return (
    <Stack direction={'column'}  sx={{ width: 980}} >
      <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider'}}>
        <SetOwner addr={ agrmt } />
        <SetGeneralCounsel addr={ agrmt } />
        {isSha 
          ? <FinalizeSha addr={ agrmt } setIsFinalized={()=>{}} setNextStep={()=>{}} />           
          : <FinalizeIa addr={ agrmt } setIsFinalized={()=>{}} setNextStep={()=>{}} />  
        }
      </Paper>

      <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider'}} >
        <AppointAttorney addr={ agrmt } />
        <RemoveAttorney addr={ agrmt } />
        <QuitAttorney addr={ agrmt } />
      </Paper>
    </Stack>
  );
} 
