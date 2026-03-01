import { useState } from "react";
import { useListOfProjectsReplaceLeader } from "../../../../../../../../../generated-v1";
import { Paper, Stack, TextField } from "@mui/material";
import { CurrencyExchange, Loop } from "@mui/icons-material";
import { HexType, MaxUserNo } from "../../../../../../common";
import { FormResults, defFormResults, hasError, longSnParser, 
  onlyInt, refreshAfterTx } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfManagerProps } from "../ActionsOfManager";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";


export function ReplaceLeader({ addr, seqOfTeam, refresh }: ActionsOfManagerProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const [ leader, setLeader] = useState<string>('0');

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }

  const {
    isLoading: replaceLeaderLoading,
    write: replaceLeader,
  } = useListOfProjectsReplaceLeader ({
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
    replaceLeader({
      args: seqOfTeam
      ? [ BigInt(seqOfTeam),
          BigInt(leader)]
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
          label='Leader'
          error={ valid['Leader']?.error }
          helperText={ valid['Leader']?.helpTx ?? ' ' }  
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyInt('Leader', input, MaxUserNo, setValid);
            setLeader(input);
          }}
          value={ leader }
          size='small'
        />

        <LoadingButton 
          disabled = { seqOfTeam == 0 || leader == '0' || replaceLeaderLoading || hasError(valid) }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<Loop />}
          onClick={ handleClick }
          size='small'
        >
          Replace
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


