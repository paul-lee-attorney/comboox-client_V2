import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Stack, TextField } from "@mui/material";
import { Delete, PlaylistAdd } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { AddrZero, HexType, MaxPrice } from "../../../../../common";

import { 
  useShareholdersAgreementCreateTerm, 
  useShareholdersAgreementRemoveTerm 
} from "../../../../../../../../generated";

import { counterOfVersions, getDocAddr } from "../../../../../rc";

import { FormResults, defFormResults, hasError, onlyInt, refreshAfterTx } from "../../../../../common/toolsKit";
import { useComBooxContext } from "../../../../../../_providers/ComBooxContextProvider";

interface AddTermProps {
  sha: HexType;
  title: number;
  setTerms: Dispatch<SetStateAction<HexType[]>>;
  isCreated: boolean;
}

export function AddTerm({sha, title, setTerms, isCreated}: AddTermProps) {

  const { setErrMsg } = useComBooxContext();

  const [ version, setVersion ] = useState<string>('1');
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  // uint typeOfDoc = title > 3 ? 21 + title : 22 + title;
  useEffect(()=>{
    let typeOfDoc = BigInt(title > 3 ? 21 + title : 22 + title);
    counterOfVersions(typeOfDoc).then(
      vr => setVersion(vr.toString())
    )
  }, [title]);

  const {
    isLoading: createTermLoading,
    write: createTerm,
  } = useShareholdersAgreementCreateTerm({
    address: sha,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash:HexType = data.hash;
      getDocAddr(hash).
        then(addrOfTerm => {
          setLoading(false);
          setTerms(v => {
            let out = [...v];
            out[title-1] = addrOfTerm;
            return out;
          });
        });      
    }
  });

  const addTermClick = ()=>{
    createTerm({
      args: [
        BigInt(title), 
        BigInt(version)
      ],
    });
  };

  const refresh = ()=> {
    setLoading(false);
    setTerms(v=>{
      let out = [...v];
      out[title-1] = AddrZero;
      return out;
    });
  }

  const {
    isLoading: removeTermLoading,
    write: removeTerm,
  } = useShareholdersAgreementRemoveTerm({
    address: sha,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash:HexType = data.hash;
      refreshAfterTx(hash, refresh);
    }
  });

  const removeTermClick = ()=>{
    removeTerm({
      args: [BigInt(title)],
    })
  }

  return (
    <>
      { !isCreated && (
        <Stack direction={'row'} sx={{ alignItems:'start' }}>
          <TextField 
            variant='outlined'
            label='Version'
            size='small'
            // error={ valid['Version']?.error }
            // helperText={ valid['Version']?.helpTx ?? ' ' }
            sx={{
              m:1,
              ml:3,
              minWidth: 218,
            }}
            // onChange={(e) => {
            //   let input = e.target.value;
            //   onlyInt('Version', input, MaxPrice, setValid);
            //   setVersion(input);
            // }}
            value={ version }              
            inputProps={{readOnly:true}}
          />

          <LoadingButton
            disabled={ !version || createTermLoading || hasError(valid) }
            loading={loading}
            loadingPosition="end"
            variant="contained"
            sx={{
              m:1,
              mr: 5,
              height: 40,
            }}
            endIcon={ <PlaylistAdd /> }
            onClick={ addTermClick }
          >
            Create
          </LoadingButton>

        </Stack>
      )}

      {isCreated && (
        <LoadingButton
          disabled={ removeTermLoading }
          loading = {loading}
          loadingPosition="end"
          variant="contained"
          sx={{
            height: 40,
            mr: 5,
          }}
          endIcon={ <Delete /> }
          onClick={ removeTermClick }
        >
          Remove
        </LoadingButton>
      )}    
    </>
  );
}