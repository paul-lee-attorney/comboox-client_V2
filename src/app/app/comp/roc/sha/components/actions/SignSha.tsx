
import { useEffect, useState } from "react";

import { Alert, Box, Stack, TextField } from "@mui/material";
import { DriveFileRenameOutline } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { useCompKeeperSignSha } from "../../../../../../../../generated";

import { Bytes32Zero, HexType } from "../../../../../common";

import { ParasOfSigPage, established, getParasOfPage, parseParasOfPage } from "../sigPage/sigPage";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, onlyInt, refreshAfterTx } from "../../../../../common/toolsKit";

import { FileHistoryProps } from "./CirculateSha";
import { useComBooxContext } from "../../../../../../_providers/ComBooxContextProvider";

export function SignSha({ addr, setNextStep }: FileHistoryProps) {

  const [ parasOfPage, setParasOfPage ] = useState<ParasOfSigPage>();
  
  const { gk, setErrMsg } = useComBooxContext();
  const [sigHash, setSigHash] = useState<HexType>(Bytes32Zero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ time, setTime ] = useState<number>(0);
  const [ loading, setLoading ] = useState(false);

  const refresh = ()=>{
    setTime(Date.now());
    setLoading(false);
  }

  const {
    isLoading: signShaLoading,
    write: signSha
  } = useCompKeeperSignSha({
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

  const handleClick = ()=>{
    signSha({
      args: [
        addr, 
        sigHash
      ],
    });
  };

  useEffect(()=>{
    getParasOfPage(addr, true).then(
      para => setParasOfPage(parseParasOfPage(para))
    );
    established(addr).then(
      flag => {
        if (flag) setNextStep(3);
      }
    )
  }, [addr, setParasOfPage, setNextStep, time]);

  return (
    <Stack direction={'row'} sx={{m:1, p:1, alignItems:'start'}}>

      <TextField
        sx={{ m: 1, minWidth: 650 }} 
        id="tfSigHash" 
        label="SigHash / CID in IPFS" 
        variant="outlined"
        error={ valid['SigHash']?.error }
        helperText={ valid['SigHash']?.helpTx ?? ' ' }
        onChange={e => {
          let input = HexParser( e.target.value );
          onlyHex('SigHash', input, 64, setValid);
          setSigHash(input);
        }}
        value = { sigHash }
        size='small'
      />                                            

      <LoadingButton
        disabled={signShaLoading || hasError(valid)}
        loading = {loading}
        loadingPosition="end"
        variant="contained"
        endIcon={<DriveFileRenameOutline />}
        sx={{ m:1, height:42, minWidth:218 }}
        onClick={ handleClick }
      >
        Sign Sha
      </LoadingButton>

      {parasOfPage && (
        <Box sx={{ width:280, m:1 }} >        
          <Alert 
            variant='outlined' 
            severity='info'
            sx={{ height: 45,  p:0.5 }} 
          >
            Sigers / Parties: { parasOfPage?.counterOfSigs +'/'+ parasOfPage?.counterOfBlanks } 
          </Alert>
        </Box>  
      )}


    </Stack>
  )

}