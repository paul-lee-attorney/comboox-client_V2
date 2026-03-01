import { useState } from "react";
import { Bytes32Zero, HexType } from "../../../../common";

import { useCompKeeperExecActionOfGm } from "../../../../../../../generated";

import { IconButton, Paper, Stack, TextField, Tooltip } from "@mui/material";
import { AddCircle, RemoveCircle, Surfing } from "@mui/icons-material";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, onlyNum, refreshAfterTx, strNumToBigInt } from "../../../../common/toolsKit";

import { Action, defaultAction } from "../../meetingMinutes";

import { LoadingButton } from "@mui/lab";
import { ActionsOnMotionProps } from "../ActionsOnMotion";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { StepOfAction } from "../StepOfAction";

export function ExecActionOfGm({motion, setOpen, refresh}:ActionsOnMotionProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ actions, setActions ] = useState<Action[]>([]);
  const [ action, setAction ] = useState<Action>(defaultAction);
  const [ desHash, setDesHash ] = useState<HexType>(Bytes32Zero);
  
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults=()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: execActionLoading,
    write: execAction,
  } = useCompKeeperExecActionOfGm({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  const handleClick = ()=> {
    execAction({
      args: [
        BigInt(motion.votingRule.seqOfRule),
        actions.map(v => (v.target)), 
        actions.map(v => (strNumToBigInt(v.value, 9) * 10n ** 9n)),
        actions.map(v => (v.params)),
        desHash, motion.head.seqOfMotion
      ],
    });
  };

  const addAction = () => {
    setActions(v => {
      let arr = [...v];
      arr.push(action);      
      return arr;
    })
  }

  const removeAction = () => {
    setActions(v => {
      let arr = [...v];
      arr.pop();      
      return arr;
    })
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >

      <Stack direction="row" sx={{ alignItems:'start' }} >

        <TextField 
          variant='outlined'
          label='DesHash / CID in IPFS'
          size="small"
          error={ valid['DesHash']?.error }
          helperText={ valid['DesHash']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 630,
          }}
          onChange={(e) => {
            let input = HexParser( e.target.value );
            onlyHex('DesHash', input, 64, setValid);
            setDesHash(input);
          }}
          value={ desHash }
        />

        <LoadingButton
          disabled={ execActionLoading || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          variant="contained"
          size="small"
          endIcon={<Surfing />}
          sx={{ m:1, minWidth:218 }}
          onClick={ handleClick }
        >
          Execute
        </LoadingButton>

      </Stack>

      <hr />

      <Stack direction="row" sx={{ alignItems:'start' }} >

        <Tooltip
          title='AddSmartContract'
          placement="top-start"
          arrow            
        >
          <span>
          <IconButton 
            sx={{width: 20, height: 20, m: 1, p: 1}} 
            onClick={ addAction }
            color="primary"
          >
            <AddCircle />
          </IconButton>
          </span>
        </Tooltip>

        <Tooltip
          title='RemoveSmartContract'
          placement="top-start"
          arrow            
        >
          <span>
          <IconButton 
            disabled={ actions.length < 1 }
            sx={{width: 20, height: 20, m: 1, p: 1, }} 
            onClick={ removeAction }
            color="primary"
          >
            <RemoveCircle />
          </IconButton>
          </span>
        </Tooltip>

        <TextField 
          variant='outlined'
          label='Address'
          size="small"
          error={ valid['Address']?.error }
          helperText={ valid['Address']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 450,
          }}
          onChange={(e) => {
            let input = HexParser( e.target.value );
            onlyHex('Address', input, 40, setValid);
            setAction(v => ({
              ...v,
              target: input,
            }));
          }}
          value={ action.target }
        />

        <TextField 
          variant='outlined'
          label='Value'
          size="small"
          error={ valid['Value']?.error }
          helperText={ valid['Value']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={(e) => {
            let input = e.target.value;
            onlyNum('Value', input, 0n, 9, setValid);
            setAction(v => ({
              ...v,
              value: input,
            }));
          }}
          value={ action.value }
        />

        <TextField 
          variant='outlined'
          label='Params'
          size="small"
          error={ valid['Params']?.error }
          helperText={ valid['Params']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 630,
          }}
          onChange={(e) => {
            let input = HexParser( e.target.value );
            onlyHex('Params', input, 0, setValid);
            setAction(v => ({
              ...v,
              params: input
              }));
          }}
          value={ action.params }
        />

      </Stack>
      
      {actions.map((v,i) => (
        <StepOfAction key={i} index={i} action={actions[i]} />
      ))}

    </Paper>
  );
}


