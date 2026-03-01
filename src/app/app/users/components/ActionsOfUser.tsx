import { Checkbox, Collapse, FormControl, FormControlLabel, InputLabel, 
  MenuItem, Paper, Select, Stack, Toolbar } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { SetBackupKey } from "./ActionsOfUser/SetBackupKey";
import { LockConsideration } from "./ActionsOfUser/LockConsideration";
import { MintPoints } from "./ActionsOfUser/Mint";
import { LockPoints } from "./ActionsOfUser/LockPoints";
import { TransferPoints } from "./ActionsOfUser/TransferPoints";
import { MintAndLockPoints } from "./ActionsOfUser/MintAndLockPoints";
import { SetRoyaltyRule } from "./ActionsOfUser/SetRoyaltyRule";
import { User } from "../../rc";
import { AddrZero } from "../../common";
import { TransferIPR } from "./ActionsOfUser/TransferIPR";
import { TransferUSD } from "./ActionsOfUser/TransferUSD";
import { LockUSD } from "./ActionsOfUser/LockUSD";
import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { LockUsdConsideration } from "./ActionsOfUser/LockUsdConsideration";

export interface ActionsOfUserProps{
  refresh: ()=>void;
}

interface ActionsOfUserPanelProps extends ActionsOfUserProps {
  user: User | undefined;
  isOwner: boolean;
  showList: boolean;
  showUsdList: boolean;
  setShowList: Dispatch<SetStateAction<boolean>>;
  setShowUsdList: Dispatch<SetStateAction<boolean>>;
}

export function ActionsOfUser({ user, isOwner, showList, showUsdList, setShowList, setShowUsdList, refresh}: ActionsOfUserPanelProps) {

  const { boox } = useComBooxContext();

  const [ typeOfAction, setTypeOfAction ] = useState<string>('1');
  
  const actionsOfUser = [
    'Set Backup Key', 'Set Royalty Rule', 'Mint CBP', 'Mint & Lock CBP', 'Transfer IPR',
    'Transfer CBP', 'Lock CBP', 
    'Transfer USD', 'Lock USD', 'Lock USD Consideration',
  ]

  const compsOfAction = [
    <SetBackupKey key={0} refresh={refresh} />,
    <SetRoyaltyRule key={1} refresh={refresh} />,
    <MintPoints key={2} refresh={refresh} />,
    <MintAndLockPoints key={3} refresh={refresh} />,
    <TransferIPR key={4} />,
    <TransferPoints key={5} refresh={refresh} />,
    <LockPoints key={6} refresh={refresh} />,       
    <TransferUSD key={7} refresh={refresh} />,
    <LockUSD key={8} refresh={refresh} />,
    <LockUsdConsideration key={9} refresh={refresh} />,
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
              if ((i==2 || i==3) && !isOwner ) return null;
              if (i==9 && !boox) return null;
              
              return (<MenuItem key={v} value={ i } > <b>{v}</b> </MenuItem>);
            })}
          </Select>
        </FormControl>

        <FormControlLabel 
          label='Show CBP Lockers'
          sx={{
            m:1,
            ml:30,
          }}
          control={
            <Checkbox 
              sx={{
                m: 1,
                height: 64,
              }}
              onChange={e => setShowList(e.target.checked)}
              checked={ showList }
            />
          }
        />

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
        if (i==0 && user?.backupKey?.pubKey != AddrZero) return null;
        if ((i==2 || i==3) && !isOwner ) return null;

        return (
          <Collapse key={i} in={ typeOfAction == i.toString() } >
            {v}
          </Collapse>
        );
      }) }

    </Paper>
  );
}

