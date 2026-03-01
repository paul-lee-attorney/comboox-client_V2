
import { useEffect, useState } from 'react';
import { 
  Stack,
  TextField,
  Paper,
  Toolbar,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  FormHelperText,
} from '@mui/material';
import { AddRule } from '../AddRule'
import { HexType, MaxUserNo } from '../../../../../../common';
import { ListAlt } from '@mui/icons-material';
import { FormResults, defFormResults, longSnParser, onlyInt } from '../../../../../../common/toolsKit';
import { RulesEditProps } from '../GovernanceRules/SetGovernanceRule';
import { getRule } from '../../../sha';

export interface FirstRefusalRule {
  seqOfRule: string;
  qtyOfSubRule: string;
  seqOfSubRule: string;
  typeOfDeal: string;
  membersEqual: boolean;
  proRata: boolean;
  basedOnPar: boolean;
  rightholders: string[];
  para: string;
  argu: string;
}

export function frCodifier(rule: FirstRefusalRule, seq: number): HexType {
  let hexFR: HexType = `0x${
    (seq.toString(16).padStart(4, '0')) +
    (Number(rule.qtyOfSubRule).toString(16).padStart(2, '0')) +
    (Number(rule.seqOfSubRule).toString(16).padStart(2, '0')) +
    (Number(rule.typeOfDeal).toString(16).padStart(2, '0')) +
    (rule.membersEqual ? '01' : '00') +
    (rule.proRata ? '01' : '00') +
    (rule.basedOnPar ? '01' : '00') +
    (Number(rule.rightholders[0]).toString(16).padStart(10, '0')) +
    (Number(rule.rightholders[1]).toString(16).padStart(10, '0')) +
    (Number(rule.rightholders[2]).toString(16).padStart(10, '0')) +
    (Number(rule.rightholders[3]).toString(16).padStart(10, '0')) +
    (Number(rule.para).toString(16).padStart(4, '0')) +
    (Number(rule.argu).toString(16).padStart(4, '0'))
  }`;

  return hexFR;
}

export function frParser(hexRule: HexType ): FirstRefusalRule {
  let rule: FirstRefusalRule = {
    seqOfRule: parseInt(hexRule.substring(2, 6), 16).toString(), 
    qtyOfSubRule: parseInt(hexRule.substring(6, 8), 16).toString(),
    seqOfSubRule: parseInt(hexRule.substring(8, 10), 16).toString(),
    typeOfDeal: parseInt(hexRule.substring(10, 12), 16).toString(),
    membersEqual: hexRule.substring(12, 14) === '01',
    proRata: hexRule.substring(14, 16) === '01',
    basedOnPar: hexRule.substring(16, 18) === '01',
    rightholders: [
      parseInt(hexRule.substring(18, 28), 16).toString(),
      parseInt(hexRule.substring(28, 38), 16).toString(),
      parseInt(hexRule.substring(38, 48), 16).toString(),
      parseInt(hexRule.substring(48, 58), 16).toString(),
    ],
    para: parseInt(hexRule.substring(58, 62), 16).toString(),
    argu: parseInt(hexRule.substring(62, 66), 16).toString(),
  }; 
  
  return rule;
} 

export const typesOfDeal = ['Capital Increase', 'External Transfer', 'Internal Transfer', 
  'CI & EXT', 'EXT & INT', 'CI & EXT & INT', 'CI & EXT'];

export function SetFirstRefusalRule({ sha, seq, isFinalized, time, refresh }: RulesEditProps) {

  const defFR: FirstRefusalRule = { 
    seqOfRule: seq.toString(), 
    qtyOfSubRule: (seq - 511).toString(), 
    seqOfSubRule: (seq - 511).toString(),
    typeOfDeal: '2',
    membersEqual: true,
    proRata: true,
    basedOnPar: false,
    rightholders: ['0','0','0','0'],
    para: '0',
    argu: '0',
  };

  const [ objFR, setObjFR ] = useState<FirstRefusalRule>(defFR); 
  const [ open, setOpen ] = useState(false);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  useEffect(()=>{
    getRule(sha, seq).then(
      res => setObjFR(frParser(res))
    );
  }, [sha, seq, time]);

  return (
    <>
      <Button
        variant={ objFR && Number(objFR.seqOfRule) > 0 ? "contained" : "outlined" }
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
                  <h4>Rule No. {seq} - FirstRefusalRight for { typesOfDeal[Number(objFR.typeOfDeal) -1] }  </h4>
                </Toolbar>
              </Box>

              {!isFinalized && (
                <AddRule 
                  sha={ sha }
                  rule={ frCodifier(objFR, seq) }
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

                <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="typeOfDeal-label">TypeOfDeal</InputLabel>
                  <Select
                    labelId="typeOfDeal-label"
                    id="typeOfDeal-select"
                    label="TypeOfDeal"
                    inputProps={{readOnly: isFinalized}}
                    value={ Number(objFR.typeOfDeal) }
                    onChange={(e) => setObjFR((v) => ({
                      ...v,
                      typeOfDeal: e.target.value.toString(),
                    }))}
                  >
                    {typesOfDeal.map((v,i) => (
                      <MenuItem key={i} value={i+1}>{v}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>


                <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="membersEqual-label">MembersEqual ?</InputLabel>
                  <Select
                    labelId="membersEqual-label"
                    id="membersEqual-select"
                    label="MembersEqual ?"
                    inputProps={{readOnly: isFinalized}}
                    value={ objFR?.membersEqual ? '1' : '0' }
                    onChange={(e) => setObjFR((v) => ({
                      ...v,
                      membersEqual: e.target.value == '1',
                    }))}
                  >
                    <MenuItem value={'1'}>True</MenuItem>
                    <MenuItem value={'0'}>False</MenuItem>
                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>


                <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="proRata-label">ProRata ?</InputLabel>
                  <Select
                    labelId="proRata-label"
                    id="proRata-select"
                    label="ProRata ?"
                    inputProps={{readOnly: isFinalized}}
                    value={ objFR.proRata ? '1' : '0' }
                    onChange={(e) => setObjFR((v) => ({
                      ...v,
                      proRata: e.target.value == '1',
                    }))}
                  >
                    <MenuItem value={'1'}>True</MenuItem>
                    <MenuItem value={'0'}>False</MenuItem>
                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>

                <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="basedOnPar-label">BasedOnPar ?</InputLabel>
                  <Select
                    labelId="basedOnPar-label"
                    id="basedOnPar-select"
                    label="BasedOnPar ?"
                    inputProps={{readOnly: isFinalized}}
                    value={ objFR.basedOnPar ? '1' : '0' }
                    onChange={(e) => setObjFR((v) => ({
                      ...v,
                      basedOnPar: e.target.value == '1',
                    }))}
                  >
                    <MenuItem value={'1'}>True</MenuItem>
                    <MenuItem value={'0'}>False</MenuItem>
                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>

              </Stack>

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <TextField 
                  variant='outlined'
                  size='small'
                  label='Rightholder_1'
                  error={ valid['Rightholder_1']?.error }
                  helperText={ valid['Rightholder_1']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('Rightholder_1', input, MaxUserNo, setValid);
                    setObjFR((v) => {
                      let holders = [...v.rightholders];
                      holders[0] = input;
                      return {...v, rightholders: holders};
                    });
                  }}
                  value={ isFinalized ? longSnParser(objFR.rightholders[0]) : objFR.rightholders[0] }
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label='Rightholder_2'
                  error={ valid['Rightholder_2']?.error }
                  helperText={ valid['Rightholder_2']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('Rightholder_2', input, MaxUserNo, setValid);
                    setObjFR((v) => {
                      let holders = [...v.rightholders];
                      holders[1] = input;
                      return {...v, rightholders: holders};
                    });
                  }}
                  value={ isFinalized ? longSnParser(objFR.rightholders[1]) : objFR.rightholders[1] }
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label='Rightholder_3'
                  error={ valid['Rightholder_3']?.error }
                  helperText={ valid['Rightholder_3']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('Rightholder_3', input, MaxUserNo, setValid);
                    setObjFR((v) => {
                      let holders = [...v.rightholders];
                      holders[2] = input;
                      return {...v, rightholders: holders};
                    });
                  }}
                  value={ isFinalized ? longSnParser(objFR.rightholders[2]) : objFR.rightholders[2] }
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label='Rightholder_4'
                  error={ valid['Rightholder_4']?.error }
                  helperText={ valid['Rightholder_4']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('Rightholder_4', input, MaxUserNo, setValid);
                    setObjFR((v) => {
                      let holders = [...v.rightholders];
                      holders[3] = input;
                      return {...v, rightholders: holders};
                    });
                  }}
                  value={ isFinalized ? longSnParser(objFR.rightholders[3]) : objFR.rightholders[3] }
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
