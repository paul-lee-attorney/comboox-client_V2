import { useState } from "react";

import { 
  Stack,
  Paper,
  Toolbar,
  TextField,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";

import {
  ListAlt,
} from "@mui/icons-material"

import { bigIntToStrNum, longDataParser, } from "../../../../../../common/toolsKit";
import { Cond, comOps, logOps } from "../../../../../roo/roo";

export const statesOfOpt = ['Pending', 'Issued', 'Executed', 'Closed'];

interface TriggerConditionProps {
  cond: Cond; 
}

export function TriggerCondition({ cond }: TriggerConditionProps) {

  const [ open, setOpen ] = useState (false);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ListAlt />}
        sx={{ m:0.5, minWidth: 218, justifyContent:'start' }}
        onClick={()=>setOpen(true)}      
      >
        Trigger Condition 
      </Button>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title"        
      >

        <DialogContent>

          <Toolbar>
            <h4> Trigger Condition </h4>
          </Toolbar>

          <Paper elevation={3} sx={{ m:1 , p:1, border:1, borderColor:'divider' }}>

            <Stack direction={'row'} sx={{ alignItems: 'center' }} >

              <TextField 
                variant='outlined'
                label='LogOpr'
                inputProps={{readOnly: true}}
                size="small"
                sx={{
                  m:1,
                  width: 128,
                }}
                value={ logOps[cond.logicOpr] }
              />

              {Number(cond.logicOpr) > 0 && (<>

                <TextField 
                  variant='outlined'
                  label='CompOpr_1'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    width: 128,
                  }}
                  value={ comOps[cond.compOpr1] }
                />

                <TextField 
                  variant='outlined'
                  label='Parameter_1'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ bigIntToStrNum(cond.para1, 4) }              
                />

              </>)}

              {Number(cond.logicOpr) > 0 && (<>

                <TextField 
                  variant='outlined'
                  label='CompOpr_2'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    width: 128,
                  }}
                  value={ comOps[cond.compOpr2] }
                />

                <TextField 
                  variant='outlined'
                  label='Parameter_2'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ bigIntToStrNum(cond.para2, 4) }              
                />

              </>)}

              {cond.logicOpr > 6 && (<>

                <TextField 
                  variant='outlined'
                  label='CompOpr_3'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    width: 128,
                  }}
                  value={ comOps[cond.compOpr3] }
                />

                <TextField 
                  variant='outlined'
                  label='Parameter_3'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ bigIntToStrNum(cond.para3, 4) }              
                />

              </>)}

            </Stack>

          </Paper>

        </DialogContent>

        <DialogActions>
          <Button variant='outlined' sx={{ m:1, mx:3 }} onClick={()=>setOpen(false)}>Close</Button>
        </DialogActions>

      </Dialog>
  
    </>
  );
} 

