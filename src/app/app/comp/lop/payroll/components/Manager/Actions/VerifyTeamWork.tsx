import { useState } from "react";
import { useListOfProjectsVerifyTeamWork } from "../../../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { Verified } from "@mui/icons-material";
import { HexType, MaxRatio} from "../../../../../../common";
import { FormResults, defFormResults, hasError, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfManagerProps } from "../ActionsOfManager";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";


export function VerifyTeamWork({ addr, seqOfTeam, refresh }: ActionsOfManagerProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const [ ratio, setRatio] = useState<string>('0');

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }

  const {
    isLoading: verifyTeamWorkLoading,
    write: verifyTeamWork,
  } = useListOfProjectsVerifyTeamWork ({
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
    verifyTeamWork({
      args: seqOfTeam 
      ? [ BigInt(seqOfTeam), strNumToBigInt(ratio, 2)]
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

        <TextField 
          variant='outlined'
          label='Ratio (%)'
          error={ valid['Ratio']?.error }
          helperText={ valid['Ratio']?.helpTx ?? ' ' }  
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('Ratio', input, MaxRatio, 2, setValid);
            setRatio(input);
          }}
          value={ ratio }
          size='small'
        />

        <LoadingButton 
          disabled = { seqOfTeam == 0 || ratio == '0' || verifyTeamWorkLoading || hasError(valid) }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<Verified />}
          onClick={ handleClick }
          size='small'
        >
          Verify
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


