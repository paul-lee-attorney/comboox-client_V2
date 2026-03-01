import { readContract } from "@wagmi/core";
import { registerOfInvestorsABI } from "../../../../../generated";
import { HexType } from "../../common";


export const statesOfInvestor = [
  'Pending',
  'Approved',
  'Revoked'
]

// ==== Investor ====

export interface Investor {
  userNo: number;
  groupRep: number;
  regDate: number;
  verifier: number;
  approveDate: number;
  state: number;
  idHash: HexType;
}

// ==== Funcs   ====

export async function isInvestor(addr: HexType,  userNo: number):Promise<boolean>{
  let res = await readContract({
    address: addr,
    abi: registerOfInvestorsABI,
    functionName: 'isInvestor',
    args: [ BigInt(userNo) ]
  });

  return res;
}

export async function getInvestor(addr: HexType,  userNo: number):Promise<Investor>{
  let res = await readContract({
    address: addr,
    abi: registerOfInvestorsABI,
    functionName: 'getInvestor',
    args: [ BigInt(userNo) ]
  });

  return res;
}

export async function getQtyOfInvestors(addr: HexType):Promise<bigint>{
  let res = await readContract({
    address: addr,
    abi: registerOfInvestorsABI,
    functionName: 'getQtyOfInvestors',
  });

  return res;
}

export async function investorList(addr: HexType):Promise<readonly bigint[]>{
  let res = await readContract({
    address: addr,
    abi: registerOfInvestorsABI,
    functionName: 'investorList',
  });

  return res;
}

export async function investorInfoList(addr: HexType):Promise<readonly Investor[]>{
  let res = await readContract({
    address: addr,
    abi: registerOfInvestorsABI,
    functionName: 'investorInfoList',
  });

  return res;
}