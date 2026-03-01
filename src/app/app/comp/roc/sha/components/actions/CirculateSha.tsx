
import { Dispatch, SetStateAction, useState } from "react";

import { Divider, Stack, TextField } from "@mui/material";
import { Recycling } from "@mui/icons-material";

import { useCompKeeperCirculateSha } from "../../../../../../../../generated";
import { Bytes32Zero, HexType } from "../../../../../common";
import { FormResults, HexParser, defFormResults, hasError, onlyHex, refreshAfterTx } from "../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../../_providers/ComBooxContextProvider";
import AgreementUploader from "../../../../../components/file_storage/AgreementUploader";
import { isParty } from "../sigPage/sigPage";
import { getMyUserNo } from "../../../../../rc";
import { CheckFilerFunc } from "../../../../../components/file_storage/FileUploader";

export interface FileHistoryProps {
  addr: HexType,
  setNextStep: Dispatch<SetStateAction<number>>;
}

export function CirculateSha({ addr, setNextStep }: FileHistoryProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ docUrl, setDocUrl ] = useState<HexType>(Bytes32Zero);
  const [ docHash, setDocHash ] = useState<HexType | undefined>(Bytes32Zero);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [ loading, setLoading ] = useState(false);

  const refresh = ()=> {
    setLoading(false);
    setNextStep(2);
  }
  
  const {
    isLoading,
    write
  } = useCompKeeperCirculateSha({
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
      args:[
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
      setErrMsg('UserNo Not Retrieved!');
      return false;
    }
    console.log('myNo: ', myNo);

    let flag = await isParty(addr, BigInt(myNo));
    if (flag) return true;
    else {
      console.log('checkFiler: not a Party to SHA');
      return false; 
    }
  }

  return (
    <Stack direction='row' sx={{m:1, alignItems:'center'}}>

      <Stack direction='column' >

        <TextField 
          sx={{ m: 1, mt:3, minWidth: 650 }} 
          id="tfUrlOfDoc" 
          label="UrlOfDoc / CID in IPFS" 
          variant="outlined"
          error={ valid['UrlOfDoc']?.error }
          helperText={ valid['UrlOfDoc']?.helpTx ?? ' ' }
          onChange={e => {
            let input = HexParser( e.target.value );
            onlyHex('UrlOfDoc', input, 64, setValid); 
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
            onlyHex('DocHash', input, 64, setValid);
            setDocHash(input);
          }}
          value = { docHash }
          size='small'
        />                                            

      </Stack>
      
      <Divider orientation="vertical" sx={{ m:1 }} flexItem />
      
      <Stack direction='column' sx={{ alignItems:'start' }} >

        <AgreementUploader typeOfFile="SHA" addrOfFile={addr} setDocHash={setDocHash} checkFiler={checkFiler} />

        <LoadingButton
          disabled={ isLoading || hasError(valid) || !docHash}
          loading = {loading}
          loadingPosition="end"
          variant="contained"
          endIcon={<Recycling />}
          sx={{ m:1, mt:0, width:218, height:40 }}
          onClick={ handleClick }
        >
          Circulate Sha
        </LoadingButton>
        

      </Stack>
    </Stack>
  )

}