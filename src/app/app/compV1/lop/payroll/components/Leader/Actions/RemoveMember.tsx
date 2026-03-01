import { useState } from "react";
import { useListOfProjectsRemoveMember } from "../../../../../../../../../generated-v1";
import { Paper, Stack, TextField } from "@mui/material";
import { PersonRemove } from "@mui/icons-material";
import { HexType } from "../../../../../../common";
import { FormResults, defFormResults, hasError, longSnParser, refreshAfterTx } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfLeaderProps } from "../ActionsOfLeader";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";


export function RemoveMember({ addr, seqOfTeam, memberNo, refresh }: ActionsOfLeaderProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }

  const {
    isLoading: removeMemberLoading,
    write: removeMember,
  } = useListOfProjectsRemoveMember({
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
    removeMember({
      args: seqOfTeam && memberNo 
        ? [ BigInt(seqOfTeam),
            BigInt(memberNo)]
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
          label='UserNo'
          inputProps={{readOnly: true}}
          sx={{
            m:1,
            minWidth: 218,
          }}
          value={ longSnParser(memberNo?.toString() ?? '0') }
          size='small'
        />

        <LoadingButton 
          disabled = { !(seqOfTeam && memberNo) || removeMemberLoading }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<PersonRemove />}
          onClick={ handleClick }
          size='small'
        >
          Remove
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


