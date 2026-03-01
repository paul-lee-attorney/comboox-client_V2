import { useEffect, useState } from "react";

import { 
  Stack,
  IconButton,
  Paper,
  Toolbar,
  TextField,
  Button,
  Tooltip,
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";

import { AddrZero, HexType, MaxPrice, MaxUserNo } from "../../../../../../common";

import {
  AddCircle,
  RemoveCircle,
  ListAlt,
} from "@mui/icons-material"

import {
  useLockUpSetLocker,
  useLockUpRemoveKeyholder,
  useLockUpDelLocker,
  useLockUpAddKeyholder,
} from "../../../../../../../../../generated-v1";

import { DateTimeField } from "@mui/x-date-pickers";

import { SetShaTermProps } from "../AntiDilution/AntiDilution";
import { CopyLongStrSpan } from "../../../../../../common/CopyLongStr";

import { AddTerm } from "../AddTerm";
import { LockerOfShare } from "./LockerOfShare";
import { Locker, getLockers } from "./lu";

import { FormResults, defFormResults, hasError, onlyInt, refreshAfterTx, stampToUtc, utcToStamp } from "../../../../../../common/toolsKit";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";


export function LockUp({ sha, term, setTerms, isFinalized }: SetShaTermProps) {

  const { setErrMsg } = useComBooxContext();

  const [ lockers, setLockers ] = useState<Locker[]>([]);
  const [ seqOfShare, setSeqOfShare ] = useState<string>('0');
  const [ dueDate, setDueDate ] = useState<number>(0);
  const [ open, setOpen ] = useState(false);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ time, setTime ] = useState<number>(0);

  const [ loadingAdd, setLoadingAdd ] = useState(false);
  const refreshAdd = ()=> {
    setTime(Date.now());
    setLoadingAdd(false);
  }

  const { 
    isLoading: addLockerLoading,
    write: addLocker 
  } = useLockUpSetLocker({
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

  const addLockerClick = ()=>{
    addLocker({
      args: [ 
        BigInt(seqOfShare),
        BigInt(dueDate) 
      ],
    });
  };

  const [ loadingRemove, setLoadingRemove ] = useState(false);
  const refreshRemove = ()=> {
    setTime(Date.now());
    setLoadingRemove(false);
  }

  const { 
    isLoading: removeLockerLoading, 
    write: removeLocker 
  } = useLockUpDelLocker({
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

  const removeLockerClick =  ()=> {
    removeLocker({
      args: [ BigInt(seqOfShare) ],
    })
  }

  const [ keyholder, setKeyholder ] = useState<string>('0');

  const [ loadingAddKlr, setLoadingAddKlr ] = useState(false);
  const refreshAddKlr = ()=> {
    setTime(Date.now());
    setLoadingAddKlr(false);
  }

  const { 
    isLoading: addKeyholderLoading, 
    write: addKeyholder,
  } = useLockUpAddKeyholder({
    address: term,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingAddKlr(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshAddKlr);
    },    
  });

  const addKeyholderClick = ()=>{
    addKeyholder({
      args: [ 
        BigInt(seqOfShare), 
        BigInt(keyholder) 
      ],
    });
  };

  const [ loadingRemoveKlr, setLoadingRemoveKlr ] = useState(false);
  const refreshRemoveKlr = ()=> {
    setTime(Date.now());
    setLoadingRemoveKlr(false);
  }

  const { 
    isLoading: removeKeyholderLoading, 
    write: removeKeyholder,
  } = useLockUpRemoveKeyholder({
    address: term,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingRemoveKlr(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshRemoveKlr);
    },    
  });
  
  const removeKeyholderClick = ()=>{
    removeKeyholder({
      args: [ 
        BigInt(seqOfShare), 
        BigInt(keyholder) 
      ],
    });
  };

  useEffect(()=>{
    if (term != AddrZero) {
      getLockers(term).then(
        ls => setLockers(ls)
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
        Lock Up
      </Button>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title"        
      >

          <DialogContent>

            <Paper elevation={3} sx={{ m:1 , p:1, border:1, borderColor:'divider' }}>
              <Box sx={{ width:1180 }}>

                <Stack direction={'row'} sx={{ alignItems:'center', justifyContent:'space-between' }}>

                  <Stack direction={'row'} >
                    <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
                      <b>Lock Up</b>
                    </Typography>

                    <CopyLongStrSpan title="Addr"  src={term} />
                  </Stack>

                  { !isFinalized && (
                    <AddTerm sha={ sha } title={ 2 } setTerms={ setTerms } isCreated={ term != AddrZero } />
                  )}

                </Stack>

                {term != AddrZero && !isFinalized && (
                  <Paper elevation={3} sx={{ m:1 , p:1, border:1, borderColor:'divider' }}>

                    <Stack direction={'row'} sx={{ alignItems:'start' }}>      

                      <Tooltip
                        title='Add Locker'
                        placement="top-start"
                        arrow
                      >
                        <IconButton 
                          disabled={ addLockerLoading || hasError(valid) || loadingAdd}
                          sx={{width: 20, height: 20, mt: 2, ml: 5 }} 
                          onClick={ addLockerClick }
                          color="primary"
                        >
                          <AddCircle/>
                        </IconButton>
                      </Tooltip>

                      <TextField 
                        variant='outlined'
                        label='SeqOfCert'
                        size="small"
                        error={ valid['SeqOfShare']?.error }
                        helperText={ valid['SeqOfShare']?.helpTx ?? ' ' }
                        sx={{
                          m:1,
                          minWidth: 218,
                        }}
                        onChange={(e) => {
                          let input = e.target.value;
                          onlyInt('SeqOfShare', input, MaxPrice, setValid);
                          setSeqOfShare(input);
                        }}
                        value={ seqOfShare }              
                      />

                      <DateTimeField
                        label='ExpireDate'
                        helperText=' '
                        sx={{
                          m:1,
                          minWidth: 218,
                        }} 
                        size="small"
                        value={ stampToUtc(dueDate) }
                        onChange={(date) => setDueDate(utcToStamp(date))}
                        format='YYYY-MM-DD HH:mm:ss'
                      />

                      <Tooltip
                        title='Remove Locker'
                        placement="top-end"
                        arrow
                      >           
                        <IconButton
                          disabled={ removeLockerLoading || hasError(valid) || loadingRemove} 
                          sx={{width: 20, height: 20, mt: 2, mr: 10, }} 
                          onClick={ removeLockerClick }
                          color="primary"
                        >
                          <RemoveCircle/>
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title='Add Keyholder'
                        placement="top-start"
                        arrow
                      >
                        <IconButton 
                          disabled={ addKeyholderLoading || hasError(valid) || loadingAddKlr}
                          sx={{width: 20, height: 20, mt:2, ml: 10,}} 
                          onClick={ addKeyholderClick }
                          color="primary"
                        >
                          <AddCircle/>
                        </IconButton>

                      </Tooltip>

                      <TextField 
                        variant='outlined'
                        label='Keyholder'
                        size="small"
                        error={ valid['Keyholder']?.error }
                        helperText={ valid['Keyholder']?.helpTx ?? ' ' }
                        sx={{
                          m:1,
                          minWidth: 218,
                        }}
                        onChange={(e) => {
                          let input = e.target.value;
                          onlyInt('Keyholder', input, MaxUserNo, setValid);
                          setKeyholder(input);
                        }}
                        value={ keyholder }              
                      />

                      <Tooltip
                        title='Remove Keyholder'
                        placement="top-end"
                        arrow
                      >

                        <IconButton
                          disabled={ removeKeyholderLoading || hasError(valid) || loadingRemoveKlr} 
                          sx={{width: 20, height: 20, mt:2, mr: 10}} 
                          onClick={ removeKeyholderClick }
                          color="primary"
                        >
                          <RemoveCircle/>
                        </IconButton>
                      
                      </Tooltip>

                    </Stack>
                  
                  </Paper>
                )}
                
                {term && lockers?.map((v) => (
                  <LockerOfShare 
                    key={v.seqOfShare} 
                    seqOfShare={v.seqOfShare}
                    dueDate={v.dueDate}
                    keyholders={v.keyholders} 
                  />
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

