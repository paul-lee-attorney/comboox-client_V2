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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
} from "@mui/material";

import { AddrZero, HexType, MaxPrice, MaxRatio, MaxSeqNo, MaxUserNo } from "../../../../../../common";

import {
  AddCircle,
  RemoveCircle,
  ListAlt,
} from "@mui/icons-material"

import {
  useAlongsAddDragger,
  useAlongsRemoveDragger,
  useAlongsAddFollower,
  useAlongsRemoveFollower,
} from "../../../../../../../../../generated";

import { DateTimeField } from "@mui/x-date-pickers";
import { AlongLinks } from "./AlongLinks";
import { AddTerm } from "../AddTerm";
import { CopyLongStrSpan } from "../../../../../../common/CopyLongStr";
import { AlongLink, LinkRule, defaultLinkRule, getLinks, linkRuleCodifier, triggerTypes } from "./da";
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, stampToUtc, utcToStamp } from "../../../../../../common/toolsKit";
import { SetShaTermProps } from "../AntiDilution/AntiDilution";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

interface AlongsProps extends SetShaTermProps {
  seqOfTitle: number;
}

export function Alongs({ sha, term, setTerms, isFinalized, seqOfTitle }: AlongsProps) {

  const { setErrMsg } = useComBooxContext();

  const [ links, setLinks ] = useState<AlongLink[]>([]);
  const [ drager, setDrager ] = useState<string>('0');
  const [ rule, setRule ] = useState<LinkRule>(defaultLinkRule);
  const [ open, setOpen ] = useState(false);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ time, setTime ] = useState(0);

  const [ loadingAdd, setLoadingAdd ] = useState(false);
  const refreshAdd = ()=>{
    setTime(Date.now());
    setLoadingAdd(false);
  }

  const { 
    isLoading: addLinkLoading,
    write: addLink 
  } = useAlongsAddDragger({
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

  const addLinkClick = ()=>{
    addLink({
      args: [ 
        linkRuleCodifier(rule), 
        BigInt(drager)
      ], 
    })
  }

  const [ loadingRemove, setLoadingRemove ] = useState(false);
  const refreshRemove = ()=>{
    setTime(Date.now());
    setLoadingRemove(false);
  }

  const { 
    isLoading: removeLinkLoading, 
    write: removeLink, 
  } = useAlongsRemoveDragger({
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

  const removeLinkClick = ()=>{
    removeLink({
      args: [BigInt(drager)],      
    })
  }

  const [ follower, setFollower ] = useState<string>('0');

  const [ loadingAddFlr, setLoadingAddFlr ] = useState(false);
  const refreshAddFlr = ()=>{
    setTime(Date.now());
    setLoadingAddFlr(false);
  }

  const { 
    isLoading: addFollowerLoading, 
    write: addFollower, 
  } = useAlongsAddFollower({
    address: term,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingAddFlr(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshAddFlr);
    }
  });

  const addFollowerClick = ()=>{
    addFollower({
      args: [ 
        BigInt(drager),
        BigInt(follower)
      ],
    });
  };

  const [ loadingRemoveFlr, setLoadingRemoveFlr ] = useState(false);
  const refreshRemoveFlr = ()=>{
    setTime(Date.now());
    setLoadingRemoveFlr(false);
  }

  const { 
    isLoading: removeFollowerLoading, 
    write: removeFollower 
  } = useAlongsRemoveFollower({
    address: term,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingRemoveFlr(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshRemoveFlr);
    }  
  });

  const removeFollowerClick = ()=>{
    removeFollower({
      args: [ 
        BigInt(drager), 
        BigInt(follower)
      ], 
    });
  };

  useEffect(()=>{
    if (term != AddrZero) {
      getLinks(term).then(
        ls => setLinks(ls)
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
        {seqOfTitle == 3 ? 'Drag Along' : 'Tag Along' } 
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
                <Stack direction={'row'}>
                  <Toolbar sx={{ textDecoration:'underline' }}>
                    <Typography variant="h5">
                      {seqOfTitle == 3 ? 'Drag Along' : 'Tag Along' }
                    </Typography>
                  </Toolbar>

                  <CopyLongStrSpan title="Addr"  src={term} />
                </Stack>

                {!isFinalized && (
                  <AddTerm sha={ sha } title={ seqOfTitle } setTerms={ setTerms } isCreated={ term != AddrZero }  />
                )}

              </Stack>

              {term != AddrZero && !isFinalized && (
                <Paper elevation={3} sx={{ m:1 , p:1, border:1, borderColor:'divider' }}>

                  <Stack direction='column' spacing={1} >

                    <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                      <DateTimeField
                        label='TriggerDate'
                        helperText=' '
                        sx={{
                          m:1,
                          ml:8.5,
                          minWidth: 218,
                        }} 
                        size="small"
                        value={ stampToUtc(rule.triggerDate) }
                        onChange={(date) => setRule((v) => ({
                          ...v,
                          triggerDate: utcToStamp(date),
                        }))}
                        format='YYYY-MM-DD HH:mm:ss'
                      />

                      <TextField 
                        variant='outlined'
                        label='EffectiveDays'
                        size="small"
                        error={ valid['EffectiveDays']?.error }
                        helperText={ valid['EffectiveDays']?.helpTx ?? ' ' }
                        sx={{
                          m:1,
                          minWidth: 218,
                        }}
                        onChange={(e) => {
                          let input = e.target.value;
                          onlyInt('EffectiveDays', input, MaxSeqNo, setValid);
                          setRule((v) => ({
                          ...v,
                          effectiveDays: input,
                        }));
                      }}
                        value={ rule.effectiveDays }              
                      />

                      <TextField 
                        variant='outlined'
                        label='ShareRatioThreshold (%)'
                        size="small"
                        error={ valid['ShareRatioThreshold']?.error }
                        helperText={ valid['ShareRatioThreshold']?.helpTx ?? ' ' }
                        sx={{
                          m:1,
                          minWidth: 218,
                        }}
                        onChange={(e) => {
                          let input = e.target.value;
                          onlyNum('ShareRatioThreshold', input, MaxRatio, 2, setValid);
                          setRule((v) => ({
                            ...v,
                            shareRatioThreshold: input,
                          }));
                        }}
                        value={ rule.shareRatioThreshold }              
                      />

                    </Stack>

                    <Stack direction={'row'} sx={{ alignItems: 'center' }} >

                      <FormControl variant="outlined" sx={{ m:1, ml:8.5, minWidth: 218 }}>
                        <InputLabel id="triggerType-label">TypeOfTrigger</InputLabel>
                        <Select
                          size="small"
                          labelId="triggerType-label"
                          id="triggerType-select"
                          label="TypeOfTrigger"
                          value={ rule.triggerType }
                          onChange={(e) => setRule((v) => ({
                            ...v,
                            triggerType: e.target.value,
                          }))}
                        >
                          {triggerTypes.map((v, i) => (
                            <MenuItem key={i} value={ i } >{ v }</MenuItem>  
                          ))}
                        </Select>
                        <FormHelperText>{' '}</FormHelperText>
                      </FormControl>

                      <TextField 
                        variant='outlined'
                        label='Rate'
                        size="small"
                        error={ valid['Rate']?.error }
                        helperText={ valid['Rate']?.helpTx ?? ' ' }
                        sx={{
                          m:1,
                          minWidth: 218,
                        }}
                        onChange={(e) => {
                          let input = e.target.value;
                          onlyNum('Rate', input, MaxPrice, 4, setValid);
                          setRule((v) => ({
                            ...v,
                            rate: input,
                          }));
                        }}
                        value={ rule.rate }              
                      />

                      <FormControl variant="outlined" sx={{ m: 1, minWidth: 218 }}>
                        <InputLabel id="proRata-label">ProRata ?</InputLabel>
                        <Select
                          labelId="proRata-label"
                          id="proRata-select"
                          size="small"
                          label="ProRata ?"
                          value={ rule.proRata ? '1' : '0' }
                          onChange={(e) => setRule((v) => ({
                            ...v,
                            proRata: e.target.value == '1',
                          }))}
                        >
                          <MenuItem value={ '1' } > True </MenuItem>  
                          <MenuItem value={ '0' } > False </MenuItem>  
                        </Select>
                        <FormHelperText>{' '}</FormHelperText>
                      </FormControl>

                    </Stack>

                  </Stack>

                  <Divider orientation="horizontal" sx={{ m:1 }} flexItem />


                  <Stack direction={'row'} sx={{ alignItems:'start' }}>      

                    <Tooltip
                      title='Add DragAlong'
                      placement="top-start"
                      arrow
                    >
                      <IconButton 
                        disabled={ addLinkLoading || hasError(valid) || loadingAdd}
                        sx={{width: 20, height: 20, mt: 2, ml: 5 }} 
                        onClick={ addLinkClick }
                        color="primary"
                      >
                        <AddCircle/>
                      </IconButton>
                    </Tooltip>

                    <TextField 
                      variant='outlined'
                      label='Drager'
                      size="small"
                      error={ valid['Drager']?.error }
                      helperText={ valid['Drager']?.helpTx ?? ' ' }
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      onChange={(e) => {
                        let input = e.target.value;
                        onlyInt('Drager', input, MaxUserNo, setValid);
                        setDrager(input);
                      }}
                      value={ drager }              
                    />

                    <Tooltip
                      title='Remove DragAlong'
                      placement="top-end"
                      arrow
                    >           
                      <IconButton
                        disabled={ removeLinkLoading || hasError(valid) || loadingRemove} 
                        sx={{width: 20, height: 20, mt: 2, mr: 10, }} 
                        onClick={ removeLinkClick }
                        color="primary"
                      >
                        <RemoveCircle/>
                      </IconButton>
                    </Tooltip>

                    <Tooltip
                      title='Add Follower'
                      placement="top-start"
                      arrow
                    >
                      <IconButton 
                        disabled={ addFollowerLoading || hasError(valid) || loadingAddFlr}
                        sx={{width: 20, height: 20, mt:2, ml: 14.3,}} 
                        onClick={ addFollowerClick }
                        color="primary"
                      >
                        <AddCircle/>
                      </IconButton>

                    </Tooltip>

                    <TextField 
                      variant='outlined'
                      label='Follower'
                      size="small"
                      error={ valid['Follower']?.error }
                      helperText={ valid['Follower']?.helpTx ?? ' ' }
                      sx={{
                        m:1,
                        minWidth: 218,
                      }}
                      onChange={(e) => {
                        let input = e.target.value;
                        onlyInt('Follower', input, MaxUserNo, setValid);
                        setFollower(input);
                      }}
                      value={ follower }              
                    />

                    <Tooltip
                      title='Remove Obligor'
                      placement="top-end"
                      arrow
                    >

                      <IconButton
                        disabled={ removeFollowerLoading || hasError(valid) || loadingRemoveFlr} 
                        sx={{width: 20, height: 20, mt:2, mr: 10}} 
                        onClick={ removeFollowerClick }
                        color="primary"
                      >
                        <RemoveCircle/>
                      </IconButton>
                    
                    </Tooltip>

                  </Stack>
                </Paper>
              )}

              {links?.map((v) => (
                <AlongLinks key={ v.drager } link={ v } />
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

