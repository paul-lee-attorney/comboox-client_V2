import { readContract } from "@wagmi/core";
import { listOfOrdersABI } from "../../../../../generated-v1";
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
    abi: listOfOrdersABI,
    functionName: 'isInvestor',
    args: [ BigInt(userNo) ]
  });

  return res;
}

export async function getInvestor(addr: HexType,  userNo: number):Promise<Investor>{
  let res = await readContract({
    address: addr,
    abi: listOfOrdersABI,
    functionName: 'getInvestor',
    args: [ BigInt(userNo) ]
  });

  return res;
}

export async function getQtyOfInvestors(addr: HexType):Promise<bigint>{
  let res = await readContract({
    address: addr,
    abi: listOfOrdersABI,
    functionName: 'getQtyOfInvestors',
  });

  return res;
}

export async function investorList(addr: HexType):Promise<readonly bigint[]>{
  let res = await readContract({
    address: addr,
    abi: listOfOrdersABI,
    functionName: 'investorList',
  });

  return res;
}

export async function investorInfoList(addr: HexType):Promise<readonly Investor[]>{
  let res = await readContract({
    address: addr,
    abi: listOfOrdersABI,
    functionName: 'investorInfoList',
  });

  return res;
}