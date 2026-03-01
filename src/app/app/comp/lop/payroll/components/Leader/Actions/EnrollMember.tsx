import { useState } from "react";
import { useListOfProjectsEnrollMember } from "../../../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import { HexType, MaxPrice, MaxUserNo } from "../../../../../../common";
import { FormResults, defFormResults, hasError, longSnParser, 
  onlyInt, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfManagerProps } from "../../Manager/ActionsOfManager";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";


export function EnrollMember({ addr, seqOfTeam, refresh }: ActionsOfManagerProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }

  const {
    isLoading: enrollMemberLoading,
    write: enrollMember,
  } = useListOfProjectsEnrollMember({
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

  const [ userNo, setUserNo ] = useState<string>('0');
  const [ rate, setRate ] = useState<string>('0');
  const [ budget, setBudget ] = useState<string>('0');

  const handleClick = () => {
    enrollMember({
      args: seqOfTeam
      ? [ BigInt(seqOfTeam),
          BigInt(userNo),
          strNumToBigInt(rate, 2),
          strNumToBigInt(budget, 2)]
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
          error={ valid['UserNo']?.error }
          helperText={ valid['UserNo']?.helpTx ?? ' ' }  
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyInt('UserNo', input, MaxUserNo, setValid);
            setUserNo(input);
          }}
          value={ userNo }
          size='small'
        />

        <TextField 
          variant='outlined'
          label='Rate'
          error={ valid['Rate']?.error }
          helperText={ valid['Rate']?.helpTx ?? ' ' }  
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('Rate', input, MaxPrice, 2, setValid);
            setRate(input);
          }}
          value={ rate }
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
          disabled = { !seqOfTeam || userNo == '0' || rate == '0' || 
            budget == '0' || enrollMemberLoading || hasError(valid) }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<PersonAdd />}
          onClick={ handleClick }
          size='small'
        >
          Enroll
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


