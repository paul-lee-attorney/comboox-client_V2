import { useEffect, useState } from "react";

import { 
  Stack,
  IconButton,
  Paper,
  TextField,
  Button,
  Tooltip,
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
} from "@mui/material";

import { AddrZero, HexType, MaxData, MaxPrice, MaxSeqNo, MaxUserNo } from "../../../../../../common";

import { AddCircle, RemoveCircle, ListAlt } from "@mui/icons-material"
import { DateTimeField } from "@mui/x-date-pickers";

import {
  useOptionsCreateOption,
  useOptionsDelOption,
  useOptionsAddObligorIntoOpt,
  useOptionsRemoveObligorFromOpt,
} from "../../../../../../../../../generated-v1";

import { Opt } from "./Opt";

import { SetShaTermProps } from "../AntiDilution/AntiDilution";

import { AddTerm } from "../AddTerm";
import { CopyLongStrSpan } from "../../../../../../common/CopyLongStr";
import { OptWrap, comOps, condCodifier, logOps, optHeadCodifier, typeOfOpts, StrHeadOfOpt,
  defaultStrHeadOfOpt, StrCond, defaultStrCond, defaultStrBodyOfOpt, StrBodyOfOpt
} from "../../../../../roo/roo";

import { getOpts } from "./op";

import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, stampToUtc, strNumToBigInt, utcToStamp } from "../../../../../../common/toolsKit";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";


export function Options({ sha, term, setTerms, isFinalized }: SetShaTermProps) {

  const { setErrMsg } = useComBooxContext();

  const [ opts, setOpts ] = useState<readonly OptWrap[]>(); 
  const [ open, setOpen ] = useState(false);

  const [ head, setHead ] = useState<StrHeadOfOpt>(defaultStrHeadOfOpt);
  const [ cond, setCond ] = useState<StrCond>(defaultStrCond);
  const [ body, setBody ] = useState<StrBodyOfOpt>(defaultStrBodyOfOpt);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ time, setTime ] = useState<number>(0);

  const [ loadingAdd, setLoadingAdd ] = useState(false);
  const refreshAdd = ()=> {
    setTime(Date.now());
    setLoadingAdd(false);
  }

  const { 
    isLoading: addOptLoading,
    write: addOpt
  } = useOptionsCreateOption({
    address: term,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingAdd(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshAdd);
    },    
  });

  const addOptClick = ()=>{
    addOpt({args:[
      optHeadCodifier(head), 
      condCodifier(cond), 
      BigInt(body.rightholder),
      strNumToBigInt(body.paid, 4),
      strNumToBigInt(body.par, 4)
    ]});
  }
  
  const [ loadingRemove, setLoadingRemove ] = useState(false);
  const refreshRemove = ()=> {
    setTime(Date.now());
    setLoadingRemove(false);
  }

  const { 
    isLoading: removeOptLoading, 
    write: removeOpt, 
  } = useOptionsDelOption({
    address: term,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingRemove(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshRemove);
    },    
  });

  const removeOptClick = ()=> {
    removeOpt({args:[BigInt(head.seqOfOpt)]});
  }

  const [ obligor, setObligor ] = useState<string>('0');

  const [ loadingAddObr, setLoadingAddObr ] = useState(false);
  const refreshAddObr = ()=> {
    setTime(Date.now());
    setLoadingAddObr(false);
  }

  const { 
    isLoading: addObligorLoading, 
    write: addObligor, 
  } = useOptionsAddObligorIntoOpt({
    address: term,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingAddObr(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshAddObr);
    },    
  });

  const addObligorClick = ()=>{
    addObligor({args:[
      BigInt(head.seqOfOpt),
      BigInt(obligor),
    ]});
  }

  const [ loadingRemoveObr, setLoadingRemoveObr ] = useState(false);
  const refreshRemoveObr = ()=> {
    setTime(Date.now());
    setLoadingRemoveObr(false);
  }

  const { 
    isLoading: removeObligorLoading, 
    write: removeObligor 
  } = useOptionsRemoveObligorFromOpt({
    address: term,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingRemoveObr(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshRemoveObr);
    },    
  });
  
  const removeObligorClick = ()=>{
    removeObligor({args:[
      BigInt(head.seqOfOpt),
      BigInt(obligor),
    ]});
  }

  useEffect(()=>{
    if (term != AddrZero) {
      getOpts(term).then(
        res => setOpts(res)
      );
    }
  }, [term, time]);

  return (
    <>
      <Button
        disabled={ isFinalized && !term }
        variant={term != AddrZero ? 'contained' : 'outlined'}
        startIcon={<ListAlt />}
        sx={{ m:0.5, minWidth: 248, justifyContent:'start' }}
        onClick={()=>setOpen(true)}      
      >
        Put/Call Options 
      </Button>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title"        
      >

        <DialogContent>

          <Paper elevation={3} sx={{ m:1 , p:1, border:1, borderColor:'divider' }}>
            <Box sx={{ width:1480 }}>

              <Stack direction={'row'} sx={{ alignItems:'center', justifyContent:'space-between' }}>

                <Stack direction='row' >
                  <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
                    <b>Put/Call Options</b>
                  </Typography>

                  <CopyLongStrSpan title="Addr"  src={term} />
                </Stack>

                {!isFinalized && (
                  <AddTerm sha={ sha } title={ 5 } setTerms={ setTerms } isCreated={ term != AddrZero }  />
                )}

              </Stack>

              {term !=AddrZero && !isFinalized && (
                <Paper elevation={3} sx={{ m:1 , p:1, border:1, borderColor:'divider' }}>

                  <Stack direction='column' spacing={1} >

                    <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                      <FormControl variant="outlined" sx={{ m: 1, minWidth: 218 }}>
                        <InputLabel id="optType-label">TypeOfOption</InputLabel>
                        <Select
                          labelId="optType-label"
                          id="optType-select"
                          label="TypeOfOption"
                          size="small"
                          value={ head.typeOfOpt }
                          onChange={(e) => setHead((v) => ({
                            ...v,
                            typeOfOpt: e.target.value,
                          }))}
                        >
                          {typeOfOpts.map((v, i) => (
                            <MenuItem key={i} value={ i } >{ v }</MenuItem>  
                          ))}
                        </Select>
                        <FormHelperText>{' '}</FormHelperText>
                      </FormControl>

                      <TextField 
                        variant='outlined'
                        label='ClassOfShare'
                        size="small"
                        error={ valid['ClassOfShare']?.error }
                        helperText={ valid['ClassOfShare']?.helpTx ?? ' ' }
                        sx={{
                          m:1,
                          minWidth: 218,
                        }}
                        onChange={(e) => {
                          let input = e.target.value;
                          onlyInt('ClassOfShare', input, MaxSeqNo, setValid);
                          setHead((v) => ({
                            ...v,
                            classOfShare: input,
                          }));
                        }}
                        value={ head.classOfShare }              
                      />

                      <TextField 
                        variant='outlined'
                        label='Paid'
                        size="small"
                        error={ valid['Paid']?.error }
                        helperText={ valid['Paid']?.helpTx ?? ' ' }
                        sx={{
                          m:1,
                          minWidth: 218,
                        }}
                        onChange={(e) => {
                          let input = e.target.value;
                          onlyNum('Paid', input, MaxData, 4, setValid);
                          setBody((v) => ({
                            ...v,
                            paid: e.target.value,
                          }));
                      }}
                        value={ body.paid.toString() }              
                      />

                      <TextField 
                        variant='outlined'
                        label='Par'
                        size="small"
                        error={ valid['Par']?.error }
                        helperText={ valid['Par']?.helpTx ?? ' ' }
                        sx={{
                          m:1,
                          minWidth: 218,
                        }}
                        onChange={(e) => {
                          let input = e.target.value;
                          onlyNum('Par', input, MaxData, 4, setValid);
                          setBody((v) => ({
                            ...v,
                            par: input,
                          }));
                        }}
                        value={ body.par.toString() }              
                      />

                      <TextField 
                        variant='outlined'
                        label='Rightholder'
                        size="small"
                        error={ valid['Rightholder']?.error }
                        helperText={ valid['Rightholder']?.helpTx ?? ' ' }
                        sx={{
                          m:1,
                          minWidth: 218,
                        }}
                        onChange={(e) => {
                          let input = e.target.value;
                          onlyInt('Rightholder', input, MaxUserNo, setValid);
                          setBody((v) => ({
                            ...v,
                            rightholder: input,
                          }));
                        }}
                        value={ body.rightholder }              
                      />

                    </Stack>

                    <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                      <TextField 
                        variant='outlined'
                        label='RateOfOption'
                        size="small"
                        error={ valid['RateOfOption']?.error }
                        helperText={ valid['RateOfOption']?.helpTx ?? ' ' }
                        sx={{
                          m:1,
                          minWidth: 218,
                        }}
                        onChange={(e) => {
                          let input = e.target.value;
                          onlyNum('RateOfOption', input, MaxPrice, 4, setValid);
                          setHead((v) => ({
                            ...v,
                            rate: input,
                          }));
                        }}
                        value={ head.rate }              
                      />

                      <DateTimeField
                        label='TriggerDate'
                        size="small"
                        helperText=' '
                        sx={{
                          m:1,
                          minWidth: 218,
                        }} 
                        value={ stampToUtc(head.triggerDate) }
                        onChange={(date) => setHead((v) => ({
                          ...v,
                          triggerDate: utcToStamp(date),
                        }))}
                        format='YYYY-MM-DD HH:mm:ss'
                      />

                      <TextField 
                        variant='outlined'
                        label='ExecDays'
                        size="small"
                        error={ valid['ExecDays']?.error }
                        helperText={ valid['ExecDays']?.helpTx ?? ' ' }
                        sx={{
                          m:1,
                          minWidth: 218,
                        }}
                        onChange={(e) => {
                          let input = e.target.value;
                          onlyInt('ExecDays', input, MaxSeqNo, setValid);
                          setHead((v) => ({
                            ...v,
                            execDays: input,
                          }));
                        }}
                        value={ head.execDays }              
                      />

                      <TextField 
                        variant='outlined'
                        label='ClosingDays'
                        size="small"
                        error={ valid['ClosingDays']?.error }
                        helperText={ valid['ClosingDays']?.helpTx ?? ' ' }
                        sx={{
                          m:1,
                          minWidth: 218,
                        }}
                        onChange={(e) => {
                          let input = e.target.value;
                          onlyInt('ClosingDays', input, MaxSeqNo, setValid);
                          setHead((v) => ({
                            ...v,
                            closingDays: input,
                          }));
                        }}
                        value={ head.closingDays }              
                      />

                      <TextField 
                        variant='outlined'
                        label='Obligor'
                        size="small"
                        error={ valid['Obligor']?.error }
                        helperText={ valid['Obligor']?.helpTx ?? ' ' }
                        sx={{
                          m:1,
                          minWidth: 218,
                        }}
                        onChange={(e) => {
                          let input = e.target.value;
                          onlyInt('Obligor', input, MaxUserNo, setValid);
                          setHead((v) => ({
                            ...v,
                            obligor: input,
                          }));
                        }}
                        value={ head.obligor }              
                      />

                    </Stack>

                    {Number(head.typeOfOpt) > 3 && (

                      <Stack direction={'row'} sx={{ alignItems: 'center', backgroundColor:'lightcyan' }} >

                        <FormControl variant="outlined" sx={{ m: 1, minWidth: 128 }}>
                          <InputLabel id="logicOperator-label">LogOpr</InputLabel>
                          <Select
                            labelId="logicOperator-label"
                            id="logicOperator-select"
                            size="small"
                            label="LogOpr"
                            value={ cond.logicOpr }
                            onChange={(e) => setCond((v) => ({
                              ...v,
                              logicOpr: e.target.value,
                            }))}
                          >
                            {logOps.map((v, i) => (
                              <MenuItem key={i} value={ i } >{ v }</MenuItem>  
                            ))}
                          </Select>
                          <FormHelperText>{' '}</FormHelperText>
                        </FormControl>
                    
                        <FormControl variant="outlined" sx={{ m: 1, minWidth: 128 }}>
                          <InputLabel id="compOpr1-label">CompOpr_1</InputLabel>
                          <Select
                            labelId="compOpr1-label"
                            id="compOpr1-select"
                            size="small"
                            label="CompOpr_1"
                            value={ cond.compOpr1 }
                            onChange={(e) => setCond((v) => ({
                              ...v,
                              compOpr1: e.target.value,
                            }))}
                          >
                            {comOps.map((v, i) => (
                              <MenuItem key={i} value={ i } >{ v }</MenuItem>  
                            ))}
                          </Select>
                          <FormHelperText>{' '}</FormHelperText>
                        </FormControl>

                        <TextField 
                          variant='outlined'
                          label='Parameter_1'
                          size="small"
                          error={ valid['Parameter_1']?.error }
                          helperText={ valid['Parameter_1']?.helpTx ?? ' ' }
                          sx={{
                            m:1,
                            minWidth: 218,
                          }}
                          onChange={(e) => {
                            let input = e.target.value;
                            onlyNum('Parameter_1', input, MaxData, 4, setValid);
                            setCond((v) => ({
                              ...v,
                              para1: input,
                            }));
                          }}
                          value={ cond.para1 }
                        />
                      
                      {Number(cond.logicOpr) > 0 && (<>

                        <FormControl variant="outlined" sx={{ m: 1, minWidth: 128 }}>
                          <InputLabel id="compOpr2-label">CompOpr_2</InputLabel>
                          <Select
                            labelId="compOpr2-label"
                            id="compOpr2-select"
                            size="small"
                            label="CompOpr_2"
                            value={ cond.compOpr2 }
                            onChange={(e) => setCond((v) => ({
                              ...v,
                              compOpr2: e.target.value,
                            }))}
                          >
                            {comOps.map((v, i) => (
                              <MenuItem key={i} value={ i } >{ v }</MenuItem>  
                            ))}
                          </Select>
                          <FormHelperText>{' '}</FormHelperText>
                        </FormControl>

                        <TextField 
                          variant='outlined'
                          label='Parameter_2'
                          size="small"
                          error={ valid['Parameter_2']?.error }
                          helperText={ valid['Parameter_2']?.helpTx ?? ' ' }
                          sx={{
                            m:1,
                            minWidth: 218,
                          }}
                          onChange={(e) => {
                            let input = e.target.value;
                            onlyNum('Parameter_2', input, MaxData, 4, setValid);
                            setCond((v) => ({
                              ...v,
                              para2: input,
                            }));
                          }}
                          value={ cond.para2 }
                        />

                      </>)}

                      {Number(cond.logicOpr) > 4 && (<>

                        <FormControl variant="outlined" sx={{ m: 1, minWidth: 128 }}>
                          <InputLabel id="compOpr3-label">CompOpr_3</InputLabel>
                          <Select
                            labelId="compOpr3-label"
                            id="compOpr3-select"
                            size="small"
                            label="CompOpr_3"
                            value={ cond.compOpr3 }
                            onChange={(e) => setCond((v) => ({
                              ...v,
                              compOpr3: e.target.value,
                            }))}
                          >
                            {comOps.map((v, i) => (
                              <MenuItem key={i} value={ i } >{ v }</MenuItem>  
                            ))}
                          </Select>
                          <FormHelperText>{' '}</FormHelperText>
                        </FormControl>

                        <TextField 
                          variant='outlined'
                          label='Parameter_3'
                          size="small"
                          error={ valid['Parameter_3']?.error }
                          helperText={ valid['Parameter_3']?.helpTx ?? ' ' }
                          sx={{
                            m:1,
                            minWidth: 218,
                          }}
                          onChange={(e) => {
                            let input = e.target.value;
                            onlyNum('Parameter_3', input, MaxData, 4, setValid);
                            setCond((v) => ({
                              ...v,
                              para3: input,
                            }));
                          }}
                          value={ cond.para3 }
                        />

                      </>)}

                      </Stack>

                    )}

                  </Stack>

                  <Divider sx={{ m:1 }} flexItem />

                  <Stack direction={'row'} sx={{ alignItems:'start' }}>      

                    <Tooltip
                      title='Add Option'
                      placement="top-start"
                      arrow
                    >
                      <IconButton 
                        disabled={ addOptLoading || hasError(valid) || loadingAdd}
                        sx={{width: 20, height: 20, mt:2, ml: 5 }} 
                        onClick={ addOptClick }
                        color="primary"
                      >
                        <AddCircle/>
                      </IconButton>
                    </Tooltip>

                    <TextField 
                      variant='outlined'
                      label='SeqOfOption'
                      size="small"
                      error={ valid['SeqOfOption']?.error }
                      helperText={ valid['SeqOfOption']?.helpTx ?? ' ' }
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      onChange={(e) => {
                        let input = e.target.value;
                        onlyInt('SeqOfOption', input, MaxPrice, setValid);
                        setHead(v=>({
                          ...v,
                          seqOfOpt: input,
                        }));
                      }}
                      value={ head.seqOfOpt }              
                    />

                    <Tooltip
                      title='Remove Option'
                      placement="top-end"
                      arrow
                    >           
                      <IconButton
                        disabled={ removeOptLoading || hasError(valid) || loadingRemove} 
                        sx={{width: 20, height: 20, mt:2, mr: 10, }} 
                        onClick={ removeOptClick }
                        color="primary"
                      >
                        <RemoveCircle/>
                      </IconButton>
                    </Tooltip>

                    <Tooltip
                      title='Add Obligor'
                      placement="top-start"
                      arrow
                    >
                      <IconButton 
                        disabled={ addObligorLoading || hasError(valid) || loadingAddObr}
                        sx={{width: 20, height: 20, mt:2, ml: 10,}} 
                        onClick={ addObligorClick }
                        color="primary"
                      >
                        <AddCircle/>
                      </IconButton>

                    </Tooltip>

                    <TextField 
                      variant='outlined'
                      label='Obligor'
                      size="small"
                      error={ valid['Obligor']?.error }
                      helperText={ valid['Obligor']?.helpTx ?? ' ' }
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      onChange={(e) => {
                        let input = e.target.value;
                        onlyInt('Obligor', input, MaxUserNo, setValid);
                        setObligor(input);
                      }}
                      value={ obligor }              
                    />

                    <Tooltip
                      title='Remove Obligor'
                      placement="top-end"
                      arrow
                    >

                      <IconButton
                        disabled={ removeObligorLoading || hasError(valid) || loadingRemoveObr} 
                        sx={{width: 20, height: 20, mt:2, mr: 10}} 
                        onClick={ removeObligorClick }
                        color="primary"
                      >
                        <RemoveCircle/>
                      </IconButton>
                    
                    </Tooltip>

                  </Stack>
              
                </Paper>
              )}

              {term != AddrZero && opts && opts.length > 0 && opts.map(v => (
                <Opt key={ v.opt.head.seqOfOpt } optWrap={ v } />
              ))}

            </Box>
          </Paper>

        </DialogContent>

        <DialogActions>
          <Button variant="outlined" sx={{ m:1, mx:3 }} onClick={()=>setOpen(false)}>Close</Button>
        </DialogActions>

      </Dialog>
  
    </>
  );
} 

