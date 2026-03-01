import { useState } from "react";
import { useListOfProjectsFixBudget } from "../../../../../../../../../generated-v1";
import { Paper, Stack } from "@mui/material";
import { Approval } from "@mui/icons-material";
import { HexType } from "../../../../../../common";
import { FormResults, defFormResults, hasError, refreshAfterTx } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfOwnerProps } from "../../Owner/ActionsOfOwner";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

export function FixBudget({ addr, refresh }: ActionsOfOwnerProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }

  const {
    isLoading: fixBudgetLoading,
    write: fixBudget,
  } = useListOfProjectsFixBudget({
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

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <LoadingButton 
          disabled = { fixBudgetLoading || hasError(valid) }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<Approval />}
          onClick={ () => fixBudget() }
          size='small'
        >
          Fix
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


