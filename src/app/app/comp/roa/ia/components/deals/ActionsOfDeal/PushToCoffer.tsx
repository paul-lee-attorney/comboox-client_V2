import { useState } from "react";
import { Bytes32Zero, HexType } from "../../../../../../common";
import { defaultDeal } from "../../../ia";

import { useCompKeeperPushToCoffer } from "../../../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { DateTimeField } from "@mui/x-date-pickers";
import { LockClock } from "@mui/icons-material";
import { ActionsOfDealProps } from "../ActionsOfDeal";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx, stampToUtc, utcToStamp } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

export function PushToCoffer({addr, deal, setOpen, setDeal, refresh}:ActionsOfDealProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ hashLock, setHashLock ] = useState<HexType>(Bytes32Zero);
  const [ closingDate, setClosingDate ] = useState<number>(0);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    setDeal(defaultDeal);
    refresh();
    setLoading(false);
    setOpen(false);    
  }

  const {
    isLoading: pushToCofferLoading,
    write: pushToCoffer,
  } = useCompKeeperPushToCoffer({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true)
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  const handleClick = ()=> {
    pushToCoffer({
      args: [
        addr, 
        BigInt(deal.head.seqOfDeal), 
        hashLock, 
        BigInt(closingDate) 
      ], 
    });
  };

  return (

    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >
      <Stack direction={'row'} sx={{ alignItems:'start'}} >

        <TextField 
          variant='outlined'
          label='HashLock'
          size="small"
          error={ valid['HashLock']?.error }
          helperText={ valid['HashLock']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 685,
          }}
          onChange={(e) => {
            let input = HexParser( e.target.value );
            onlyHex('HashLock', input, 64, setValid);
            setHashLock(input);
          }}
          value={ hashLock }
        />

        <DateTimeField
          label='ClosingDate'
          size="small"
          helperText=' '
          sx={{
            m:1,
            minWidth: 218,
          }} 
          value={ stampToUtc(closingDate) }
          onChange={(date) => setClosingDate(utcToStamp(date))}
          format='YYYY-MM-DD HH:mm:ss'
        />

        <LoadingButton 
          disabled = { pushToCofferLoading || deal.body.state > 1 || hasError(valid)}
          loading = {loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<LockClock />}
          onClick={ handleClick }
          size='small'
        >
          Lock Share
        </LoadingButton>


      </Stack>

    </Paper>



  );
  
}