import { readContract } from "@wagmi/core";
import { HexType } from "../../common";
import { iAccessControlABI, iDraftControlABI } from "../../../../../generated";
import { keccak256, toUtf8Bytes } from "ethers";
import { HexParser } from "../../common/toolsKit";

export const ATTORNEYS = HexParser(keccak256(toUtf8Bytes("Attorneys")));

export async function getGeneralCounsel(addr: HexType): Promise<HexType> {
  let gc = await readContract({
    address: addr,
    abi: iDraftControlABI,
    functionName: 'getRoleAdmin',
    args: [ATTORNEYS]
  });

  return gc;
}

export async function isFinalized(addr: HexType): Promise<boolean>{
  let flag: boolean = await readContract({
    address: addr,
    abi: iDraftControlABI,
    functionName: 'isFinalized',
  })
  
  return flag;
}

export async function getDK(addr: HexType): Promise<HexType>{
  let keeper: HexType = await readContract({
    address: addr,
    abi: iAccessControlABI,
    functionName: 'getDK',
  })

  return keeper;
}

export async function hasRole(addr: HexType, role: HexType, acct: HexType): Promise<boolean> {
  let flag = await readContract({
    address: addr,
    abi: iDraftControlABI,
    functionName: 'hasRole',
    args: [role, acct],
  });

  return flag;
}