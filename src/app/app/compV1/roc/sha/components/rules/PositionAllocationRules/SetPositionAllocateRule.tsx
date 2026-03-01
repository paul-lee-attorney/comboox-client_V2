
import { useEffect, useState } from 'react';
import { DateTimeField } from '@mui/x-date-pickers';
import { 
  Stack,
  TextField,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Toolbar,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  FormHelperText,
} from '@mui/material';
import { AddRule } from '../AddRule';
import { FormResults, defFormResults, longSnParser, onlyInt, stampToUtc, utcToStamp } from '../../../../../../common/toolsKit';
import { ListAlt } from '@mui/icons-material';
import { HexType, MaxSeqNo, MaxUserNo } from '../../../../../../common';

import { getRule, titleOfPositions } from '../../../sha';
import { RulesEditProps } from '../GovernanceRules/SetGovernanceRule';

// ==== Str Interface ====

export interface PosAllocateRule {
  seqOfRule: number ;
  qtyOfSubRule: string ;
  seqOfSubRule: string ;
  removePos: boolean ;
  seqOfPos: string ;
  titleOfPos: string ;
  nominator: string ;
  titleOfNominator: string ;
  seqOfVR: string ;
  endDate: number;
  para: string;
  argu: string;
  data: string; 
}

export function prCodifier(rule: PosAllocateRule, seq:number): HexType {
  let hexRule: HexType = `0x${
    (seq.toString(16).padStart(4, '0')) +
    (Number(rule.qtyOfSubRule).toString(16).padStart(2, '0')) +
    (Number(rule.seqOfSubRule).toString(16).padStart(2, '0')) +
    (rule.removePos ? '01' : '00' ) +
    (Number(rule.seqOfPos).toString(16).padStart(4, '0')) +
    (Number(rule.titleOfPos).toString(16).padStart(4, '0')) +
    (Number(rule.nominator).toString(16).padStart(10, '0')) +
    (Number(rule.titleOfNominator).toString(16).padStart(4, '0')) +
    (Number(rule.seqOfVR).toString(16).padStart(4, '0')) +
    (rule.endDate.toString(16).padStart(12, '0')) +
    '0'.padStart(16, '0')
  }`;
  return hexRule;
} 

export function prParser(hexRule: HexType): PosAllocateRule {
  let rule: PosAllocateRule = {
    seqOfRule: parseInt(hexRule.substring(2, 6), 16), 
    qtyOfSubRule: parseInt(hexRule.substring(6, 8), 16).toString(),
    seqOfSubRule: parseInt(hexRule.substring(8, 10), 16).toString(),
    removePos: hexRule.substring(10, 12) === '01',
    seqOfPos: parseInt(hexRule.substring(12, 16), 16).toString(),
    titleOfPos: parseInt(hexRule.substring(16, 20), 16).toString(),
    nominator: parseInt(hexRule.substring(20, 30), 16).toString(),
    titleOfNominator: parseInt(hexRule.substring(30, 34), 16).toString(),
    seqOfVR: parseInt(hexRule.substring(34, 38), 16).toString(),
    endDate: parseInt(hexRule.substring(38, 50), 16),
    para: parseInt(hexRule.substring(50, 54), 16).toString(),
    argu: parseInt(hexRule.substring(54, 58), 16).toString(),
    data: parseInt(hexRule.substring(58, 66), 16).toString(),
  };

  return rule;
}


export function SetPositionAllocateRule({ sha, seq, isFinalized, time, refresh }: RulesEditProps ) {

  const strDefaultRule: PosAllocateRule = {
    seqOfRule: seq, 
    qtyOfSubRule: (seq - 255).toString(),
    seqOfSubRule: (seq - 255).toString(),
    removePos: false,
    seqOfPos: '0',
    titleOfPos: '5',
    nominator: '0',
    titleOfNominator: '1',
    seqOfVR: '9',
    endDate: 0,
    para: '0',
    argu: '0',
    data: '0',
  };
  
  const [ objPR, setObjPR ] = useState<PosAllocateRule>(strDefaultRule); 
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ open, setOpen ] = useState(false);

  useEffect(()=>{
    getRule(sha, seq).then(
      res => {
        setObjPR(prParser(res));
        // console.log('pr:', prParser(res));
      }
    );
  }, [sha, seq, time]);  

  return (
    <>
      <Button
        variant={objPR && Number(objPR.seqOfPos) > 0 ? 'contained' : 'outlined'}
        startIcon={<ListAlt />}
        fullWidth={true}
        sx={{ m:0.5, minWidth: 248, justifyContent:'start' }}
        onClick={()=>setOpen(true)}      
      >
        Rule No. { seq } 
      </Button>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title"        
      >

        <DialogContent>

          <Paper elevation={3} sx={{
            alignContent:'center', 
            justifyContent:'center', 
            p:1, m:1, 
            border: 1, 
            borderColor:'divider' 
            }} 
          >
            <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center' }} >        

              <Box sx={{ minWidth:600 }} >
                <Toolbar sx={{ textDecoration:'underline' }} >
                  <h4>Rule No. { seq.toString() } - { titleOfPositions[Number(objPR.titleOfPos) - 1] } </h4>
                </Toolbar>
              </Box>

              {!isFinalized && (
                <AddRule 
                  sha={ sha } 
                  rule={ prCodifier(objPR, seq) } 
                  isFinalized={isFinalized}
                  valid={valid}
                  refresh={refresh}
                  setOpen={setOpen}
                />
              )}
              
            </Stack>

            <Stack 
              direction={'column'} 
              spacing={1} 
            >

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <TextField 
                  variant='outlined'
                  size='small'
                  label='QtyOfSubRule'
                  error={ valid['QtyOfSubRule']?.error }
                  helperText={ valid['QtyOfSubRule']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}                  
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('QtyOfSubRule', input, MaxSeqNo, setValid);
                    setObjPR((v) => ({
                      ...v,
                      qtyOfSubRule: input,
                    }));
                  }}
                  value={ objPR.qtyOfSubRule }
                />

                <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="removePos-label">RemovePos ?</InputLabel>
                  <Select
                    labelId="removePos-label"
                    id="removePos-select"
                    label="RemovePos ?"
                    inputProps={{ readOnly: isFinalized }}
                    value={ objPR.removePos ? '1' : '0' }
                    onChange={(e) => setObjPR((v) => ({
                      ...v,
                      removePos: e.target.value == '1',
                    }))}
                  >
                    <MenuItem value={ '1' } > True </MenuItem>
                    <MenuItem value={ '0' } > False </MenuItem>
                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>
                  
                <TextField 
                  variant='outlined'
                  size='small'
                  label='SeqOfPos'
                  error={ valid['SeqOfPos']?.error }
                  helperText={ valid['SeqOfPos']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('SeqOfPos', input, MaxSeqNo, setValid);
                    setObjPR((v) => ({
                      ...v,
                      seqOfPos: input,
                    }));
                  }}
                  value={ objPR.seqOfPos }              
                />

                <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="titleOfPos-label">TitleOfPos</InputLabel>
                  <Select
                    labelId="titleOfPos-label"
                    id="titleOfPos-select"
                    label="TitleOfPos"
                    inputProps={{ readOnly:isFinalized }}
                    value={ objPR.titleOfPos == '0' ? '' : objPR.titleOfPos }
                    onChange={(e) => setObjPR((v) => ({
                      ...v,
                      titleOfPos: e.target.value,
                    }))}
                  >
                    { titleOfPositions.map( (v, i) => (
                      <MenuItem key={v} value={i+1}> { v } </MenuItem>
                    ))}

                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>
 
              </Stack>

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <TextField 
                  variant='outlined'
                  size='small'
                  label='Nominator'
                  error={ valid['Nominator']?.error }
                  helperText={ valid['Nominator']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}           
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('Nominator', input, MaxUserNo, setValid);
                    setObjPR((v) => ({
                      ...v,
                      nominator: input,
                    }));
                  }}
                  value={ isFinalized ? longSnParser(objPR.nominator) : objPR.nominator }                                        
                />

                <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="titleOfNominator-label">TitleOfNominator</InputLabel>
                  <Select
                    labelId="titleOfNominator-label"
                    id="titleOfNominator-select"
                    label="TitleOfNominator"
                    inputProps={{readOnly: isFinalized}}
                    value={ objPR.titleOfNominator == '0' ? '' : objPR.titleOfNominator }
                    onChange={(e) => setObjPR((v) => ({
                      ...v,
                      titleOfNominator: e.target.value,
                    }))}
                  >
                    { titleOfPositions.map( (v, i) => (
                      <MenuItem key={v} value={i+1}> { v } </MenuItem>
                    ))}

                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>

                <TextField 
                  variant='outlined'
                  size='small'
                  label='seqOfVR'
                  error={ valid['SeqOfVR']?.error }
                  helperText={ valid['SeqOfVR']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('SeqOfVR', input, MaxSeqNo, setValid);
                    setObjPR((v) => ({
                      ...v,
                      seqOfVR: input,
                    }));
                  }}
                  value={ objPR.seqOfVR }                                        
                />

                <DateTimeField
                  label='EndDate'
                  size='small'
                  readOnly={isFinalized}
                  helperText=' '
                  sx={{
                    m:1,
                    minWidth: 218,
                  }} 
                  value={ stampToUtc(objPR.endDate) }
                  onChange={(date) => setObjPR((v) => ({
                    ...v,
                    endDate: utcToStamp(date),
                  }))}
                  format='YYYY-MM-DD HH:mm:ss'
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
  )
}
