import { AddrZero, HexType } from "../../common";
import { encodeAbiParameters, encodePacked, hashTypedData, isAddress, keccak256, PublicClient, recoverAddress, signatureToHex, stringToBytes, WalletClient } from "viem";
import { HexParser } from "../../common/toolsKit";
import { randomBytes } from "crypto";

// Data Strcuture of Authorization
export interface AuthData {
  from: HexType;
  to: HexType;
  value: bigint;
  validAfter: bigint;
  validBefore: bigint;
  nonce: HexType;
}

export interface AuthSig extends AuthData {
  v: number;
  r: HexType;
  s: HexType;
}

export const getDomain = (provider: PublicClient) => {
  let domain = {
    name: "USD Coin",
    version: "2",
    chainId: provider?.chain?.id ?? 42161, 
    verifyingContract: HexParser(process.env.NEXT_PUBLIC_USDC_ADDR ?? AddrZero)
  };
  return domain;
}

export const types = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ]
} as const;

export const getDigest = (provider: PublicClient, message:AuthData) => {
  const domain = getDomain(provider);
  const digest = hashTypedData({
    domain: domain,
    types,
    primaryType: "TransferWithAuthorization",
    message: message,
  });
  return digest;
}

