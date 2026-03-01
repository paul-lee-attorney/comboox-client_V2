import { useState } from "react";
import { useListOfProjectsApplyWorkingHour } from "../../../../../../../../../generated-v1";
import { Paper, Stack, TextField } from "@mui/material";
import { BorderColor } from "@mui/icons-material";
import { HexType, MaxSeqNo } from "../../../../../../common";
import { FormResults, defFormResults, hasError, longSnParser, onlyInt, refreshAfterTx } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfManagerProps } from "../../Manager/ActionsOfManager";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";


export function ApplyWorkingHour({ addr, seqOfTeam, refresh }: ActionsOfManagerProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }

  const {
    isLoading: applyWorkingHourLoading,
    write: applyWorkingHour,
  } = useListOfProjectsApplyWorkingHour({
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

  const [ hrs, setHrs ] = useState<string>('0');

  const handleClick = () => {
    applyWorkingHour({
      args: seqOfTeam
      ? [ BigInt(seqOfTeam),
          BigInt(hrs)]
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
          label='Hours'
          error={ valid['Hours']?.error }
          helperText={ valid['Hours']?.helpTx ?? ' ' }  
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyInt('Hours', input, MaxSeqNo, setValid);
            setHrs(input);
          }}
          value={ hrs }
          size='small'
        />

        <LoadingButton 
          disabled = { seqOfTeam == undefined || hrs == '0' || applyWorkingHourLoading || hasError(valid) }
          loading={ loading }
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<BorderColor />}
          onClick={ handleClick }
          size='small'
        >
          Apply
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


