
import { Dispatch, SetStateAction, useState } from "react";

import { Stack, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { DriveFileRenameOutline } from "@mui/icons-material";

import { useCompKeeperAcceptSha } from "../../../../../../../../generated";
import { Bytes32Zero, HexType } from "../../../../../common";

import { FormResults, HexParser, defFormResults, hasError,
  onlyHex, refreshAfterTx 
} from "../../../../../common/toolsKit";

import { useComBooxContext } from "../../../../../../_providers/ComBooxContextProvider";

interface AcceptShaProps {
  setTime:Dispatch<SetStateAction<number>>;
}

export function AcceptSha({ setTime }:AcceptShaProps) {

  const { gk, setErrMsg } = useComBooxContext();
  const [sigHash, setSigHash] = useState<HexType>(Bytes32Zero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const refresh = ()=> {
    setLoading(false);
    setTime(Date.now());
  }

  const {
    isLoading,
    write
  } = useCompKeeperAcceptSha({
    address: gk,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refresh);
    }
  });

  const handleClick = ()=> {
    write({
      args: [ sigHash ],
    });
  }

  return (
    <Stack direction='row' sx={{ alignItems:'start' }}>

      <TextField
        sx={{ m:1, mt:3, minWidth: 650 }} 
        id="tfSigHash" 
        label="SigHash / CID in IPFS" 
        variant="outlined"
        error={ valid['SigHash']?.error }
        helperText={ valid['SigHash']?.helpTx ?? ' ' }
        onChange={e => {
          let input = HexParser( e.target.value );
          onlyHex('SigHash', input, 64, setValid);
          setSigHash( input );
        }}
        value = { sigHash }
        size='small'
      />                                            

      <LoadingButton
        disabled={isLoading || hasError(valid)}
        loading = {loading}
        loadingPosition="end"
        variant="contained"
        endIcon={<DriveFileRenameOutline />}
        sx={{ m:1, mt:3, height:40, minWidth:218 }}
        onClick={ handleClick }
      >
        Accept Sha
      </LoadingButton>

    </Stack>
  )

}