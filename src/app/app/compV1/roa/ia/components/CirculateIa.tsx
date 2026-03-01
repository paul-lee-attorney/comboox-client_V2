import { Divider, Stack, TextField } from "@mui/material";
import { useGeneralKeeperCirculateIa } from "../../../../../../../generated-v1";
import { Bytes32Zero, HexType, } from "../../../../common";
import { Recycling } from "@mui/icons-material";
import { useState } from "react";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from "../../../../common/toolsKit";


import { LoadingButton } from "@mui/lab";
import { FileHistoryProps } from "../../../roc/sha/components/actions/CirculateSha";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

import { isParty } from "../../../roc/sha/components/sigPage/sigPage";
import { getMyUserNo } from "../../../../rc";
import AgreementUploader from "../../../../components/file_storage/AgreementUploader";
import { CheckFilerFunc } from "../../../../components/file_storage/FileUploader";

export function CirculateIa({ addr, setNextStep }: FileHistoryProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ docUrl, setDocUrl ] = useState<HexType>(Bytes32Zero);
  const [ docHash, setDocHash ] = useState<HexType | undefined>(Bytes32Zero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ loading, setLoading ] = useState(false);

  const refresh = ()=>{
    setLoading(false);
    setNextStep(2);
  }

  const {
    isLoading,
    write
  } = useGeneralKeeperCirculateIa({
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
    if (!docHash) return;
    write({
      args: [
        addr, 
        docUrl, 
        docHash
      ],
    });
  };

  const checkFiler:CheckFilerFunc = async (filer) => {
    if (!filer) return false;

    let myNo = await getMyUserNo(filer.account.address);

    if (!myNo) {
      console.log('UserNo Not Detected!');      
      return false;
    }
    // console.log('myNo: ', myNo);

    let flag = await isParty(addr, BigInt(myNo));
    if (flag) return true;
    else {
      console.log('checkFiler: not a Party to IA');
      return false; 
    }
  }

  return (

    <Stack direction={'row'} sx={{m:1, p:1, alignItems:'center'}}>

      <Stack direction='column' >

        <TextField
          sx={{ m: 1, mt:3, minWidth: 650 }} 
          id="tfDocUrl" 
          label="DocUrl / CID in IPFS" 
          variant="outlined"
          error={ valid['DocUrl']?.error }
          helperText={ valid['DocUrl']?.helpTx ?? ' ' }
          onChange={e => {
            let input = HexParser( e.target.value );
            onlyHex('DocUrl', input, 64, setValid);
            setDocUrl(input);
          }}
          value = { docUrl }
          size='small'
        />                                            

        <TextField
          sx={{ m: 1, minWidth: 650 }} 
          id="tfDocHash" 
          label="DocHash" 
          variant="outlined"
          error={ valid['DocHash']?.error }
          helperText={ valid['DocHash']?.helpTx ?? ' ' }
          onChange={e => {
            let input = HexParser( e.target.value );
            setDocHash(input);
          }}
          value = { docHash }
          size='small'
        />                                            

      </Stack>

      <Divider orientation="vertical" sx={{ m:1 }} flexItem />

      <Stack direction='column' sx={{ alignItems:'start', justifyItems:'center' }} >

        <AgreementUploader typeOfFile="IA" addrOfFile={addr} setDocHash={setDocHash} checkFiler={checkFiler} />

        <LoadingButton
          disabled={ isLoading || hasError(valid)}
          loading = {loading}
          loadingPosition="end"
          variant="contained"
          endIcon={<Recycling />}
          sx={{ m:1, minWidth:218, height:40 }}
          onClick={ handleClick }
        >
          Circulate Ia
        </LoadingButton>

      </Stack>

    </Stack>
  )

}