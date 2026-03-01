import { useState } from "react";
import { HexType, booxMap } from "../../../../common";

import { 
  useCompKeeperWithdrawPayInAmt,
  useRegisterOfSharesGetLocker, 
} from "../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { RedoOutlined } from "@mui/icons-material";
import { DateTimeField } from "@mui/x-date-pickers";

import { StrLocker, defaultStrLocker, parseOrgLocker } from "../../../../rc";
import { 
  FormResults, 
  HexParser, 
  baseToDollar, 
  defFormResults, 
  hasError, onlyHex, 
  refreshAfterTx,
  stampToUtc,
} from "../../../../common/toolsKit";
import { ActionsOfCapProps } from "../ActionsOfCap";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function WithdrawPayInAmt({ share, setDialogOpen, refresh }: ActionsOfCapProps ) {

  const { gk, boox, setErrMsg } = useComBooxContext();

  const [ locker, setLocker ] = useState<StrLocker>(defaultStrLocker);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const {
    refetch: getLocker
  } = useRegisterOfSharesGetLocker({
    address: boox ? boox[booxMap.ROS] : undefined,
    args: [ locker.hashLock ],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(res) {
      setLocker(parseOrgLocker(locker.hashLock, res));
    }
  })

  const refreshLockers = ()=>{
    getLocker();
    setLoading(false);
    refresh();
    setDialogOpen(false);
  }

  const {
    isLoading: withdrawPayInAmtLoading,
    write: withdrawPayInAmt,     
  } = useCompKeeperWithdrawPayInAmt({
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

  const withdrawPayInAmtClick = ()=>{
    withdrawPayInAmt({
      args: [ 
        locker.hashLock, 
        BigInt(share.head.seqOfShare) 
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

    <Stack direction={'row'} sx={{ alignItems:'start' }}>
      <TextField 
        variant='outlined'
        label='HashLock'
        error={ valid['HashLock']?.error }
        helperText={ valid['HashLock']?.helpTx ?? ' ' }    
        sx={{
          m:1,
          minWidth: 630,
        }}
        onBlur={ ()=>getLocker() }
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
        inputProps={{ readOnly: true}}
        sx={{
          m:1,
          minWidth: 218,
        }}

        value={ baseToDollar(locker.head.value) }
        size="small"
      />

      <DateTimeField
        label='ExpireDate'
        helperText=' '
        inputProps={{ readOnly: true }}
        sx={{
          m:1,
          minWidth: 218,
        }} 
        value={ stampToUtc(locker.head.expireDate) }
        format='YYYY-MM-DD HH:mm:ss'
        size="small"
      />          

      <LoadingButton
        variant="contained"
        disabled={ withdrawPayInAmtLoading || hasError(valid)}
        loading={ loading }
        loadingPosition="end"
        sx={{minWidth: 128, m: 1,}} 
        onClick={ withdrawPayInAmtClick }
        color="primary"
        endIcon={< RedoOutlined />}
      >
        Withdraw
      </LoadingButton>
    </Stack>

    </Paper>
  )

}





