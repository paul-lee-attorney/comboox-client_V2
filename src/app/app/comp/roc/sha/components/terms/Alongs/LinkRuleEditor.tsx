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
  Typography,
} from "@mui/material";

import {
  ListAlt,
} from "@mui/icons-material"

import { dateParser } from "../../../../../../common/toolsKit";
import { LinkRule, triggerTypes } from "./da";

interface LinkRuleProps {
  rule: LinkRule
}

export function LinkRuleEditor({ rule }: LinkRuleProps) {

  const [ open, setOpen ] = useState (false);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ListAlt />}
        sx={{ 
          m:1, minWidth: 218, 
          justifyContent:'start',
        }}
        onClick={()=>setOpen(true)}      
      >
        Link Rule 
      </Button>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title"        
      >

        <DialogContent>

          <Toolbar sx={{ textDecoration:'underline' }}>
            <Typography variant="h5" >
              <b>Along Link Rule</b>
            </Typography> 
          </Toolbar>

          <Paper elevation={3} sx={{ m:1 , p:1, border:1, borderColor:'divider' }}>

            <Stack direction='column' spacing={1} >

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <TextField 
                  variant='outlined'
                  label='TriggerDate'
                  size="small"
                  inputProps={{readOnly: true}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ dateParser(rule.triggerDate.toString()) }
                />
                
                <TextField 
                  variant='outlined'
                  label='EffectiveDays'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ rule.effectiveDays }              
                />

                <TextField 
                  variant='outlined'
                  label='ShareRatioThreshold (%)'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ rule.shareRatioThreshold }              
                />

                <TextField 
                  variant='outlined'
                  inputProps={{readOnly: true}}
                  label='Rate'
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ rule.rate }              
                />

              </Stack>

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <TextField 
                  variant='outlined'
                  inputProps={{readOnly: true}}
                  label='TypeOfTrigger'
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ triggerTypes[Number(rule.triggerType)] }              
                />

                <TextField 
                  variant='outlined'
                  inputProps={{readOnly: true}}
                  label='ProRata ?'
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ rule.proRata ? 'True' : 'False' }              
                />

              </Stack>

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

