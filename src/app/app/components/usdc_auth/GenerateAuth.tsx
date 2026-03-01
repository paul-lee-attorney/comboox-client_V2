
import { IconButton, Tooltip } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { HexType } from "../../common";
import { ApprovalOutlined } from "@mui/icons-material";
import { generateAuthorization } from "./authGenerator";
import { AuthSig } from "./typedData";

interface GenerateAuthProps {
  value: bigint | undefined;
  escrowAcct: HexType;
  setAuth: Dispatch<SetStateAction<AuthSig | undefined>>;
}

export const GenerateAuth = ({ value, escrowAcct, setAuth }: GenerateAuthProps) => {

  const { boox } = useComBooxContext();
  const provider = usePublicClient();
  const {data: signer} = useWalletClient();

  const [flag, setFlag] = useState<boolean>(false);

  const generateAuth = () => {
    setFlag(true);
    setAuth(undefined);

    if (!boox || !signer) {
      console.log("ERR: undefined Boox or Signer");
      setFlag(false);
    } else {

      if (value && escrowAcct) {
        generateAuthorization (provider, signer, value, escrowAcct).then(
          auth => {
            setAuth(auth);
            setFlag(false);
          }
        )
      }

    } 
  }

  return (
    <Tooltip title={'Authorize Payment'} placement='bottom' arrow >
      <IconButton
        color="primary"
        size="small"
        onClick={generateAuth}
        disabled={flag}
      >
        <ApprovalOutlined />
      </IconButton>
    </Tooltip>
  );
};

