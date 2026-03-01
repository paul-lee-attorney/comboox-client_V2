import { useEffect, useState } from "react";

import { AddrZero, HexType } from "../../../../common";

import { useGeneralKeeperDeprecateGk } from "../../../../../../../generated-v1";

import { Divider, Paper, Stack, TextField } from "@mui/material";
import { FolderZipOutlined } from "@mui/icons-material";
import { refreshAfterTx } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { ActionsOnMotionProps } from "../ActionsOnMotion";

export function DeprecateGK({ motion, setOpen, refresh }:ActionsOnMotionProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ receiver, setReceiver ] = useState<HexType>(AddrZero);

  const [ loading, setLoading ] = useState(false);

  const updateResults=()=>{
    refresh();
    setLoading(false);
    setOpen(false);
  }

  useEffect(()=>{
    setReceiver(`0x${motion.contents.toString(16).padStart(66, '0').substring(26)}`);
  }, [setReceiver, motion]);

  const {
    isLoading: proposeToDeprecateGKLoading,
    write: proposeToDeprecateGK
  } = useGeneralKeeperDeprecateGk({
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
      args: [receiver, motion.head.seqOfMotion],
    });
  };

  return (

    <Paper elevation={3} sx={{ m:1, p:1, color:'divider', border:1 }}  >

      <Stack direction="row" sx={{ alignItems:'center' }} >
        <TextField 
          variant='outlined'
          label='AddrOfReceiver'
          size="small"
          inputProps={{readOnly: true}}

          sx={{
            m:1,
            minWidth: 450,
          }}

          value={ receiver }
        />

        <Divider orientation="vertical" flexItem sx={{m:1}} />

        <LoadingButton
          disabled={ proposeToDeprecateGKLoading }
          loading={loading}
          loadingPosition="end"
          variant="contained"
          endIcon={<FolderZipOutlined />}
          sx={{ m:1, minWidth:128 }}
          onClick={ handleClick }
        >
          Deprecate
        </LoadingButton>

      </Stack>
    </Paper>
  );
}

