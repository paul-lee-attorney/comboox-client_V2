import { FormControlLabel, FormGroup, Stack, Switch } from "@mui/material";

import { ChangeEvent } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

import { AcctPage } from "./AcctPage";

import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";
import { usePathname, useRouter } from "next/navigation";


export function LogIn() {

  const { setUserNo } = useComBooxContext();

  const router = useRouter();
  const pathname = usePathname();

  const { isConnected, isDisconnected } = useAccount();

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if ( isConnected ) {
      setUserNo(undefined);
      disconnect();
      if (pathname == '/center/UserInfo') router.push('/');
    } else {
      connect({ connector: connectors[0] });
    }
  };

  return (
    <Stack direction='row' sx={{ alignItems:'center', justifyContent:'center', flexGrow:0.1 }} >

      <FormGroup sx={{ml:5,width: 120,}}>
        <FormControlLabel
          control={
            <Switch
              checked={isConnected}
              onChange={ handleChange }
              aria-label="login switch"
              color='default'
            />
          }
          label={isConnected ? 'Logout' : 'Login'}
        />
      </FormGroup>

      <AcctPage flag={ isConnected } />

    </Stack>
  );
}
