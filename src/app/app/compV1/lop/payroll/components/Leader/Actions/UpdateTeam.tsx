import { useState } from "react";
import { useListOfProjectsUpdateTeam } from "../../../../../../../../../generated-v1";
import { Paper, Stack, TextField } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { HexType, MaxPrice } from "../../../../../../common";
import { FormResults, defFormResults, hasError, longSnParser, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfManagerProps } from "../../Manager/ActionsOfManager";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

export function UpdateTeam({ addr, seqOfTeam, refresh }: ActionsOfManagerProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }

  const {
    isLoading: updateTeamLoading,
    write: updateTeam,
  } = useListOfProjectsUpdateTeam({
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

  const [ budget, setBudget ] = useState<string>('0');

  const handleClick = () => {
    updateTeam({
      args: seqOfTeam
      ? [ BigInt(seqOfTeam),
          strNumToBigInt(budget, 2)
        ]
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
          label='Budget'
          error={ valid['Budget']?.error }
          helperText={ valid['Budget']?.helpTx ?? ' ' }  
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('Budget', input, MaxPrice, 2, setValid);
            setBudget(input);
          }}
          value={ budget }
          size='small'
        />

        <LoadingButton 
          disabled = { seqOfTeam == 0 || budget == '0' ||
            updateTeamLoading || hasError(valid) }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<Edit />}
          onClick={ handleClick }
          size='small'
        >
          Update
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


