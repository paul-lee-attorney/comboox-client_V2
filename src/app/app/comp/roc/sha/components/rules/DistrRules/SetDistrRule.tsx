
import { useEffect, useState } from 'react';

import { Stack, TextField, Paper, Toolbar, Box, FormControl, InputLabel,
  Select, MenuItem, Button, DialogContent, DialogActions, Dialog, FormHelperText,
} from '@mui/material';
import { ListAlt } from '@mui/icons-material';

import { AddRule } from '../AddRule';

import { HexType, MaxRatio, MaxSeqNo, } from '../../../../../../common';
import { FormResults, defFormResults, onlyInt, onlyNum, } from '../../../../../../common/toolsKit';
import { getRule } from '../../../sha';
import { RulesEditProps } from '../GovernanceRules/SetGovernanceRule';


// ==== Str Interface ====

export interface DistrRule {
  seqOfRule: string;
  typeOfDistr: string;
  numOfTiers: string;
  isCumulative: boolean;
  refundPrincipal: boolean;
  tiers: readonly string[];
  rates: readonly string[];
}

export interface OrgDistrRule {
  seqOfRule: number;
  typeOfDistr: number;
  numOfTiers: number;
  isCumulative: boolean;
  refundPrincipal: boolean;
  tiers: readonly number[];
  rates: readonly number[];
}

export function drParser(hexDr: HexType):DistrRule {
  let rule: DistrRule = {
    seqOfRule:parseInt(hexDr.substring(2, 6), 16).toString(), 
    typeOfDistr:parseInt(hexDr.substring(6, 8), 16).toString(),
    numOfTiers:parseInt(hexDr.substring(8, 10), 16).toString(),
    isCumulative: hexDr.substring(10, 12) === '01',
    refundPrincipal: hexDr.substring(12, 14) === '01',
    tiers: [
      parseInt(hexDr.substring(14, 18), 16).toString(), parseInt(hexDr.substring(18, 22), 16).toString(),
      parseInt(hexDr.substring(22, 26), 16).toString(), parseInt(hexDr.substring(26, 30), 16).toString(),
      parseInt(hexDr.substring(30, 34), 16).toString(), parseInt(hexDr.substring(34, 38), 16).toString(),
      parseInt(hexDr.substring(38, 42), 16).toString(), 
    ],
    rates: [
      (Number(parseInt(hexDr.substring(42, 46), 16)) / 100).toFixed(2).toString(), (Number(parseInt(hexDr.substring(46, 50), 16)) / 100).toFixed(2).toString(),
      (Number(parseInt(hexDr.substring(50, 54), 16)) / 100).toFixed(2).toString(), (Number(parseInt(hexDr.substring(54, 58), 16)) / 100).toFixed(2).toString(), 
      (Number(parseInt(hexDr.substring(58, 62), 16)) / 100).toFixed(2).toString(), (Number(parseInt(hexDr.substring(62, 66), 16)) / 100).toFixed(2).toString(), 
    ],
  }
  return rule;
}

export function drCodifier(objDr: DistrRule, seq: number ): HexType {
  let hexDr: HexType = `0x${
    (seq.toString(16).padStart(4, '0')) +
    (Number(objDr.typeOfDistr).toString(16).padStart(2, '0')) +
    (Number(objDr.numOfTiers).toString(16).padStart(2, '0')) +
    (objDr.isCumulative ? '01' : '00' )+
    (objDr.refundPrincipal ? '01' : '00' ) +
    (Number(objDr.tiers[0]).toString(16).padStart(4, '0')) +
    (Number(objDr.tiers[1]).toString(16).padStart(4, '0')) +
    (Number(objDr.tiers[2]).toString(16).padStart(4, '0')) +
    (Number(objDr.tiers[3]).toString(16).padStart(4, '0')) +
    (Number(objDr.tiers[4]).toString(16).padStart(4, '0')) +
    (Number(objDr.tiers[5]).toString(16).padStart(4, '0')) +
    (Number(objDr.tiers[6]).toString(16).padStart(4, '0')) +
    (Number(objDr.rates[0]) * 100).toString(16).padStart(4, '0') +
    (Number(objDr.rates[1]) * 100).toString(16).padStart(4, '0') +
    (Number(objDr.rates[2]) * 100).toString(16).padStart(4, '0') +
    (Number(objDr.rates[3]) * 100).toString(16).padStart(4, '0') +
    (Number(objDr.rates[4]) * 100).toString(16).padStart(4, '0') +
    (Number(objDr.rates[5]) * 100).toString(16).padStart(4, '0')
  }`;
  return hexDr;
}

export const typeOfDistr:string[] = [
  'Pro Rata', 'Interests Front', 'Principal Front', 'Huddle Carry'
]

export function SetDistrRule({ sha, seq, isFinalized, time, refresh }: RulesEditProps) {

  const strDefDR: DistrRule =
      { seqOfRule: seq.toString(), 
        typeOfDistr: '0', 
        numOfTiers: '0',
        isCumulative: false,
        refundPrincipal: false,
        tiers: ['0','0','0','0','0','0'],
        rates: ['0','0','0','0','0','0','0'],
      };

  const [ objDR, setObjDR ] = useState<DistrRule>(strDefDR);   
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ open, setOpen ] = useState(false);

  useEffect(()=>{
    getRule(sha, seq).then(
      res => setObjDR(drParser(res))
    );
  }, [sha, seq, time])

  return (
    <>
      <Button
        variant={ Number(objDR.seqOfRule) == seq ? 'contained' : 'outlined' }
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
                  <h4>Rule No. { seq } </h4>
                </Toolbar>
              </Box>

              {!isFinalized && (
                <AddRule 
                  sha={ sha } 
                  rule={ drCodifier(objDR, seq) } 
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
                  <InputLabel id="authority-label">TypeOfDistribution</InputLabel>
                  <Select
                    labelId="authority-label"
                    id="authority-select"
                    label="TypeOfDistribution"
                    value={ objDR.typeOfDistr }
                    inputProps={{readOnly: isFinalized}}
                    onChange={(e) => setObjDR((v) => ({
                      ...v,
                      typeOfDistr: e.target.value,
                    }))}
                  >
                    {typeOfDistr.map((v,i) => (
                      <MenuItem key={i} value={i}>{v}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>

                <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="authority-label">IsCumulative?</InputLabel>
                  <Select
                    labelId="authority-label"
                    id="authority-select"
                    label="IsCumulative"
                    value={ objDR.isCumulative ? '1' : '0' }
                    inputProps={{readOnly: isFinalized}}
                    onChange={(e) => setObjDR((v) => ({
                      ...v,
                      isCumulative: e.target.value == '1',
                    }))}
                  >
                    <MenuItem value={'0'}>No</MenuItem>
                    <MenuItem value={'1'}>Yes</MenuItem>
                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>

                <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
                  <InputLabel id="authority-label">RefundPrincipal?</InputLabel>
                  <Select
                    labelId="authority-label"
                    id="authority-select"
                    label="RefundPrincipal"
                    value={ objDR.refundPrincipal ? '1' :'0' }
                    inputProps={{readOnly: isFinalized}}
                    onChange={(e) => setObjDR((v) => ({
                      ...v,
                      refundPrincipal: e.target.value == '1',
                    }))}
                  >
                    <MenuItem value={'0'}>No</MenuItem>
                    <MenuItem value={'1'}>Yes</MenuItem>
                  </Select>
                  <FormHelperText>{' '}</FormHelperText>
                </FormControl>

                <TextField 
                  variant='outlined'
                  size='small'
                  label={ 'NumOfTiers' }
                  error={ valid['NumOfTiers']?.error }
                  helperText={ valid['NumOfTiers']?.helpTx ?? ' '}
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('NumOfTiers', input, MaxSeqNo, setValid);
                    setObjDR((v) => ({
                      ...v,
                      numOfTiers:input,
                    }));
                  }}
                  value={ objDR.numOfTiers }
                />

                {objDR.typeOfDistr == '3' && (
                  <TextField 
                    variant='outlined'
                    size='small'
                    label={'Tier_0'}
                    error={ valid['Tier_0']?.error }
                    helperText={ valid['Tier_0']?.helpTx ?? ' ' }
                    inputProps={{readOnly: isFinalized}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyInt('Tier_0', input, MaxSeqNo, setValid);
                      setObjDR((v) => {
                        let arr = [...v.tiers];
                        arr[0] = input;
                        return {...v, tiers:arr};
                      });
                    }}
                    value={ objDR.tiers[0] }
                  />
                )}

              </Stack>

              {objDR.typeOfDistr != '3' && (
                <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                  <TextField 
                    variant='outlined'
                    size='small'
                    label={'Tier_0'}
                    error={ valid['Tier_0']?.error }
                    helperText={ valid['Tier_0']?.helpTx ?? ' ' }
                    inputProps={{readOnly: isFinalized}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyInt('Tier_0', input, MaxSeqNo, setValid);
                      setObjDR((v) => {
                        let arr = [...v.tiers];
                        arr[0] = input;
                        return {...v, tiers:arr};
                      });
                    }}
                    value={ objDR.tiers[0] }
                  />

                  <TextField 
                    variant='outlined'
                    size='small'
                    label={'Tier_1'}
                    error={ valid['Tier_1']?.error }
                    helperText={ valid['Tier_1']?.helpTx ?? ' ' }
                    inputProps={{readOnly: isFinalized}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyInt('Tier_1', input, MaxSeqNo, setValid);
                      setObjDR((v) => {
                        let arr = [...v.tiers];
                        arr[1] = input;
                        return {...v, tiers:arr};
                      });
                    }}
                    value={ objDR.tiers[1] }
                  />

                  <TextField 
                    variant='outlined'
                    size='small'
                    label={'Tier_2'}
                    error={ valid['Tier_2']?.error }
                    helperText={ valid['Tier_2']?.helpTx ?? ' ' }
                    inputProps={{readOnly: isFinalized}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyInt('Tier_2', input, MaxSeqNo, setValid);
                      setObjDR((v) => {
                        let arr = [...v.tiers];
                        arr[2] = input;
                        return {...v, tiers:arr};
                      });
                    }}
                    value={ objDR.tiers[2] }
                  />

                  <TextField 
                    variant='outlined'
                    size='small'
                    label={'Tier_3'}
                    error={ valid['Tier_3']?.error }
                    helperText={ valid['Tier_3']?.helpTx ?? ' ' }
                    inputProps={{readOnly: isFinalized}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyInt('Tier_3', input, MaxSeqNo, setValid);
                      setObjDR((v) => {
                        let arr = [...v.tiers];
                        arr[3] = input;
                        return {...v, tiers:arr};
                      });
                    }}
                    value={ objDR.tiers[3] }
                  />

                  <TextField 
                    variant='outlined'
                    size='small'
                    label={'Tier_4'}
                    error={ valid['Tier_4']?.error }
                    helperText={ valid['Tier_4']?.helpTx ?? ' ' }
                    inputProps={{readOnly: isFinalized}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyInt('Tier_4', input, MaxSeqNo, setValid);
                      setObjDR((v) => {
                        let arr = [...v.tiers];
                        arr[4] = input;
                        return {...v, tiers:arr};
                      });
                    }}
                    value={ objDR.tiers[4] }
                  />                

                  <TextField 
                    variant='outlined'
                    size='small'
                    label={'Tier_5'}
                    error={ valid['Tier_5']?.error }
                    helperText={ valid['Tier_5']?.helpTx ?? ' ' }
                    inputProps={{readOnly: isFinalized}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyInt('Tier_5', input, MaxSeqNo, setValid);
                      setObjDR((v) => {
                        let arr = [...v.tiers];
                        arr[5] = input;
                        return {...v, tiers:arr};
                      });
                    }}
                    value={ objDR.tiers[5] }
                  />

                  {objDR.typeOfDistr == '3' && (
                    <TextField 
                      variant='outlined'
                      size='small'
                      label={'Tier_6'}
                      error={ valid['Tier_6']?.error }
                      helperText={ valid['Tier_6']?.helpTx ?? ' ' }
                      inputProps={{readOnly: isFinalized}}
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      onChange={(e) => {
                        let input = e.target.value;
                        onlyInt('Tier_6', input, MaxSeqNo, setValid);
                        setObjDR((v) => {
                          let arr = [...v.tiers];
                          arr[6] = input;
                          return {...v, tiers:arr};
                        });
                      }}
                      value={ objDR.tiers[6] }
                    />
                  )}

                </Stack>
              )}

              {objDR.typeOfDistr == '3' && (
                <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                  <TextField 
                    variant='outlined'
                    size='small'
                    label={'Tier_1 Ratio (%)'}
                    error={ valid['Tier_1']?.error }
                    helperText={ valid['Tier_1']?.helpTx ?? ' ' }
                    inputProps={{readOnly: isFinalized}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyNum('Tier_1', input, MaxRatio, 2, setValid);
                      setObjDR((v) => {
                        let arr = [...v.tiers];
                        arr[1] = (Number(input) * 100).toString();
                        return {...v, tiers:arr};
                      });
                    }}
                    value={ (Number(objDR.tiers[1]) / 100).toFixed(2) }
                  />

                  <TextField 
                    variant='outlined'
                    size='small'
                    label={'Tier_2 (%)'}
                    error={ valid['Tier_2']?.error }
                    helperText={ valid['Tier_2']?.helpTx ?? ' ' }
                    inputProps={{readOnly: isFinalized}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyNum('Tier_2', input, MaxRatio, 2, setValid);
                      setObjDR((v) => {
                        let arr = [...v.tiers];
                        arr[2] = (Number(input) * 100).toString();
                        return {...v, tiers:arr};
                      });
                    }}
                    value={ (Number(objDR.tiers[2]) / 100).toFixed(2) }
                  />

                  <TextField 
                    variant='outlined'
                    size='small'
                    label={'Tier_3 (%)'}
                    error={ valid['Tier_3']?.error }
                    helperText={ valid['Tier_3']?.helpTx ?? ' ' }
                    inputProps={{readOnly: isFinalized}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyNum('Tier_3', input, MaxRatio, 2, setValid);
                      setObjDR((v) => {
                        let arr = [...v.tiers];
                        arr[3] = (Number(input) * 100).toString();
                        return {...v, tiers:arr};
                      });
                    }}
                    value={ (Number(objDR.tiers[3]) / 100).toFixed(2) }
                  />

                  <TextField 
                    variant='outlined'
                    size='small'
                    label={'Tier_4 (%)'}
                    error={ valid['Tier_4']?.error }
                    helperText={ valid['Tier_4']?.helpTx ?? ' ' }
                    inputProps={{readOnly: isFinalized}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyNum('Tier_4', input, MaxRatio, 2, setValid);
                      setObjDR((v) => {
                        let arr = [...v.tiers];
                        arr[4] = (Number(input) * 100).toString();
                        return {...v, tiers:arr};
                      });
                    }}
                    value={ (Number(objDR.tiers[4]) / 100).toFixed(2) }
                  />                

                  <TextField 
                    variant='outlined'
                    size='small'
                    label={'Tier_5 (%)'}
                    error={ valid['Tier_5']?.error }
                    helperText={ valid['Tier_5']?.helpTx ?? ' ' }
                    inputProps={{readOnly: isFinalized}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyNum('Tier_5', input, MaxRatio, 2, setValid);
                      setObjDR((v) => {
                        let arr = [...v.tiers];
                        arr[5] = (Number(input) * 100).toString();
                        return {...v, tiers:arr};
                      });
                    }}
                    value={ (Number(objDR.tiers[5]) / 100).toFixed(2) }
                  />

                  <TextField 
                    variant='outlined'
                    size='small'
                    label={'Tier_6 (%)'}
                    error={ valid['Tier_6']?.error }
                    helperText={ valid['Tier_6']?.helpTx ?? ' ' }
                    inputProps={{readOnly: isFinalized}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyNum('Tier_6', input, MaxRatio, 2, setValid);
                      setObjDR((v) => {
                        let arr = [...v.tiers];
                        arr[6] = (Number(input) * 100).toString();
                        return {...v, tiers:arr};
                      });
                    }}
                    value={ (Number(objDR.tiers[6]) / 100).toFixed(2) }
                  />

                </Stack>
              )}



              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <TextField 
                  variant='outlined'
                  size='small'
                  label={'Rate_0 (%)'}
                  error={ valid['Rate_0']?.error }
                  helperText={ valid['Rate_0']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('Rate_0', input, MaxRatio, 2, setValid);
                    setObjDR((v) => {
                      let arr = [...v.rates];
                      arr[0] = input;
                      return {...v, rates:arr};
                    });
                  }}
                  value={ objDR.rates[0] }
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label={'Rate_1 (%)'}
                  error={ valid['Rate_1']?.error }
                  helperText={ valid['Rate_1']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('Rate_1', input, MaxRatio, 2, setValid);
                    setObjDR((v) => {
                      let arr = [...v.rates];
                      arr[1] = input;
                      return {...v, rates:arr};
                    });
                  }}
                  value={ objDR.rates[1] }
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label={'Rate_2 (%)'}
                  error={ valid['Rate_2']?.error }
                  helperText={ valid['Rate_2']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('Rate_2', input, MaxRatio, 2, setValid);
                    setObjDR((v) => {
                      let arr = [...v.rates];
                      arr[2] = input;
                      return {...v, rates:arr};
                    });
                  }}
                  value={ objDR.rates[2] }
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label={'Rate_3 (%)'}
                  error={ valid['Rate_3']?.error }
                  helperText={ valid['Rate_3']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('Rate_3', input, MaxRatio, 2, setValid);
                    setObjDR((v) => {
                      let arr = [...v.rates];
                      arr[3] = input;
                      return {...v, rates:arr};
                    });
                  }}
                  value={ objDR.rates[3] }
                />

                <TextField 
                  variant='outlined'
                  size='small'
                  label={'Rate_4 (%)'}
                  error={ valid['Rate_4']?.error }
                  helperText={ valid['Rate_4']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('Rate_4', input, MaxRatio, 2, setValid);
                    setObjDR((v) => {
                      let arr = [...v.rates];
                      arr[4] = input;
                      return {...v, rates:arr};
                    });
                  }}
                  value={ objDR.rates[4] }
                />                

                <TextField 
                  variant='outlined'
                  size='small'
                  label={'Rate_5 (%)'}
                  error={ valid['Rate_5']?.error }
                  helperText={ valid['Rate_5']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('Rate_5', input, MaxRatio, 2, setValid);
                    setObjDR((v) => {
                      let arr = [...v.rates];
                      arr[5] = input;
                      return {...v, rates:arr};
                    });
                  }}
                  value={ objDR.rates[5] }
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
