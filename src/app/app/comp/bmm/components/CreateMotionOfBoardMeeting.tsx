import { useState } from "react";

import { Box, Collapse, FormControlLabel, 
  Paper, Radio, RadioGroup, Stack, Toolbar, Typography, 
} from "@mui/material";

import { CreateMotionForOfficer } from "./create_motions/CreateMotionForOfficer";
import { CreateMotionToApproveDoc } from "./create_motions/CreateMotionToApproveDoc";
import { CreateAction } from "./create_motions/CreateAction";
import { ProposeToTransferFund } from "./create_motions/ProposeToTransferFund";

export interface CreateMotionProps {
  refresh: ()=>void;
}

export function CreateMotionOfBoardMeeting({ refresh }: CreateMotionProps) {

  const nameOfTypes = ['Nominate/Remove Officer', 'Approve Document', 'Transfer Fund', 'Approve Action'];

  const compOfTypes = [
    <CreateMotionForOfficer key={0} refresh={refresh} />,
    <CreateMotionToApproveDoc key={1} refresh={refresh} />,
    <ProposeToTransferFund key={2} refresh={refresh} />,
    <CreateAction key={3} refresh={refresh} />,
  ]

  const [ typeOfMotion, setTypeOfMotion ] = useState<number>(0);

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }} >
      <Stack direction={'row'} sx={{ alignItems:'center', color:'black' }} >

        <Box sx={{ minWidth:200 }} >
          <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
            <b>Create Motion - Type Of Motion: </b>
          </Typography>
        </Box>

        <RadioGroup
          row
          aria-labelledby="createMotionRadioGrup"
          name="createMotionRadioGroup"
          onChange={(e)=>setTypeOfMotion(parseInt(e.target.value ?? '0'))}
          defaultValue={0}
        >
          {nameOfTypes.map((v,i) => (
            <FormControlLabel key={i} value={i} control={<Radio size='small' />} label={v} />
          ))}

        </RadioGroup>

      </Stack>

      {compOfTypes.map((v, i) => (
        <Collapse key={i} in={ typeOfMotion == i } >
          {v}
        </Collapse>
      ))}

    </Paper>
  );
}



