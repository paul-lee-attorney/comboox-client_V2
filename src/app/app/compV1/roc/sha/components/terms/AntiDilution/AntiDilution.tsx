
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Stack, IconButton, Paper, Toolbar, TextField, Button,
  Tooltip, Box, Dialog, DialogContent, DialogActions, Typography,
} from "@mui/material";
import {AddCircle, RemoveCircle, ListAlt } from "@mui/icons-material"

import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

import { AddrZero, HexType, MaxPrice, MaxSeqNo, MaxUserNo } from "../../../../../../common";

import { CopyLongStrSpan } from "../../../../../../common/CopyLongStr";
import { BenchmarkType, getBenchmarks } from "./ad";
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../../../common/toolsKit";

import { Benchmark } from "./Benchmark";
import { AddTerm } from "../AddTerm";

import {
  useAntiDilutionAddBenchmark,
  useAntiDilutionRemoveBenchmark,
  useAntiDilutionAddObligor,
  useAntiDilutionRemoveObligor,
} from "../../../../../../../../../generated-v1";

export interface SetShaTermProps {
  sha: HexType,
  term: HexType,
  setTerms: Dispatch<SetStateAction<HexType[]>> ,
  isFinalized: boolean,
}

export function AntiDilution({ sha, term, setTerms, isFinalized }: SetShaTermProps) {

  const { setErrMsg } = useComBooxContext();

  const [ newMarks, setNewMarks ] = useState<BenchmarkType[]>();

  const [ classOfShare, setClassOfShare ] = useState<string>('0');
  const [ price, setPrice ] = useState<string>('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ time, setTime ] = useState<number>(0);

  const [ loadingAdd, setLoadingAdd ] = useState(false);
  const refreshAdd = ()=> {
    setTime(Date.now());
    setLoadingAdd(false);
  }

  const { 
    isLoading: addMarkLoading,
    write: addMark 
  } = useAntiDilutionAddBenchmark({
    address: term,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingAdd(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshAdd);
    }
  });

  const addMarkClick = ()=>{
    addMark({
      args: [
        BigInt(classOfShare), 
        strNumToBigInt(price, 4),
      ],      
    });
  };

  const [ loadingRemove, setLoadingRemove ] = useState(false);
  const refreshRemove = ()=> {
    setTime(Date.now());
    setLoadingRemove(false);
  }

  const { 
    isLoading: removeMarkIsLoading, 
    write: removeMark 
  } = useAntiDilutionRemoveBenchmark({
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

  const removeMarkClick = ()=>{
    removeMark({
      args: [
        BigInt(classOfShare)
      ]
    });
  }

  const [ obligor, setObligor ] = useState<string>();

  const [ loadingAddObl, setLoadingAddObl ] = useState(false);
  const refreshAddObl = ()=> {
    setTime(Date.now());
    setLoadingAddObl(false);
  }

  const { 
    isLoading: addObligorIsLoading, 
    write: addObligor 
  } = useAntiDilutionAddObligor({
    address: term,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingAddObl(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshAddObl);
    },    
  });
    
  const addObligorClick = ()=>{
    if (obligor)
      addObligor({
        args: [ 
          BigInt(classOfShare), 
          BigInt(obligor)
        ], 
      });
  };

  const [ loadingRemoveObl, setLoadingRemoveObl ] = useState(false);
  const refreshRemoveObl = ()=> {
    setTime(Date.now());
    setLoadingRemoveObl(false);
  }

  const { 
    isLoading: removeObligorIsLoading, 
    write: removeObligor 
  } = useAntiDilutionRemoveObligor({
    address: term,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingRemoveObl(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshRemoveObl);
    },    
  });

  const removeObligorClick = ()=>{
    if (obligor)
      removeObligor({
        args: [ 
          BigInt(classOfShare), 
          BigInt(obligor)
        ]  
      });
  };

  useEffect(()=>{
    if (term != AddrZero) {
      getBenchmarks(term).then(
        res => setNewMarks(res)
      );
    }
  }, [term, time]);

  const [ open, setOpen ] = useState(false);

  return (
    <>
      <Button
        disabled={ isFinalized && !term }
        variant={term != AddrZero ? 'contained' : 'outlined'}
        startIcon={<ListAlt />}
        sx={{ m:0.5, minWidth: 248, justifyContent:'start' }}
        onClick={()=>setOpen(true)}      
      >
        Anti-Dilution 
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
                    <b>Anti Dilution</b>
                  </Typography>

                  <CopyLongStrSpan title="Addr"  src={term.toLowerCase()} />
                </Stack>
                {!isFinalized && (
                  <AddTerm sha={ sha } title={ 1 } setTerms={ setTerms } isCreated={ term != AddrZero }  />
                )}


              </Stack>

              {term != AddrZero && !isFinalized && (
                <Paper elevation={3} sx={{ m:1 , p:1, border:1, borderColor:'divider' }}>

                  <Stack direction={'row'} sx={{ alignItems:'start', justifyContent:'space-between' }}>      

                    <Tooltip
                      title='Add Benchmark'
                      placement="top-start"
                      arrow
                    >
                      <IconButton 
                        disabled={ addMarkLoading || hasError(valid) || loadingAdd}
                        sx={{width: 20, height: 20, mt: 2, ml: 5 }} 
                        onClick={ addMarkClick }
                        color="primary"
                      >
                        <AddCircle/>
                      </IconButton>
                    </Tooltip>

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
                        setClassOfShare(input);
                      }}
                      value={ classOfShare }              
                    />

                    <TextField 
                      variant='outlined'
                      label='Price'
                      size="small"
                      error={ valid['Price']?.error }
                      helperText={ valid['Price']?.helpTx ?? ' ' }
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      onChange={(e) => {
                        let input = e.target.value;
                        onlyNum('Price', input, MaxPrice, 4, setValid);
                        setPrice(input);
                      }}
                      value={ price }
                    />

                    <Tooltip
                      title='Remove Benchmark'
                      placement="top-end"
                      arrow
                    >           
                      <IconButton
                        disabled={ removeMarkIsLoading || hasError(valid) || loadingRemove} 
                        sx={{width: 20, height: 20, mt: 2, mr: 10, }} 
                        onClick={ removeMarkClick }
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
                        disabled={ addObligorIsLoading || loadingAddObl}
                        sx={{width: 20, height: 20, mt: 2, ml: 10,}} 
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
                        disabled={ removeObligorIsLoading || hasError(valid) || loadingRemoveObl} 
                        sx={{width: 20, height: 20, mt: 2, mr: 10}} 
                        onClick={ removeObligorClick }
                        color="primary"
                      >
                        <RemoveCircle/>
                      </IconButton>
                    
                    </Tooltip>

                  </Stack>
                
                </Paper>
              )}
              
              {term != AddrZero && newMarks?.map((v) => (
                <Benchmark 
                  key={v.classOfShare} 
                  classOfShare={v.classOfShare}
                  floorPrice={v.floorPrice}
                  obligors={v.obligors} 
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

