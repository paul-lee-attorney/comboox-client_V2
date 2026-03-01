import { useState } from "react";
import { useListOfProjectsAdjustSalary } from "../../../../../../../../../generated-v1";
import { FormControl, InputLabel, MenuItem, Paper, 
  Select, Stack, TextField } from "@mui/material";
import { ImportExport } from "@mui/icons-material";
import { HexType, MaxPrice } from "../../../../../../common";
import { FormResults, defFormResults, hasError, longSnParser, 
  onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfLeaderProps } from "../ActionsOfLeader";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

export function AdjustSalary({ addr, seqOfTeam, memberNo, refresh }: ActionsOfLeaderProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    setLoading(false);
    refresh();
  }

  const [ direction, setDirection ] = useState(true);
  const [ delta, setDelta ] = useState('0');

  const {
    isLoading: adjustSalaryLoading,
    write: adjustSalary,
  } = useListOfProjectsAdjustSalary({
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
    adjustSalary({
      args: seqOfTeam && memberNo
        ? [ BigInt(seqOfTeam),
            BigInt(memberNo),
            direction,
            strNumToBigInt(delta, 2)]
        : undefined,
    });
  }

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <FormControl variant="outlined" size="small" sx={{ m:1, minWidth: 168 }}>
          <InputLabel id="direction-label">Direction</InputLabel>
          <Select
            labelId="direction-label"
            id="direction-select"
            label="Direction"
            value={ direction ? 'True' : 'False' }
            onChange={(e) => setDirection( e.target.value == 'True')}
          >
            <MenuItem value='True'>Increase</MenuItem>
            <MenuItem value='False'>Decrease</MenuItem>
          </Select>
        </FormControl>

        <TextField 
          variant='outlined'
          label='SeqOfTeam'
          inputProps={{readOnly: true}}
          sx={{
            m:1,
            minWidth: 218,
          }}
          value={ longSnParser(seqOfTeam?.toString() ?? '0')}
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
          label='DeltaAmt'
          error={ valid['DeltaAmt']?.error }
          helperText={ valid['DeltaAmt']?.helpTx ?? ' ' }  
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('DeltaAmt', input, MaxPrice, 2, setValid);
            setDelta(input);
          }}
          value={ delta }
          size='small'
        />

        <LoadingButton 
          disabled = { !(seqOfTeam && memberNo) || delta == '0' || 
            adjustSalaryLoading || hasError(valid) }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<ImportExport />}
          onClick={ handleClick }
          size='small'
        >
          Adjust
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


