import { HexType } from "../../common";
import { PublicClient, WalletClient } from "viem";
import { HexParser } from "../../common/toolsKit";
import { randomBytes } from "crypto";
import { AuthData, AuthSig, getDomain, types } from "./typedData";

export const incorporateSignature = (authData:AuthData, sig:string) => {
  const r = HexParser(sig.slice(2, 66));  // First 32 bytes
  const s = HexParser(sig.slice(66, 130)); // Next 32 bytes
  const v = parseInt(sig.slice(130, 132), 16); // last byte

  let out: AuthSig = {
    ...authData,
    r: r,
    s: s,
    v: v,
  }
  
  return out;
}

export const generateAuthData = async (
  provider: PublicClient, 
  signer: WalletClient, 
  value: bigint, 
  addrOfCashier: HexType
): Promise<AuthData> => {

  const currentBlock = await provider.getBlock();
  const currentTime = currentBlock.timestamp;

  let out = {
    from: signer?.account?.address as HexType, // 自动获取地址
    to: addrOfCashier, 
    value,
    validAfter: currentTime - 1n,
    validBefore: currentTime + 600n, // 有效期10分钟
    nonce: HexParser(randomBytes (32).toString('hex')) // 安全随机数
  };

  return out;
};

export const generateAuthorization = async (
  provider: PublicClient, 
  signer: WalletClient, 
  value: bigint, 
  addrOfCashier: HexType,
) => {
  if (!signer.account) throw new Error("Wallet not connected");

  let authData = await generateAuthData(provider, signer, value, addrOfCashier);

  let domain = getDomain(provider);

  let sig = await signer.signTypedData({
    account: signer.account,
    domain: domain,
    types,
    primaryType: "TransferWithAuthorization",
    message: {
      ...authData
    },
  });

  let auth = incorporateSignature(authData, sig);

  return auth;
};
