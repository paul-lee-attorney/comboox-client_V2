import { useState } from "react";
import { useListOfProjectsEnrollTeam } from "../../../../../../../../../generated-v1";
import { Paper, Stack, TextField } from "@mui/material";
import { BorderColor } from "@mui/icons-material";
import { HexType } from "../../../../../../common";
import { FormResults, defFormResults, hasError, refreshAfterTx } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfManagerProps } from "../ActionsOfManager";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";


export function EnrollTeam({ addr, seqOfTeam, refresh }: ActionsOfManagerProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }

  const {
    isLoading: enrollTeamLoading,
    write: enrollTeam,
  } = useListOfProjectsEnrollTeam ({
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
    enrollTeam({
      args: seqOfTeam 
      ? [BigInt(seqOfTeam)]
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
          value={ seqOfTeam?.toString().padStart(6, '0') }
          size='small'
        />

        <LoadingButton 
          disabled = { seqOfTeam == undefined || enrollTeamLoading || hasError(valid) }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<BorderColor />}
          onClick={ handleClick }
          size='small'
        >
          Enroll
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


