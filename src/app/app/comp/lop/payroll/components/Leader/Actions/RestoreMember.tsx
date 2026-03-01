import { useState } from "react";
import { Paper, Stack, TextField } from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import { HexType } from "../../../../../../common";
import { longSnParser, refreshAfterTx } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfLeaderProps } from "../ActionsOfLeader";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";
import { useListOfProjectsRestoreMember } from "../../../../../../../../../generated";

export function RestoreMember({ addr, seqOfTeam, memberNo, refresh }: ActionsOfLeaderProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }

  const {
    isLoading: restoreMemberLoading,
    write: restoreMember,
  } = useListOfProjectsRestoreMember({
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
    restoreMember({
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
          disabled = { !(seqOfTeam && memberNo) || 
            restoreMemberLoading }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<PersonAdd />}
          onClick={ handleClick }
          size='small'
        >
          Restore
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


