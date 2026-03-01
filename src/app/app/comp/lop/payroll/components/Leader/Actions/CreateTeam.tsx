import { useState } from "react";
import { useListOfProjectsCreateTeam } from "../../../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { GroupAdd } from "@mui/icons-material";
import { HexType, MaxPrice, MaxSeqNo } from "../../../../../../common";
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfOwnerProps } from "../../Owner/ActionsOfOwner";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";


export function CreateTeam({ addr, refresh }: ActionsOfOwnerProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }

  const {
    isLoading: createTeamLoading,
    write: createTeam,
  } = useListOfProjectsCreateTeam({
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
    createTeam({
      args: [ 
        strNumToBigInt(budget, 2)
      ],
    });
  }

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

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
          disabled = { budget == '0' || createTeamLoading || hasError(valid) }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<GroupAdd />}
          onClick={ handleClick }
          size='small'
        >
          Create
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


