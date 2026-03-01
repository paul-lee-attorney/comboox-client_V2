import { Alert, Box, Stack, TextField, } from "@mui/material";
import { useCompKeeperSignIa } from "../../../../../../../generated";
import { Bytes32Zero, HexType, } from "../../../../common";
import { DriveFileRenameOutline } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { ParasOfSigPage, established, getParasOfPage, parseParasOfPage } from "../../../roc/sha/components/sigPage/sigPage";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { FileHistoryProps } from "../../../roc/sha/components/actions/CirculateSha";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function SignIa({ addr, setNextStep }: FileHistoryProps) {
  const [ parasOfPage, setParasOfPage ] = useState<ParasOfSigPage>();

  const { gk, setErrMsg } = useComBooxContext();
  const [sigHash, setSigHash] = useState<HexType>(Bytes32Zero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ loading, setLoading ] = useState(false);

  const [ time, setTime ] = useState(0);

  const refresh = ()=>{
    setTime(Date.now());
    setLoading(false);
  }


  const {
    isLoading: signIaLoading,
    write: signIa
  } = useCompKeeperSignIa({
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
    signIa({
      args: [addr, sigHash],
    })
  }
  
  useEffect(()=>{
    getParasOfPage(addr, true).then(
      para => setParasOfPage(parseParasOfPage(para))
    );
    established(addr).then(
      flag => {
        if (flag) setNextStep(3);
      }
    );
  }, [addr, setNextStep, time]);

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
        disabled={!signIa || signIaLoading || hasError(valid)}
        loading = {loading}
        loadingPosition="end"
        variant="contained"
        endIcon={<DriveFileRenameOutline />}
        sx={{ m:1, minWidth:218, height:40 }}
        onClick={ handleClick }
      >
        Sign Ia
      </LoadingButton>

      {parasOfPage && (
        <Box sx={{ width:280 }} >        
          <Alert 
            variant='outlined' 
            severity='info' 
            sx={{ height: 42, p:0.5, m:1 }} 
          >
            Sigers / Parties: { parasOfPage?.counterOfSigs +'/'+ parasOfPage?.counterOfBlanks } 
          </Alert>
        </Box>  
      )}

    </Stack>
  )

}