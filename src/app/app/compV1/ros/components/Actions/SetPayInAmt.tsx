import { useState } from "react";
import { HexType, MaxData } from "../../../../common";

import { 
  useGeneralKeeperSetPayInAmt, 
} from "../../../../../../../generated-v1";
import { Paper, Stack, TextField } from "@mui/material";
import { Lock } from "@mui/icons-material";
import { DateTimeField } from "@mui/x-date-pickers";
import { StrLocker, defaultStrLocker } from "../../../../rc";
import { 
  FormResults, 
  HexParser, 
  defFormResults, 
  hasError, onlyHex, 
  onlyNum, 
  refreshAfterTx, 
  stampToUtc, 
  strNumToBigInt, 
  utcToStamp
} from "../../../../common/toolsKit";
import { ActionsOfCapProps } from "../ActionsOfCap";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function SetPayInAmt({ share, setDialogOpen, refresh }: ActionsOfCapProps ) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const refreshLockers = ()=>{
    setLoading(false);
    refresh();
    setDialogOpen(false);
  }

  const [ locker, setLocker ] = useState<StrLocker>(defaultStrLocker);

  const {
    isLoading: setPayInAmtLoading,
    write: setPayInAmt,
  } = useGeneralKeeperSetPayInAmt({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshLockers);
    }    
  });

  const setPayInAmtClick = ()=>{
    setPayInAmt({
      args: [ 
        BigInt(share.head.seqOfShare), 
        strNumToBigInt(locker.head.value, 4), 
        BigInt(locker.head.expireDate),
        locker.hashLock
      ],
    });
  };

  return (
    <Paper elevation={3} sx={{
      p:1, m:1,
      border: 1, 
      borderColor:'divider' 
      }} 
    >

      <Stack direction={'row'} sx={{ alignItems:'start'}} >

        <TextField 
          variant='outlined'
          label='HashLock'
          error={ valid['HashLock']?.error }
          helperText={ valid['HashLock']?.helpTx ?? ' ' }    
          sx={{
            m:1,
            minWidth: 630,
          }}
          onChange={(e) => {
            let input = HexParser( e.target.value );
            onlyHex('HashLock', input, 64, setValid);
            setLocker(v => ({
              ...v,
              hashLock: input,
            }));
          }}
          value={ locker.hashLock }
          size="small"
        />

        <TextField 
          variant='outlined'
          label='Amount'
          error={ valid['Amount']?.error }
          helperText={ valid['Amount']?.helpTx ?? ' ' }    
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('Amount', input, MaxData, 4, setValid);
            setLocker(v => {
              let lk = v;
              lk.head.value = input;
              return lk;
            });
          }}

          value={ locker.head.value }
          size="small"
        />

        <DateTimeField
          label='ExpireDate'
          helperText=' '
          sx={{
            m:1,
            minWidth: 218,
          }} 
          value={ stampToUtc(locker.head.expireDate) }
          onChange={(date) => setLocker(v => {
            let lk = v;
            lk.head.expireDate = utcToStamp(date);
            return lk;
          })}
          format='YYYY-MM-DD HH:mm:ss'
          size="small"
        />

        <LoadingButton
          variant="contained"
          disabled={ setPayInAmtLoading || hasError(valid)}
          loading={ loading }
          loadingPosition="end"
          sx={{width: 128, m: 1 }} 
          onClick={ setPayInAmtClick }
          color="primary"
          endIcon={< Lock />}
        >
          Lock
        </LoadingButton>

      </Stack>

    </Paper>
  )

}





