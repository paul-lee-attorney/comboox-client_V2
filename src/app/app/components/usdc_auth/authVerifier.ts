import { HexType } from "../../common";
import { PublicClient } from "viem";
import { HexParser } from "../../common/toolsKit";
import { AuthSig, getDomain, types } from "./typedData";

export const splitAuthorization = (auth: AuthSig) =>{

  let authData = {
    from: auth.from,
    to: auth.to,
    value: auth.value,
    validAfter: auth.validAfter,
    validBefore: auth.validBefore,
    nonce: auth.nonce
  };

  let sig = HexParser(
    auth.r.slice(2, 66) +
    auth.s.slice(2, 66) +
    auth.v.toString(16).padStart(2, '0')
  );

  return {authData: authData, sig: sig};
}

export const verifyAuthorization = async (
  provider: PublicClient,
  account: HexType,
  auth: AuthSig
) => {
  const domain = getDomain(provider);
  const authObj = splitAuthorization(auth);
  const valid = await provider.verifyTypedData({
    address: account,
    domain: domain,
    types: types,
    primaryType: 'TransferWithAuthorization',
    message: authObj.authData,
    signature: authObj.sig,
  });
  
  return valid;
}
