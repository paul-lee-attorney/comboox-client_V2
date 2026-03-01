import { AccountCircle, BorderColor } from "@mui/icons-material";
import { Button } from "@mui/material";

import Link from "next/link";
import { longSnParser, refreshAfterTx } from "../../../common/toolsKit";
import { useWalletClient } from "wagmi";
import { AddrOfRegCenter, HexType } from "../../../common";
import { useRegCenterGetMyUserNo, useRegCenterRegUser } from "../../../../../../generated";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";
import { useState } from "react";
import { LoadingButton } from "@mui/lab";

interface AcctPageProps {
  flag: boolean;
}

export function AcctPage({ flag }:AcctPageProps) {

  const { data: signer } = useWalletClient();

  const { userNo, setUserNo, setErrMsg } = useComBooxContext();
  const [ loading, setLoading ] = useState(false);

  const {
    refetch: getMyUserNo
  } = useRegCenterGetMyUserNo({
    address: AddrOfRegCenter,
    account: signer?.account,
    // onError(err) {
    //   setErrMsg(err.message);
    // },
    onSuccess(res) {
      if (signer) setUserNo(res);
      else setUserNo(undefined);
    }
  })

  const refresh = ()=>{
    getMyUserNo();
    setLoading(false);
  }

  const {
    isLoading: regUserLoading,
    write: regUser
  } = useRegCenterRegUser({
    address: AddrOfRegCenter,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash:HexType = data.hash;
      refreshAfterTx(hash, refresh);
    }
  })

  return (
    <>
    {userNo && (
      <Link    
        href={{
          pathname: flag ? `/app/users` : '/app' ,
        }}
        // as={`/app/center/users`}
      >

        <Button
          variant='contained'
          color='info'
          startIcon={<AccountCircle />}
          sx={{ minWidth:218  }}
        >
          {longSnParser(userNo?.toString() ?? '0')}
        </Button>
      
      </Link>
    )}

    {!userNo && (
      <LoadingButton 
        size="small"
        disabled={ !signer || regUserLoading } 
        loading={loading}
        loadingPosition="end"
        onClick={() => {
          regUser?.()
        }}
        variant={flag ? 'contained' : 'outlined' }
        color={ flag ? 'info' : 'inherit' }
        sx={{ minWidth:218 }} 
        endIcon={<BorderColor />}       
      >
        Sign Up
      </LoadingButton>

    )}
  </>
  );
}