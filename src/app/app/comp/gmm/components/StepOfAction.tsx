
import { Paper, Stack, TextField, Typography } from "@mui/material";
import { Action } from "../meetingMinutes";

export interface StepOfActionProps {
  index: number;
  action: Action;
}

export function StepOfAction({index, action }:StepOfActionProps) {

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack  direction="row" sx={{ alignItems:'start' }} >

        <Typography color='black' sx={{ml:1, mr:2}}  >
          Step: {index + 1}
        </Typography>

        <TextField 
          variant='outlined'
          label='Address'
          size="small"
          inputProps={{readOnly: true}}
          sx={{
            m:1,
            minWidth: 450,
          }}
          value={ action.target }
        />

        <TextField 
          variant='outlined'
          label='Value'
          size="small"
          inputProps={{readOnly: true}}
          sx={{
            m:1,
            minWidth: 218,
          }}
          value={ action.value }
        />

        <TextField 
          variant='outlined'
          label='Params'
          size="small"
          inputProps={{readOnly:true}}
          sx={{
            m:1,
            minWidth: 630,
          }}
          value={ action.params }
        />

      </Stack>
    </Paper>
  );
}


