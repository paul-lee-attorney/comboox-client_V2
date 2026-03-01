import { useState } from "react";
import { useListOfProjectsIncreaseBudget } from "../../../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { Update } from "@mui/icons-material";
import { HexType, MaxPrice, MaxSeqNo } from "../../../../../../common";
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfOwnerProps } from "../../Owner/ActionsOfOwner";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";


export function IncreaseBudget({ addr, refresh }: ActionsOfOwnerProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const [ deltaQty, setDeltaQty] = useState<string>('0');

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }

  const {
    isLoading: increaseBudgetLoading,
    write: increaseBudget,
  } = useListOfProjectsIncreaseBudget ({
    address: addr,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash:HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  const handleClick = () => {
    increaseBudget({
      args: [ 
        strNumToBigInt(deltaQty, 2)
      ],
    });
  }

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          label='DeltaAmt'
          error={ valid['DeltaAmt']?.error }
          helperText={ valid['DeltaAmt']?.helpTx ?? ' ' }  
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('DeltaAmt', input, MaxPrice, 2, setValid);
            setDeltaQty(input);
          }}
          value={ deltaQty }
          size='small'
        />

        <LoadingButton 
          disabled = { increaseBudgetLoading || hasError(valid) }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<Update />}
          onClick={ handleClick }
          size='small'
        >
          Increase
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


