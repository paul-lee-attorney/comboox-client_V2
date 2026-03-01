import { useState } from "react";
import { useListOfProjectsIncreaseTeamBudget } from "../../../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { Add, NorthEast } from "@mui/icons-material";
import { HexType, MaxPrice } from "../../../../../../common";
import { FormResults, defFormResults, hasError, longSnParser, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfManagerProps } from "../ActionsOfManager";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";


export function IncreaseTeamBudget({ addr, seqOfTeam, refresh }: ActionsOfManagerProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const [ deltaAmt, setDeltaAmt] = useState<string>('0');

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }


  const {
    isLoading: increaseTeamBudgetLoading,
    write: increaseTeamBudget,
  } = useListOfProjectsIncreaseTeamBudget ({
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
    increaseTeamBudget({
      args: seqOfTeam
      ? [ BigInt(seqOfTeam),
          strNumToBigInt(deltaAmt, 2)]
      : undefined,
    });
  }

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          label='SeqOfTeam'
          inputProps={{readOnly: true}}
          sx={{
            m:1,
            minWidth: 218,
          }}
          value={ longSnParser(seqOfTeam?.toString() ?? '0') }
          size='small'
        />

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
            setDeltaAmt(input);
          }}
          value={ deltaAmt }
          size='small'
        />

        <LoadingButton 
          disabled = { seqOfTeam == 0 || deltaAmt == '0' || increaseTeamBudgetLoading || hasError(valid) }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<NorthEast />}
          onClick={ handleClick }
          size='small'
        >
          Increase
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


