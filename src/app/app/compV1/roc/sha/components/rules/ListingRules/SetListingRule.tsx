
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
  DialogContent,
  DialogActions,
  Dialog,
  FormHelperText,
} from '@mui/material';
import { AddRule } from '../AddRule';
import { HexType, MaxPrice, MaxSeqNo } from '../../../../../../common';
import { FormResults, bigIntToNum, defFormResults, longDataParser,
  onlyInt, onlyNum, strNumToBigInt, } from '../../../../../../common/toolsKit';

import { ListAlt } from '@mui/icons-material';

import { RulesEditProps } from '../GovernanceRules/SetGovernanceRule';
import { getRule, titleOfPositions } from '../../../sha';

export interface ListingRule {
  seqOfRule: number;
  titleOfIssuer: string;
  classOfShare: string;
  maxTotalPar: string;
  titleOfVerifier: string;
  maxQtyOfInvestors: string;
  ceilingPrice: string;
  floorPrice: string;
  lockupDays: string;
  offPrice: string;
  votingWeight: string;
  distrWeight: string;
}

export var defaultLR: ListingRule = {
  seqOfRule: 0,
  titleOfIssuer: '2',
  classOfShare: '0',
  maxTotalPar: '0',
  titleOfVerifier: '1',
  maxQtyOfInvestors: '0',
  ceilingPrice: '0',
  floorPrice: '0',
  lockupDays: '0',
  offPrice: '0',
  votingWeight: '100',
  distrWeight: '100',
}

export function lrParser(hexLr: HexType):ListingRule {
  let rule: ListingRule = {
    seqOfRule: parseInt(hexLr.substring(2, 6), 16), 
    titleOfIssuer: parseInt(hexLr.substring(6, 10), 16).toString(),
    classOfShare: parseInt(hexLr.substring(10, 14), 16).toString(),
    maxTotalPar: Number('0x' + hexLr.substring(14, 22)).toString(),
    titleOfVerifier: parseInt(hexLr.substring(22, 26), 16).toString(),
    maxQtyOfInvestors: parseInt(hexLr.substring(26, 30), 16).toString(),
    ceilingPrice: bigIntToNum(BigInt('0x' + hexLr.substring(30, 38)), 4),
    floorPrice: bigIntToNum(BigInt('0x' + hexLr.substring(38, 46)), 4),
    lockupDays: parseInt(hexLr.substring(46, 50), 16).toString(),
    offPrice: bigIntToNum(BigInt('0x' + hexLr.substring(50, 54)), 4),
    votingWeight: parseInt(hexLr.substring(54, 58), 16).toString(),
    distrWeight: parseInt(hexLr.substring(58, 62), 16).toString(),
  }
  return rule;
}

export function lrCodifier( objLr: ListingRule, seq:number ): HexType {
  let hexLr: HexType = `0x${
    (Number(seq).toString(16).padStart(4, '0')) +
    (Number(objLr.titleOfIssuer).toString(16).padStart(4, '0')) +
    (Number(objLr.classOfShare).toString(16).padStart(4, '0')) +
    (Number(objLr.maxTotalPar).toString(16).padStart(8, '0')) +
    (Number(objLr.titleOfVerifier).toString(16).padStart(4, '0')) +
    (Number(objLr.maxQtyOfInvestors).toString(16).padStart(4, '0')) +
    (strNumToBigInt(objLr.ceilingPrice, 4).toString(16).padStart(8, '0')) +
    (strNumToBigInt(objLr.floorPrice, 4).toString(16).padStart(8, '0')) +
    (Number(objLr.lockupDays).toString(16).padStart(4, '0')) +
    (strNumToBigInt(objLr.offPrice, 4).toString(16).padStart(4, '0')) +
    Number(objLr.votingWeight).toString(16).padStart(4, '0') +
    Number(objLr.distrWeight).toString(16).padStart(4, '0') +
    '0000'
  }`;
  return hexLr;
}

export function SetListingRule({ sha, seq, isFinalized, time, refresh }: RulesEditProps) {

  // defaultLR = {...defaultLR, seqOfRule: seq};

  const [ objLR, setObjLR ] = useState<ListingRule>(defaultLR);   
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ open, setOpen ] = useState(false);

  useEffect(()=>{
    getRule(sha, seq).then(
      res => setObjLR(lrParser(res))
    );
  }, [sha, seq, time]); 

  return (
    <>
      <Button
        variant={ Number(objLR.seqOfRule) == seq ? 'contained' : 'outlined' }
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
                  <h4>Listing Rule - No. { seq } </h4>
                </Toolbar>
              </Box>

              {!isFinalized && (
                <AddRule
                  sha={ sha }
                  rule={ lrCodifier(objLR, seq) }
                  isFinalized={ isFinalized }
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
                  label='ClassOfShare'
                  error={ valid['ClassOfShare']?.error }
                  helperText={ valid['ClassOfShare']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('ClassOfShare', input, MaxSeqNo, setValid);
                    setObjLR((v) => ({
                      ...v,
                      classOfShare: input,
                    }));
                  }}
                  value={ objLR.classOfShare }
                />

                <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="titleOfIssuer-label">TitleOfIssuer</InputLabel>
                  <Select
                    labelId="titleOfIssuer-label"
                    id="titleOfIssuer-select"
                    label="TitleOfIssuer"
                    inputProps={{readOnly:isFinalized}}
                    value={ objLR.titleOfIssuer == '0' ? '' : objLR.titleOfIssuer }
                    onChange={(e) => setObjLR((v) => ({
                      ...v,
                      titleOfIssuer: e.target.value.toString(),
                    }))}
                  >
                    {titleOfPositions.map((v, i) => (
                      <MenuItem key={i} value={i+1}>{v}</MenuItem>
                    )) }

                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>

                <TextField 
                  variant='outlined'
                  size='small'
                  label={ 'MaxTotalPar' }
                  error={ valid['MaxTotalPar']?.error }
                  helperText={ valid['MaxTotalPar']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('MaxTotalPar', input, MaxPrice, setValid);
                    setObjLR((v) => ({
                      ...v,
                      maxTotalPar: input,
                    }));
                  }}
                  value={ isFinalized ? longDataParser(objLR.maxTotalPar) : objLR.maxTotalPar }
                />

                <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="titleOfVerifier-label">TitleOfVerifier</InputLabel>
                  <Select
                    labelId="titleOfVerifier-label"
                    id="titleOfVerifier-select"
                    label="TitleOfIssuer"
                    inputProps={{readOnly:isFinalized}}
                    value={ objLR.titleOfVerifier == '0' ? '' : objLR.titleOfVerifier }
                    onChange={(e) => setObjLR((v) => ({
                      ...v,
                      titleOfVerifier: e.target.value.toString(),
                    }))}
                  >
                
                    {titleOfPositions.map((v, i) => (
                      <MenuItem key={i} value={i+1}>{v}</MenuItem>
                    )) }

                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>

                <TextField 
                  variant='outlined'
                  size='small'
                  label='MaxQtyOfInvestors'
                  inputProps={{readOnly: isFinalized}}
                  error={ valid['MaxQtyOfInvestors']?.error }
                  helperText={ valid['MaxQtyOfInvestors']?.helpTx ?? ' ' }
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('MaxQtyOfInvestors', input, MaxSeqNo, setValid);
                    setObjLR((v) => ({
                      ...v,
                      maxQtyOfInvestors: input,
                    }));
                  }}
                  value={ objLR.maxQtyOfInvestors }
                />

              </Stack>

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <TextField 
                  variant='outlined'
                  size='small'
                  label={'CeilingPrice '}
                  error={ valid['CeilingPrice']?.error }
                  helperText={ valid['CeilingPrice']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('CeilingPrice', input, MaxPrice, 4, setValid);
                    setObjLR((v) => ({
                      ...v,
                      ceilingPrice: input,
                    }));
                  }}
                  value={ isFinalized ? longDataParser(objLR.ceilingPrice) : objLR.ceilingPrice }   
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label={'FloorPrice ' }
                  error={ valid['FloorPrice']?.error }
                  helperText={ valid['FloorPrice']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('FloorPrice', input, MaxPrice, 4, setValid);
                    setObjLR((v) => ({
                      ...v,
                      floorPrice: input,
                    }));
                  }}
                  value={ isFinalized ? longDataParser(objLR.floorPrice) : objLR.floorPrice }   
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label={'OffPrice '}
                  error={ valid['OffPrice']?.error }
                  helperText={ valid['OffPrice']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('OffPrice', input, MaxSeqNo, 4, setValid);
                    setObjLR((v) => ({
                      ...v,
                      offPrice: input,
                    }));
                  }}
                  value={ isFinalized ? longDataParser(objLR.offPrice) : objLR.offPrice }
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label='LockupDays'
                  error={ valid['LockupDays']?.error }
                  helperText={ valid['LockupDays']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('LockupDays', input, MaxSeqNo, setValid);
                    setObjLR((v) => ({
                      ...v,
                      lockupDays: input,
                    }));
                  }}
                  value={ objLR.lockupDays }   
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label='VotingWeight (%)'
                  error={ valid['VotingWeight']?.error }
                  helperText={ valid['VotingWeight']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('VotingWeight', input, MaxSeqNo, setValid);
                    setObjLR((v) => ({
                      ...v,
                      votingWeight: input,
                    }));
                  }}
                  value={ objLR.votingWeight }   
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label='DistributionWeight (%)'
                  error={ valid['DistributionWeight']?.error }
                  helperText={ valid['DistributionWeight']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('DistributionWeight', input, MaxSeqNo, setValid);
                    setObjLR((v) => ({
                      ...v,
                      distrWeight: input,
                    }));
                  }}
                  value={ objLR.distrWeight }
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
