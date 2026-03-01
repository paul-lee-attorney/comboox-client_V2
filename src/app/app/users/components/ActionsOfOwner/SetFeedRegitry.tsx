
import { FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField } from '@mui/material';

import { useRegCenterSetPriceFeed } from '../../../../../../generated';

import { AddrOfRegCenter, AddrZero, HexType, currencies } from '../../../common';
import { BorderColor } from '@mui/icons-material';
import { useState } from 'react';
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from '../../../common/toolsKit';
import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';
import { ActionsOfOwnerProps } from '../ActionsOfOwner';


export function SetFeedRegistry({refresh}:ActionsOfOwnerProps) {

  const { setErrMsg } = useComBooxContext();

  const [ seq, setSeq ] = useState(0);
  const [ newFeed, setNewFeed ] = useState<HexType>(AddrZero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [loading, setLoading] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: setFeedRegLoading,
    write: setFeedReg
  } = useRegCenterSetPriceFeed({
    address: AddrOfRegCenter,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  })

  const setFeedRegClick = ()=>{
    setFeedReg({args:[ BigInt(seq), newFeed]});
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{alignItems:'start', justifyContent:'start'}} >

        <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 218 }}>
          <InputLabel id="seqOfCurrency-label">seqOfCurrency</InputLabel>
          <Select
            labelId="seqOfCurrency-label"
            id="seqOfCurrency-select"
            label="SeqOfCurrency"
            value={ seq.toString() }
            onChange={(e) => setSeq(Number(e.target.value))}
          >
            {currencies.map((v, i) => (
              <MenuItem key={i} value={i.toString()}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField 
          size="small"
          variant='outlined'
          label='FeedRegistry'
          error={ valid['FeedRegistry']?.error }
          helperText={ valid['FeedRegistry']?.helpTx ?? ' ' }          
          sx={{
            m:1,
            minWidth: 456,
          }}
          value={ newFeed }
          onChange={e => {
            let input = HexParser( e.target.value );
            onlyHex('FeedRegistry', input, 40, setValid);
            setNewFeed(input);          
          }}
        />

        <LoadingButton 
          disabled={ setFeedRegLoading || hasError(valid) } 
          loading={loading}
          loadingPosition='end'
          onClick={ setFeedRegClick }
          variant='contained'
          sx={{ m:1, ml:2, minWidth:128 }} 
          endIcon={<BorderColor />}       
        >
          Set
        </LoadingButton>

      </Stack>
    </Paper>
  )
}
