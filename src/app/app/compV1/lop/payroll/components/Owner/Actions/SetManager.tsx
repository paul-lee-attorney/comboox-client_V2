import { useState } from "react";
import { useListOfProjectsSetManager } from "../../../../../../../../../generated-v1";
import { Paper, Stack, TextField } from "@mui/material";
import { Update } from "@mui/icons-material";
import { HexType, MaxUserNo } from "../../../../../../common";
import { FormResults, defFormResults, hasError, 
  onlyInt, refreshAfterTx } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfOwnerProps } from "../ActionsOfOwner";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

export function SetManager({ addr, refresh }: ActionsOfOwnerProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [loading, setLoading] = useState(false);

  const updateInfo = ()=>{
    refresh();
    setLoading(false);
  }

  const [ manager, setManager] = useState<number>();

  const {
    isLoading: setManagerLoading,
    write: setPM,
  } = useListOfProjectsSetManager({
    address: addr,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash:HexType = data.hash;
      refreshAfterTx(hash, updateInfo);
    }
  });

  const handleClick = () => {
    setPM({
      args: [ BigInt(manager ?? '0') ],
    });
  }

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          label='Manager'
          error={ valid['Manager']?.error }
          helperText={ valid['Manager']?.helpTx ?? ' ' }  
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyInt('Manager', input, MaxUserNo, setValid);
            setManager(Number(input));
          }}
          value={ manager }
          size='small'
        />

        <LoadingButton 
          disabled = { setManagerLoading || hasError(valid) }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<Update />}
          onClick={ handleClick }
          size='small'
        >
          Set
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


