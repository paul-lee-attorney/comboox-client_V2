
import { useEffect, useState } from 'react';
import { 
  Stack,
  TextField,
  Paper,
  Box,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogContent,
  FormHelperText,
  DialogActions,
} from '@mui/material';
import { ListAlt } from '@mui/icons-material';
import { HexType, MaxByte, MaxUserNo } from '../../../../../../common';
import { AddRule } from '../AddRule';
import { FormResults, defFormResults, longSnParser, onlyInt } from '../../../../../../common/toolsKit';
import { RulesEditProps } from '../GovernanceRules/SetGovernanceRule';
import { getRule } from '../../../sha';

export interface GroupUpdateOrder {
  seqOfRule: string;
  qtyOfSubRule: string;
  seqOfSubRule: string;
  addMember: boolean;
  groupRep: string;
  members: string[];
  para: string;
}

export function guoCodifier(order: GroupUpdateOrder, seq:number):HexType {
  let hexGuo: HexType = `0x${
    (seq.toString(16).padStart(4, '0')) +
    (Number(order.qtyOfSubRule).toString(16).padStart(2, '0')) +
    (Number(order.seqOfSubRule).toString(16).padStart(2, '0')) +
    (order.addMember ? '01' : '00') +
    (Number(order.groupRep).toString(16).padStart(10, '0')) +
    (Number(order.members[0]).toString(16).padStart(10, '0')) +
    (Number(order.members[1]).toString(16).padStart(10, '0')) +
    (Number(order.members[2]).toString(16).padStart(10, '0')) +
    (Number(order.members[3]).toString(16).padStart(10, '0')) +
    (Number(order.para).toString(16).padStart(4, '0'))
  }`;

  return hexGuo;
}

export function guoParser(hexOrder: HexType): GroupUpdateOrder {
  let order: GroupUpdateOrder = {
    seqOfRule: parseInt(hexOrder.substring(2, 6), 16).toString(), 
    qtyOfSubRule: parseInt(hexOrder.substring(6, 8), 16).toString(),
    seqOfSubRule: parseInt(hexOrder.substring(8, 10), 16).toString(),
    addMember: hexOrder.substring(10, 12) === '01',
    groupRep: parseInt(hexOrder.substring(12, 22), 16).toString(),
    members: [
      parseInt(hexOrder.substring(22, 32), 16).toString(),
      parseInt(hexOrder.substring(32, 42), 16).toString(),
      parseInt(hexOrder.substring(42, 52), 16).toString(),
      parseInt(hexOrder.substring(52, 62), 16).toString(),
    ],
    para: parseInt(hexOrder.substring(62, 66), 16).toString(),
  }

  return order;
}

export function SetGroupUpdateOrder({ sha, seq, isFinalized, time, refresh }: RulesEditProps) {

  const defOrder: GroupUpdateOrder = {
    seqOfRule: seq.toString(),
    qtyOfSubRule: (seq - 767).toString(),
    seqOfSubRule: (seq - 767).toString(),
    addMember: true,
    groupRep: '0',
    members: ['0', '0', '0', '0'],
    para: '0',
  };

  const [ objGuo, setObjGuo ] = useState<GroupUpdateOrder>(defOrder); 
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ open, setOpen ] = useState<boolean>(false);

  useEffect(()=>{
    getRule(sha, seq).then(
      res => {
        setObjGuo(guoParser(res));
        // console.log('guo: ', guoParser(res));
      }
    );
  }, [sha, seq, time]);

  return (
    <>
      <Button
        variant={objGuo && Number(objGuo.groupRep) > 0 ? 'contained' : 'outlined'}
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

          <Paper 
            elevation={3} 
            sx={{
              alignContent:'center', 
              justifyContent:'center', 
              p:1, m:1, 
              border: 1, 
              borderColor:'divider' 
              }} 
          >
            <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center' }} >        
              <Box sx={{ minWidth:600 }} >
                <Toolbar>
                  <h4>Rule No. { seq.toString() } </h4>
                </Toolbar>
              </Box>

              {!isFinalized && (
                <AddRule 
                  sha={ sha }
                  rule={ guoCodifier(objGuo, seq) }
                  isFinalized = { isFinalized }
                  valid={valid}
                  refresh = { refresh }
                  setOpen = { setOpen }
                />
              )}
            </Stack>

            <Stack direction={'column'} spacing={1} >

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <TextField 
                  variant='outlined'
                  label='QtyOfSubRule'
                  size="small"
                  error={ valid['QtyOfSubRule']?.error }
                  helperText={ valid['QtyOfSubRule']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('QtyOfSubRule', input, MaxByte, setValid);
                    setObjGuo((v) => ({
                      ...v,
                      qtyOfSubRule: input,
                    }));
                  }}
                  value={ objGuo.qtyOfSubRule }
                />

                {!isFinalized && (
                  <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 218 }}>
                    <InputLabel id="addMember-label">AddMember ?</InputLabel>
                    <Select
                      labelId="addMember-label"
                      id="addMember-select"
                      label="AddMember ?"
                      value={ objGuo.addMember ? '1' : '0' }
                      onChange={(e) => setObjGuo((v) => ({
                        ...v,
                        addMember: e.target.value == '1',
                      }))}
                    >
                      <MenuItem value={ '1' } > True </MenuItem>
                      <MenuItem value={ '0' } > False </MenuItem>
                    </Select>
                    <FormHelperText>{' '}</FormHelperText>
                  </FormControl>
                )}

                {isFinalized && (
                  <TextField 
                    variant='outlined'
                    label='AddMember ?'
                    inputProps={{readOnly: true}}
                    size="small"
                    helperText=' '
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    value={ objGuo.addMember ? 'True' : 'False' }
                  />
                )}

                <TextField 
                  variant='outlined'
                  label='GroupRep'
                  size="small"
                  error={ valid['GroupRep']?.error }
                  helperText={ valid['GroupRep']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => setObjGuo((v) => ({
                    ...v,
                    groupRep: e.target.value,
                  }))}
                  value={ isFinalized ? longSnParser(objGuo.groupRep) : objGuo.groupRep }
                />

              </Stack>

              <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                <TextField 
                  variant='outlined'
                  label='Members_1'
                  size="small"
                  error={ valid['Members_1']?.error }
                  helperText={ valid['Members_1']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('Members_1', input, MaxUserNo, setValid);
                    setObjGuo((v) => {
                      let arr = [...v.members];
                      arr[0] = input;
                      return {
                        ...v,
                        members: arr,
                      }
                    });
                  }}
                  value={ isFinalized ? longSnParser(objGuo.members[0]) : objGuo.members[0] }
                />

                <TextField 
                  variant='outlined'
                  label='Members_2'
                  size="small"
                  error={ valid['Members_2']?.error }
                  helperText={ valid['Members_2']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) =>{
                    let input = e.target.value;
                    onlyInt('Members_2', input, MaxUserNo, setValid);
                    setObjGuo((v) => {
                      let arr = [...v.members];
                      arr[1] = input;
                      return {
                        ...v,
                        members: arr,
                      };
                    });
                  }}
                  value={ isFinalized ? longSnParser(objGuo.members[1]) : objGuo.members[1] }
                />

                <TextField 
                  variant='outlined'
                  label='Members_3'
                  size="small"
                  error={ valid['Members_3']?.error }
                  helperText={ valid['Members_3']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('Members_3', input, MaxUserNo, setValid);
                    setObjGuo((v) => {
                      let arr = [...v.members];
                      arr[2] = input;
                      return {
                        ...v,
                        members: arr,
                      };
                    });
                  }}
                  value={ isFinalized ? longSnParser(objGuo.members[2]) : objGuo.members[2] }
                />

                <TextField 
                  variant='outlined'
                  label='Members_4'
                  size="small"
                  error={ valid['Members_4']?.error }
                  helperText={ valid['Members_4']?.helpTx ?? ' ' }
                  inputProps={{readOnly: isFinalized}}
                  sx={{
                    m:1,
                    minWidth: 218,
                  }}
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('Members_4', input, MaxUserNo, setValid);
                    setObjGuo((v) => {
                      let arr = [...v.members];
                      arr[3] = input;
                      return {
                        ...v,
                        members: arr,
                      };
                    });
                  }}
                  value={ isFinalized ? longSnParser(objGuo.members[3]) : objGuo.members[3] }
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
