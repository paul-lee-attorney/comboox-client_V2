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
  Chip,
} from "@mui/material";

import {
  ListAlt,
} from "@mui/icons-material"

import { bigIntToStrNum, dateParser, longSnParser } from "../../../../../../common/toolsKit";
import { Option, typeOfOpts } from "../../../../../roo/roo";

export const statesOfOpt = ['Pending', 'Issued', 'Executed', 'Closed'];

interface ContentOfOptProps {
  opt: Option; 
}

export function ContentOfOpt({ opt }: ContentOfOptProps) {

  const [ open, setOpen ] = useState (false);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ListAlt />}
        sx={{ m:0.5, minWidth: 218, justifyContent:'start' }}
        onClick={()=>setOpen(true)}      
      >
        { opt.head.typeOfOpt % 2 == 0 ? 'Call' : 'Put' } Option 
      </Button>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title"        
      >

        <DialogContent>

          <Stack direction="row" sx={{ width:'100%', alignItems:'center', justifyContent:'space-between' }} >

            <Toolbar>
              <h4> Head Of Option </h4>
            </Toolbar>

            <Chip
              variant='filled'
              label={ statesOfOpt[opt.body.state] }
              sx={{
                m:1,
                minWidth: 168,
              }}
              color={
                opt.body.state == 0
                ? 'default'
                : opt.body.state == 1
                  ? 'info'
                  : opt.body.state == 2
                    ? 'primary'
                    : 'success'
              }
            />

           </Stack>
          <Paper elevation={3} sx={{ m:1 , p:1, border:1, borderColor:'divider' }}>

            <Stack direction='column' spacing={1} >

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <TextField 
                  variant='outlined'
                  label='TypeOfOption'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ typeOfOpts[opt.head.typeOfOpt] }              
                />

                <TextField 
                  variant='outlined'
                  label='ClassOfShare'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ opt.head.classOfShare }
                />

                <TextField 
                  variant='outlined'
                  label='Paid'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ bigIntToStrNum(opt.body.paid, 4) }              
                />

                <TextField 
                  variant='outlined'
                  label='Par'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ bigIntToStrNum(opt.body.par, 4) }              
                />

                <TextField 
                  variant='outlined'
                  label='Rightholder'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ longSnParser(opt.body.rightholder.toString()) }              
                />

              </Stack>

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <TextField 
                  variant='outlined'
                  label='RateOfOption'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ bigIntToStrNum(BigInt(opt.head.rate), 4) }              
                />

                <TextField 
                  variant='outlined'
                  label='IssueDate'
                  inputProps={{readOnly:true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ dateParser(opt.head.issueDate.toString() ?? '0') }
                />

                <TextField 
                  variant='outlined'
                  label='TriggerDate'
                  inputProps={{readOnly:true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ dateParser(opt.head.triggerDate.toString() ?? '0') }
                />

                <TextField 
                  variant='outlined'
                  label='ExecDays'
                  inputProps={{readOnly:true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ opt.head.execDays }              
                />

                <TextField 
                  variant='outlined'
                  label='ClosingDays'
                  inputProps={{readOnly:true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ opt.head.closingDays }              
                />

              </Stack>

            </Stack>

          </Paper>

        </DialogContent>

        <DialogActions>
          <Button variant='outlined' sx={{ m:1, mx:3 }} onClick={ ()=>setOpen(false) }>Close</Button>
        </DialogActions>

      </Dialog>
  
    </>
  );
} 

