
import { useEffect, useState } from 'react';

import { Stack, TextField, Paper, Toolbar, Box, FormControl, InputLabel,
  Select, MenuItem, Button, DialogContent, DialogActions, Dialog, FormHelperText,
} from '@mui/material';
import { ListAlt } from '@mui/icons-material';

import { AddRule } from '../AddRule';

import { HexType, MaxByte, MaxRatio, MaxSeqNo, MaxUserNo } from '../../../../../../common';
import { FormResults, defFormResults, longSnParser, onlyInt, onlyNum, } from '../../../../../../common/toolsKit';
import { getRule } from '../../../sha';
import { RulesEditProps } from '../GovernanceRules/SetGovernanceRule';


// ==== Str Interface ====

export interface VotingRule {
  seqOfRule: string;
  qtyOfSubRule: string;
  seqOfSubRule: string;
  authority: string;
  headRatio: string;
  amountRatio: string;
  onlyAttendance: boolean;
  impliedConsent: boolean;
  partyAsConsent: boolean;
  againstShallBuy: boolean;
  frExecDays: string;
  dtExecDays: string;
  dtConfirmDays: string;
  invExitDays: string;
  votePrepareDays: string;
  votingDays: string;
  execDaysForPutOpt: string;
  vetoers: readonly string[];
  para: string;
}

export interface OrgVotingRule {
  seqOfRule: number;
  qtyOfSubRule: number;
  seqOfSubRule: number;
  authority: number;
  headRatio: number;
  amountRatio: number;
  onlyAttendance: boolean;
  impliedConsent: boolean;
  partyAsConsent: boolean;
  againstShallBuy: boolean;
  frExecDays: number;
  dtExecDays: number;
  dtConfirmDays: number;
  invExitDays: number;
  votePrepareDays: number;
  votingDays: number;
  execDaysForPutOpt: number;
  vetoers: readonly number[];
  para: number;
}

export function vrParser(hexVr: HexType):VotingRule {
  let rule: VotingRule = {
    seqOfRule:parseInt(hexVr.substring(2, 6), 16).toString(), 
    qtyOfSubRule:parseInt(hexVr.substring(6, 8), 16).toString(),
    seqOfSubRule:parseInt(hexVr.substring(8, 10), 16).toString(),
    authority: parseInt(hexVr.substring(10, 12), 16).toString(),
    headRatio: (Number(parseInt(hexVr.substring(12, 16), 16)) / 100).toFixed(2).toString(),
    amountRatio: (Number(parseInt(hexVr.substring(16, 20), 16)) / 100).toFixed(2).toString(),
    onlyAttendance: hexVr.substring(20, 22) === '01',
    impliedConsent: hexVr.substring(22, 24) === '01',
    partyAsConsent: hexVr.substring(24, 26) === '01',
    againstShallBuy: hexVr.substring(26, 28) === '01',
    frExecDays: parseInt(hexVr.substring(28, 30), 16).toString(),
    dtExecDays: parseInt(hexVr.substring(30, 32), 16).toString(),
    dtConfirmDays: parseInt(hexVr.substring(32, 34), 16).toString(),
    invExitDays: parseInt(hexVr.substring(34, 36), 16).toString(),
    votePrepareDays: parseInt(hexVr.substring(36, 38), 16).toString(),
    votingDays: parseInt(hexVr.substring(38, 40), 16).toString(),
    execDaysForPutOpt: parseInt(hexVr.substring(40, 42), 16).toString(),
    vetoers: [parseInt(hexVr.substring(42, 52), 16).toString(), parseInt(hexVr.substring(52, 62), 16).toString()],
    para: parseInt(hexVr.substring(62, 66), 16).toString(),
  }
  return rule;
}

export function vrCodifier(objVr: VotingRule, seq: number ): HexType {
  let hexVr: HexType = `0x${
    (seq.toString(16).padStart(4, '0')) +
    (Number(objVr.qtyOfSubRule).toString(16).padStart(2, '0')) +
    (Number(objVr.seqOfSubRule).toString(16).padStart(2, '0')) +
    (Number(objVr.authority).toString(16).padStart(2, '0')) +
    ((Number(objVr.headRatio) * 100).toString(16).padStart(4, '0')) +
    ((Number(objVr.amountRatio) * 100).toString(16).padStart(4, '0')) +
    (objVr.onlyAttendance ? '01' : '00' )+
    (objVr.impliedConsent ? '01' : '00' )+
    (objVr.partyAsConsent ? '01' : '00' )+
    (objVr.againstShallBuy ? '01' : '00' )+
    (Number(objVr.frExecDays).toString(16).padStart(2, '0')) +
    (Number(objVr.dtExecDays).toString(16).padStart(2, '0')) +
    (Number(objVr.dtConfirmDays).toString(16).padStart(2, '0')) +
    (Number(objVr.invExitDays).toString(16).padStart(2, '0')) +
    (Number(objVr.votePrepareDays).toString(16).padStart(2, '0')) +
    (Number(objVr.votingDays).toString(16).padStart(2, '0')) +
    (Number(objVr.execDaysForPutOpt).toString(16).padStart(2, '0')) +
    (Number(objVr.vetoers[0]).toString(16).padStart(10, '0')) +
    (Number(objVr.vetoers[1]).toString(16).padStart(10, '0')) +
    (Number(objVr.para).toString(16).padStart(4, '0')) 
  }`;
  return hexVr;
}

export const authorities:string[] = ['ShareholdersMeeting', 'Board'];

const subTitles: string[] = [
  '- Issue New Share (i.e. Capital Increase "CI")',
  '- Transfer Share to External Invester (i.e. External Transfer "EXT")',
  '- Transfer Share to Other Shareholders (i.e. Internal Transfer "INT")',
  '- Capital Increase and Internal Transfer (i.e. CI & INT)',
  '- Internal and External Transfer (i.e. EXT & INT)',
  '- Capital Increase, External Transfer and Internal Transfer (i.e. CI & EXT & INT)',
  '- Capital Increase and External Transfer (i.e. CI & EXT) ',
  "- Approve Shareholders' Agreement",
  '- Ordinary resolution of Shareholders Meeting',
  '- Special resolution of Shareholders Meeting',
  '- Ordinary resolution of Board Meeting',
  '- Special resolution of Board Meeting',
  '- Newly added Rule'
]

export function SetVotingRule({ sha, seq, isFinalized, time, refresh }: RulesEditProps) {

  const strDefVR: VotingRule =
      { seqOfRule: seq.toString(), 
        qtyOfSubRule: seq.toString(), 
        seqOfSubRule: seq.toString(),
        authority: '1',
        headRatio: '0',
        amountRatio: '0',
        onlyAttendance: false,
        impliedConsent: false,
        partyAsConsent: true,
        againstShallBuy: false,
        frExecDays: '0',
        dtExecDays: '0',
        dtConfirmDays: '0',
        invExitDays: '0',
        votePrepareDays: '0',
        votingDays: '0',
        execDaysForPutOpt: '0',
        vetoers: ['0','0'],
        para: '0',
      };

  let subTitle: string = (seq < 13) ? subTitles[seq - 1] : subTitles[12];

  const [ objVR, setObjVR ] = useState<VotingRule>(strDefVR);   
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ open, setOpen ] = useState(false);

  useEffect(()=>{
    getRule(sha, seq).then(
      res => setObjVR(vrParser(res))
    );
  }, [sha, seq, time])

  return (
    <>
      <Button
        variant={ Number(objVR.seqOfRule) == seq ? 'contained' : 'outlined' }
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
                  <h4>Rule No. { seq } { subTitle } </h4>
                </Toolbar>
              </Box>

              {!isFinalized && (
                <AddRule 
                  sha={ sha } 
                  rule={ vrCodifier(objVR, seq) } 
                  isFinalized={ isFinalized }
                  valid={valid}
                  refresh={ refresh }
                  setOpen={ setOpen }
                />
              )}
              
            </Stack>

            <Stack 
              direction={'column'} 
              spacing={1} 
            >

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="authority-label">Authority</InputLabel>
                  <Select
                    labelId="authority-label"
                    id="authority-select"
                    label="Authority"
                    value={ objVR.authority == '0' ? '' : objVR.authority }
                    inputProps={{readOnly: isFinalized}}
                    onChange={(e) => setObjVR((v) => ({
                      ...v,
                      authority: e.target.value,
                    }))}
                  >
                    <MenuItem value={1}>ShareholdersMeeting</MenuItem>
                    <MenuItem value={2}>BoardMeeting</MenuItem>
                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>

                <TextField 
                  variant='outlined'
                  size='small'
                  label={ 'HeadRatio (%)' }
                  error={ valid['HeadRatio']?.error }
                  helperText={ valid['HeadRatio']?.helpTx ?? ' '}
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('HeadRatio', input, MaxRatio, 2, setValid);
                    setObjVR((v) => ({
                      ...v,
                      headRatio:input,
                    }));
                  }}
                  value={ objVR.headRatio }              
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label={'AmountRatio (%)'}
                  error={ valid['AmountRatio']?.error }
                  helperText={ valid['AmountRatio']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('AmountRatio', input, MaxRatio, 2, setValid);
                    setObjVR((v) => ({
                      ...v,
                      amountRatio: input,
                    }));
                  }}
                  value={ objVR.amountRatio }                               
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label='ExecDaysForPutOpt'
                  error={ valid['ExecDaysForPutOpt']?.error }
                  helperText={ valid['ExecDaysForPutOpt']?.helpTx ?? ' '}
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('ExecDaysForPutOpt', input, MaxSeqNo, setValid);
                    setObjVR((v) => ({
                      ...v,
                      execDaysForPutOpt: input,
                    }));
                  }}
                  value={ objVR.execDaysForPutOpt}                                        
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label='Class'
                  error={ valid['Class']?.error }
                  helperText={ valid['Class']?.helpTx ?? ' '}
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('Class', input, MaxSeqNo, setValid);
                    setObjVR((v) => ({
                      ...v,
                      para: input,
                    }));
                  }}
                  value={ objVR.para } 
                />

              </Stack>

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="onlyAttendance-label">OnlyAttendance ?</InputLabel>
                  <Select
                    labelId="onlyAttendance-label"
                    id="onlyAttendance-select"
                    label="OnlyAttendance ?"
                    inputProps={{ readOnly:isFinalized }}
                    value={ objVR.onlyAttendance ? '1' : '0' }
                    onChange={(e) => setObjVR((v) => ({
                      ...v,
                      onlyAttendance: e.target.value == '1',
                    }))}
                  >
                    <MenuItem value={ '1' } > True </MenuItem>
                    <MenuItem value={ '0' } > False </MenuItem>
                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>

                <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="impliedConsent-label">ImpliedConsent ?</InputLabel>
                  <Select
                    labelId="impliedConsent-label"
                    id="impliedConsent-select"
                    label="ImpliedConsent ?"
                    inputProps={{ readOnly:isFinalized }}
                    value={ objVR.impliedConsent ? '1' : '0' }
                    onChange={(e) => setObjVR((v) => ({
                      ...v,
                      impliedConsent: e.target.value == '1',
                    }))}
                  >
                    <MenuItem value={ '1' } > True </MenuItem>
                    <MenuItem value={ '0' } > False </MenuItem>
                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>

                <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="partyAsConsent-label">PartyAsConsent ?</InputLabel>
                  <Select
                    labelId="partyAsConsent-label"
                    id="partyAsConsent-select"
                    label="PartyAsConsent ?"
                    inputProps={{ readOnly:isFinalized }}
                    value={ objVR.partyAsConsent ? '1' : '0' }
                    onChange={(e) => setObjVR((v) => ({
                      ...v,
                      partyAsConsent: e.target.value == '1',
                    }))}
                  >
                    <MenuItem value={ '1' } > True </MenuItem>
                    <MenuItem value={ '0' } > False </MenuItem>
                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>

                <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="againstShallBuy-label">AgainstShallBuy ?</InputLabel>
                  <Select
                    labelId="againstShallBuy-label"
                    id="againstShallBuy-select"
                    label="AgainstShallBuy ?"
                    inputProps={{ readOnly:isFinalized }}
                    value={ objVR.againstShallBuy ? '1' : '0' }
                    onChange={(e) => setObjVR((v) => ({
                      ...v,
                      againstShallBuy: e.target.value == '1',
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
                  label='Vetoer_1'
                  error={ valid['Vetoer_1']?.error }
                  helperText={ valid['Vetoer_1']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('Vetoer_1', input, MaxUserNo, setValid);
                    setObjVR((v) => {
                      let arr = [...v.vetoers];
                      arr[0] = input;
                      return {...v, vetoers:arr};
                    });
                  }}
                  value={ isFinalized ? longSnParser(objVR.vetoers[0]) : objVR.vetoers[0] }   
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label='Vetoer_2'
                  error={ valid['Vetoer_2']?.error }
                  helperText={ valid['Vetoer_2']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('Vetoer_2', input, MaxUserNo, setValid);
                    setObjVR((v) => {
                      let arr = [...v.vetoers];
                      arr[1] = input;
                      return {...v, vetoers:arr};
                    });
                  }}
                  value={ isFinalized ? longSnParser(objVR.vetoers[1]) : objVR.vetoers[1] }
                />

              </Stack>

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <TextField 
                  variant='outlined'
                  size='small'
                  label='FRExecDays'
                  error={ valid['FRExecDays']?.error }
                  helperText={ valid['FRExecDays']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('FRExecDays', input, MaxByte, setValid);
                    setObjVR((v) => ({
                      ...v,
                      frExecDays: input,
                    }));
                  }}
                  value={ objVR.frExecDays}                                        
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label='DTExecDays'
                  error={ valid['DTExecDays']?.error }
                  helperText={ valid['DTExecDays']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('DTExecDays', input, MaxByte, setValid);
                    setObjVR((v) => ({
                      ...v,
                      dtExecDays: input,
                    }));
                  }}
                  value={ objVR.dtExecDays}                                        
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label='DTConfirmDays'
                  error={ valid['DTConfirmDays']?.error }
                  helperText={ valid['DTConfirmDays']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('DTConfirmDays',input, MaxByte, setValid);
                    setObjVR((v) => ({
                      ...v,
                      dtConfirmDays: input,
                    }));
                  }}
                  value={ objVR.dtConfirmDays}                                        
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label='InvExitDays'
                  error={ valid['InvExitDays']?.error }
                  helperText={ valid['InvExitDays']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('InvExitDays', input, MaxByte, setValid);
                    setObjVR((v) => ({
                      ...v,
                      invExitDays: input,
                    }));
                  }}
                  value={ objVR.invExitDays}                                        
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label='VotePrepareDays'
                  error={ valid['VotePrepareDays']?.error }
                  helperText={ valid['VotePrepareDays']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('VotePrepareDays', input, MaxByte, setValid);
                    setObjVR((v) => ({
                      ...v,
                      votePrepareDays: input,
                    }));
                  }}
                  value={ objVR.votePrepareDays}                                        
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label='VotingDays'
                  error={ valid['VotingDays']?.error }
                  helperText={ valid['VotingDays']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('VotingDays', input, MaxByte, setValid);
                    setObjVR((v) => ({
                      ...v,
                      votingDays: input,
                    }));
                  }}
                  value={ objVR.votingDays}                                        
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
