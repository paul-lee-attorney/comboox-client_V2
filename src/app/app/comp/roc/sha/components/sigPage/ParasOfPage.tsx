import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { 
  Stack,
  Paper,
  Toolbar,
  TextField,
  Chip,
} from "@mui/material";

import { 
  HexType, MaxSeqNo,
} from "../../../../../common";

import {
  Update,
} from "@mui/icons-material"

import { useSigPageSetTiming } from "../../../../../../../../generated";


import { ParasOfSigPage, defParasOfSigPage, getParasOfPage, 
  parseParasOfPage } from "./sigPage";

import { FormResults, dateParser, defFormResults, hasError, onlyInt, refreshAfterTx } from "../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { SigPageProps } from "./Signatures";
import { useComBooxContext } from "../../../../../../_providers/ComBooxContextProvider";

export interface ParasOfPageProps extends SigPageProps {
  time: number;
  setTime: Dispatch<SetStateAction<number>>;
}

export function ParasOfPage({ addr, initPage, finalized, time, setTime }: ParasOfPageProps) {

  const { setErrMsg } = useComBooxContext();

  const [ parasOfPage, setParasOfPage ] = useState<ParasOfSigPage >(defParasOfSigPage);

  useEffect(()=>{
    getParasOfPage(addr, initPage).then(
      res => {
        setParasOfPage(parseParasOfPage(res));
      }
    ); 
  }, [addr, initPage, time]);

  interface Timing {
    signingDays: string,
    closingDays: string,
  }

  const defaultTiming:Timing = {
    signingDays: '0',
    closingDays: '0',
  }

  const [ timing, setTiming ] = useState<Timing>(defaultTiming);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [loading, setLoading] = useState(false);
  
  const refresh = () => {
    setTime(Date.now());
    setLoading(false);
  }

  const {
    isLoading: setTimingLoading,
    write: writeSetTiming,
  } = useSigPageSetTiming({
    address: addr,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refresh);
    }
  });

  const handleClick = ()=>{
    writeSetTiming({
      args: [ 
          initPage, 
          BigInt(timing.signingDays), 
          BigInt(timing.closingDays)
        ],
    });
  }

  return (
    <Paper elevation={3} sx={{ m:1 , p:1, border:1, borderColor:'divider' }}>
      <Stack direction="column" sx={{width:'100%'}} >
        
          <Paper elevation={3} sx={{ m:1 , p:1, border:1, borderColor:'divider' }}>
            <Stack direction={'row'} sx={{ alignItems:'start' }} >
              <Toolbar sx={{ textDecoration:'underline', mt: 2 }}>
                <h4>Props of SigPage</h4>
              </Toolbar>

              {!finalized && initPage && (
                <>
                  <TextField 
                    variant='outlined'
                    size='small'
                    label='SigningDays'
                    sx={{
                      m:1,
                      mt: 3,
                      ml: 11.2,
                      minWidth: 218,
                    }}
                    error={ valid['SigningDays']?.error }
                    helperText={ valid['SigningDays']?.helpTx ?? ' ' }

                    onChange={(e) => {
                      let input = e.target.value;
                      onlyInt('SigningDays', input, MaxSeqNo, setValid);
                      setTiming((v) => ({
                        ...v,
                        signingDays: input,
                      }))
                    }}
                    value={ timing?.signingDays }              
                  />

                  <TextField 
                    variant='outlined'
                        size='small'
                    label='ClosingDays'
                    error={ valid['ClosingDays']?.error }
                    helperText={ valid['ClosingDays']?.helpTx ?? ' ' }

                    sx={{
                      m:1,
                      mt:3,
                      minWidth: 218,
                    }}
                    onChange={(e) => {
                      let input = e.target.value;
                      onlyInt('ClosingDays', input, MaxSeqNo, setValid);
                      setTiming((v) => ({
                        ...v,
                        closingDays: input,
                      }))
                    }}
                    value={ timing?.closingDays }                                      
                  />

                  <LoadingButton
                    disabled={ setTimingLoading || hasError(valid) }
                    loading={loading}
                    loadingPosition="end"
                    variant="contained"
                    sx={{
                      height: 40,
                      m: 1,
                      mt: 3,
                    }}
                    endIcon={ <Update /> }
                    onClick={ handleClick }
                  >
                    Update
                  </LoadingButton>
                
                </>
              )}

            </Stack>

            <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider'}} >

              <Stack direction={'row'} sx={{ alignItems:'center' }} >    
                  <TextField 
                    variant='outlined'
                      size='small'
                    label='CirculateDate'
                    inputProps={{readOnly: true}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    value={ dateParser(parasOfPage.circulateDate.toString()) }
                  />

                  <TextField 
                    variant='outlined'
                      size='small'
                    label='SigningDays'
                    inputProps={{readOnly: true}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    value={ parasOfPage.signingDays }
                  />

                  <TextField 
                    variant='outlined'
                      size='small'
                    label='ClosingDays'
                    inputProps={{readOnly: true}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    value={ parasOfPage.closingDays }
                  />

                  <TextField 
                    variant='outlined'
                      size='small'
                    label='CounterOfBlanks'
                    inputProps={{readOnly: true}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    value={ parasOfPage.counterOfBlanks }
                  />

                  <TextField 
                    variant='outlined'
                      size='small'
                    label='CounterOfSigs'
                    inputProps={{readOnly: true}}
                    sx={{
                      m:1,
                      minWidth: 218,
                    }}
                    value={ parasOfPage.counterOfSigs }
                  />

                  <Chip
                    sx={{ minWidth: 128 }}
                    variant={ parasOfPage.established ? 'filled' : 'outlined' }
                    label={ parasOfPage.established ? 'Established' : 'Pending' } 
                    color={ parasOfPage.established ? 'success' : 'primary' }
                  />

              </Stack>

            </Paper>

          </Paper>

      </Stack>
    </Paper>
  );
} 

