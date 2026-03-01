import { useState } from "react";
import { ActionsOfOptionProps } from "../ActionsOfOption";
import { useCompKeeperUpdateOracle } from "../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { Update } from "@mui/icons-material";
import { HexType, MaxData } from "../../../../common";
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

interface Paras {
  p1: string;
  p2: string;
  p3: string;
}

const defaultParas:Paras = {
  p1: '0',
  p2: '0',
  p3: '0',
}

export function UpdateOracle({seqOfOpt, setOpen, refresh}:ActionsOfOptionProps) {

  const { gk, setErrMsg } = useComBooxContext();
  const [paras, setParas] = useState<Paras>(defaultParas);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: updateOracleLoading,
    write: updateOracle,
  } = useCompKeeperUpdateOracle({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  })

  const handleClick = () => {
    updateOracle({
      args: [ 
          BigInt(seqOfOpt), 
          strNumToBigInt(paras.p1, 4), 
          strNumToBigInt(paras.p2, 4), 
          strNumToBigInt(paras.p3, 4)
      ],
    });
  };

  return(
    <Paper elevation={3} sx={{alignItems:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          label='Parameter_1'
          error={ valid['Para_1']?.error }
          helperText={ valid['Para_1']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('Para_1', input, MaxData, 4, setValid);
            setParas(v =>({
              ...v,
              p1: input,
            }));
          }}
          value={ paras.p1 }
          size='small'
        />

        <TextField 
          variant='outlined'
          label='Parameter_2'
          error={ valid['Para_2']?.error }
          helperText={ valid['Para_2']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('Para_2', input, MaxData, 4, setValid);
            setParas(v =>({
              ...v,
              p2: input,
            }));
          }}
          value={ paras.p2 }
          size='small'
        />

        <TextField 
          variant='outlined'
          label='Parameter_3'
          error={ valid['Para_3']?.error }
          helperText={ valid['Para_3']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('Para_3', input, MaxData, 4, setValid);
            setParas(v =>({
              ...v,
              p3: input,
            }));
          }}
          value={ paras.p3 }
          size='small'
        />

        <LoadingButton 
          disabled={ updateOracleLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 168, height: 40 }} 
          variant="contained" 
          endIcon={ <Update /> }
          onClick={ handleClick }
          size='small'
        >
          Update
        </LoadingButton>        

      </Stack>
    </Paper>
    
  );

}

