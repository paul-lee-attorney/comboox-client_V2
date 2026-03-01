import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, 
  DialogTitle, Paper, Stack, TextField, Typography 
} from "@mui/material";
import { AssignmentInd } from "@mui/icons-material";

import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";

import { dateParser, longSnParser } from "../../../common/toolsKit";
import { booxMap } from "../../../common";
import { titleOfPositions } from "../../roc/sha/sha";

import { Position, getPosition } from "../rod";

import { QuitPosition } from "../../bmm/components/actions_on_motion/QuitPosition";

import { GetVotingRule } from "../../roc/sha/components/rules/VotingRules/GetVotingRule";



interface GetPositionProps{
  seq: number;
}

export function GetPosition({seq}: GetPositionProps) {
  const { boox } = useComBooxContext();

  const [ pos, setPos ] = useState<Position>();
  const [ open, setOpen ] = useState(false);
  const [ time, setTime ] = useState(0);

  const refresh = ()=> {
    setTime(Date.now());
  }

  useEffect(()=>{
    if (boox) {
      getPosition(boox[booxMap.ROD], seq).then(
        res => setPos(res)
      );
    }
  }, [boox, seq, time]);

  return (
    <>
      <Button
        disabled={ !pos }
        variant="outlined"
        fullWidth
        size='small'
        startIcon={<AssignmentInd />}
        sx={{ m:1, height:40 }}
        onClick={()=>setOpen(true)}      
      >
        Position: No. {seq}
      </Button>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title"
      >
        {pos && (
          <DialogTitle id="dialog-title" sx={{ textDecoration:'underline' }} >
            <b>Position Info - No. {pos.seqOfPos.toString().padStart(4, '0')}</b>
          </DialogTitle>
        )}

        <DialogContent>

          <Paper elevation={3} sx={{
            alignContent:'center', 
            justifyContent:'center', 
            p:1, m:1, 
            border: 1, 
            borderColor:'divider' 
            }} 
          >

            <Stack 
              direction={'column'} 
              spacing={1} 
            >
              {pos && (
                <Typography variant="h5" sx={{ ml:2, textDecoration:'underline' }} >
                  <b>Title: { titleOfPositions[pos.title - 1] }</b>                  
                </Typography>
              )}

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >
                <TextField 
                  variant='outlined'
                  label='UserNo.'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    width: 450,
                  }}
                  value={ longSnParser(pos?.acct.toString() ?? '0' ) }
                />
              </Stack>

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <TextField 
                  variant='outlined'
                  label='Nominator'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ longSnParser(pos?.nominator.toString() ?? '0') }
                />

                <TextField 
                  variant='outlined'
                  label='TitleOfNominator'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  value={ titleOfPositions[(pos?.titleOfNominator ?? 1) -1] }
                />

              </Stack>

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >
                
                {pos && (
                  <TextField 
                    variant='outlined'
                    label='StartDate.'
                    inputProps={{readOnly: true}}
                    size="small"
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    value={ dateParser(pos.startDate.toString()) }
                  />
                )}

                {pos && (
                  <TextField 
                    variant='outlined'
                    label='EndDate'
                    inputProps={{readOnly: true}}
                    size="small"
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    value={ dateParser( pos.endDate.toString() ) }
                  />
                )}

              </Stack>
              <Stack direction={'row'} sx={{ alignItems: 'center' }} >
                {pos && (
                  <GetVotingRule seq={pos.seqOfVR} />
                )}
              </Stack>

            </Stack>

          </Paper>

        </DialogContent>

        <DialogActions>
          <QuitPosition seq={seq} setOpen={setOpen} refresh={refresh} />          
          <Button 
            sx={{m:1, mx:3, p:1, minWidth:128 }}
            variant="outlined"
            onClick={()=>setOpen(false)}
          >
            Close
          </Button>
        </DialogActions>
      
      </Dialog>
    </>
  );
}