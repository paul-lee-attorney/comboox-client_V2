import { useState } from "react";

import { AddrZero, HexType } from "../../../../common";

import { useGeneralKeeperProposeToDeprecateGk } from "../../../../../../../generated-v1";

import { Divider, Paper, Stack, TextField } from "@mui/material";
import { EmojiPeople } from "@mui/icons-material";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from "../../../../common/toolsKit";
import { CreateMotionProps } from "../../../bmm/components/CreateMotionOfBoardMeeting";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function ProposeToDeprecateGK({ refresh }:CreateMotionProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ receiver, setReceiver ] = useState<HexType>(AddrZero);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults=()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: proposeToDeprecateGKLoading,
    write: proposeToDeprecateGK
  } = useGeneralKeeperProposeToDeprecateGk({
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
    proposeToDeprecateGK({
      args: [receiver],
    });
  };

  return (

    <Paper elevation={3} sx={{ m:1, p:1, color:'divider', border:1 }}  >

      <Stack direction="row" sx={{ alignItems:'start' }} >
        <TextField 
          variant='outlined'
          label='AddrOfReceiver'
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
            setReceiver(input);
          }}
          value={ receiver }
        />

        <Divider orientation="vertical" flexItem sx={{m:1}} />

        <LoadingButton
          disabled={ proposeToDeprecateGKLoading || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          variant="contained"
          endIcon={<EmojiPeople />}
          sx={{ m:1, minWidth:128 }}
          onClick={ handleClick }
        >
          Propose
        </LoadingButton>

      </Stack>
    </Paper>
  );
}

