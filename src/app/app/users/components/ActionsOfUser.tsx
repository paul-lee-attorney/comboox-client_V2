import { Checkbox, Collapse, FormControl, FormControlLabel, InputLabel, 
  MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SetBackupKey } from "./ActionsOfUser/SetBackupKey";
import { MintPoints } from "./ActionsOfUser/MintPoints";
import { TransferPoints } from "./ActionsOfUser/TransferPoints";
import { SetRoyaltyRule } from "./ActionsOfUser/SetRoyaltyRule";
import { User } from "../../rc";
import { AddrZero, HexType } from "../../common";
import { TransferUSD } from "./ActionsOfUser/TransferUSD";
import { LockUSD } from "./ActionsOfUser/LockUSD";
import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { LockUsdConsideration } from "./ActionsOfUser/LockUsdConsideration";
import { getCashLockersAddr } from "../../cl";

export interface ActionsOfUserProps{
  addrCL: HexType;
  refresh: ()=>void;
}

interface ActionsOfUserPanelProps extends ActionsOfUserProps {
  user: User | undefined;
  isOwner: boolean;
  showUsdList: boolean;
  setShowUsdList: Dispatch<SetStateAction<boolean>>;
}

export function ActionsOfUser({ user, isOwner, addrCL, showUsdList, setShowUsdList, refresh}: ActionsOfUserPanelProps) {

  const { boox } = useComBooxContext();

  const [ typeOfAction, setTypeOfAction ] = useState<string>('1');
  
  const actionsOfUser = [
    'Set Backup Key', 'Set Royalty Rule', 'Mint CBP', 
    'Transfer CBP', 'Transfer USD', 'Lock USD', 'Lock USD Consideration',
  ]

  const compsOfAction = [
    <SetBackupKey key={0} addrCL={addrCL} refresh={refresh} />,
    <SetRoyaltyRule key={1} addrCL={addrCL} refresh={refresh} />,
    <MintPoints key={2} addrCL={addrCL} refresh={refresh} />,
    <TransferPoints key={3} addrCL={addrCL} refresh={refresh} />,
    <TransferUSD key={4} addrCL={addrCL} refresh={refresh} />,
    <LockUSD key={5} addrCL={addrCL} refresh={refresh} />,
    <LockUsdConsideration key={6} addrCL={addrCL} refresh={refresh} />,
  ]

  return( 
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }} >
      <Stack direction={'row'} sx={{ alignItems:'center', color:'black', }} >

        <Toolbar  sx={{ textDecoration:'underline' }} >
          <h4>Actions of User:</h4>
        </Toolbar>

        <FormControl variant="outlined" size="small" sx={{ m:1, mr:5, minWidth: 218 }}>
          <InputLabel id="typeOfAction-label">TypeOfAction</InputLabel>
          <Select
            labelId="typeOfAction-label"
            id="typeOfAction-select"
            label="TypeOfAction"
            value={ typeOfAction }
            onChange={(e) => setTypeOfAction(e.target.value)}
          >
            {actionsOfUser.map((v, i) => {
              if (i==0 && user?.backupKey?.pubKey != AddrZero) return null;
              if ((i==2) && !isOwner ) return null;
              if ( i==6 && !boox) return null;
              
              return (<MenuItem key={v} value={ i } > <b>{v}</b> </MenuItem>);
            })}
          </Select>
        </FormControl>

        <FormControlLabel 
          label='Show USD Lockers'
          sx={{
            m:1,
            ml:5,
          }}
          control={
            <Checkbox 
              sx={{
                m: 1,
                height: 64,
              }}
              onChange={e => setShowUsdList(e.target.checked)}
              checked={ showUsdList }
            />
          }
        />

      </Stack>

      { compsOfAction.map((v,i)=>{
        if ( i==0 && user?.backupKey?.pubKey != AddrZero) return null;
        if (( i==2 ) && !isOwner ) return null;
        if (i==6 && !boox) return null;
        return (
          <Collapse key={i} in={ typeOfAction == i.toString() } >
            {v}
          </Collapse>
        );
      }) }

    </Paper>
  );
}

