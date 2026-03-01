import { useState } from "react";
import { Paper, Stack, TextField } from "@mui/material";
import { CheckCircleOutline, Grading, Update } from "@mui/icons-material";
import { HexType, MaxRatio } from "../../../../../../common";
import { FormResults, defFormResults, hasError, longSnParser, 
  onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfLeaderProps } from "../ActionsOfLeader";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";
import { useListOfProjectsVerifyMemberWork } from "../../../../../../../../../generated";


export function VerifyMemberWork({ addr, seqOfTeam, memberNo, refresh }: ActionsOfLeaderProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }

  const [ ratio, setRatio ] = useState('');

  const {
    isLoading: verifyMemberWorkLoading,
    write: verifyMemberWork,
  } = useListOfProjectsVerifyMemberWork({
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
    verifyMemberWork({
      args: seqOfTeam && memberNo
        ? [ BigInt(seqOfTeam),
            BigInt(memberNo),
            strNumToBigInt(ratio, 2)]
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
          disabled = { !(seqOfTeam && memberNo) || verifyMemberWorkLoading || hasError(valid) }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<CheckCircleOutline />}
          onClick={ handleClick }
          size='small'
        >
          Verify
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


