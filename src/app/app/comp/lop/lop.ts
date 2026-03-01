import { readContract, fetchBalance } from "@wagmi/core";
import { HexType } from "../../common";
import { listOfProjectsABI } from "../../../../../generated";

// ==== Member ====

export interface Member {
  seqOfTeam: number;
  userNo: number;
  state: number;
  rate: number;
  workHours: number;
  budgetAmt: number;
  approvedAmt: number;
  receivableAmt: number;
  paidAmt: number;
}

export const defaultMember:Member = {
  seqOfTeam: 0,
  userNo: 0,
  state: 0,
  rate: 0,
  workHours: 0,
  budgetAmt: 0,
  approvedAmt: 0,
  receivableAmt: 0,
  paidAmt: 0,
} 

export interface BalanceOf {
  project: bigint;
  cash: bigint;
  me: bigint;
}

export const defaultBalanceOf:BalanceOf = {
  project: 0n,
  cash: 0n,
  me: 0n,
}

export async function getOwner(addrOfPop:HexType): Promise<HexType>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'getOwner'
  });

  return res;
}

export async function getRegCenter(addrOfPop:HexType): Promise<HexType>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'getRegCenter'
  });

  return res;
}

export async function getCurrency(addrOfPop:HexType): Promise<number>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'getCurrency'
  });

  return res;
}

export async function isManager(addrOfPop:HexType, acct: bigint): Promise<boolean>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'isManager',
    args: [acct]
  });

  return res;
}

export async function getProjectInfo(addrOfPop:HexType): Promise<Member>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'getProjectInfo',
  });

  return res;
}

// ---- Teams ----

export async function qtyOfTeams(addrOfPop:HexType): Promise<number>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'qtyOfTeams',
  });

  return Number(res);
}

export async function getListOfTeams(addrOfPop:HexType): Promise<number[]>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'getListOfTeams',
  });

  return res.map(v => Number(v.toString())) ;
}

export async function teamIsEnrolled(addrOfPop:HexType, seqOfTeam: number): Promise<boolean>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'teamIsEnrolled',
    args: [ BigInt(seqOfTeam) ]
  });

  return res;
}

// ---- TeamInfo ----

export async function isTeamLeader(
  addrOfPop:HexType,
  acct: number, 
  seqOfTeam: number
): Promise<boolean>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'isTeamLeader',
    args: [ BigInt(acct), BigInt(seqOfTeam) ]
  });

  return res;
}

export async function getTeamInfo(addrOfPop:HexType, seqOfTeam: number): Promise<Member>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'getTeamInfo',
    args: [ BigInt(seqOfTeam) ]
  });

  return res;
}

export async function getTeamInfoList(addrOfPop:HexType): Promise<Member[]>{
  let ls = await getListOfTeams(addrOfPop);
  let len = ls.length;
  let output:Member[] = [];

  while (len > 0) {
    let m = await getTeamInfo(addrOfPop, ls[len-1]);
    output.push(m);
    len--;
  }

  return output;
}

// ---- Member ----

export async function isMember(
  addrOfPop:HexType,
  acct: number, 
  seqOfTeam: number
): Promise<boolean>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'isMember',
    args: [ BigInt(acct), BigInt(seqOfTeam) ]
  });

  return res;
}

export async function isEnrolledMember(
  addrOfPop:HexType,
  acct: number, 
  seqOfTeam: number
): Promise<boolean>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'isEnrolledMember',
    args: [ BigInt(acct), BigInt(seqOfTeam) ]
  });

  return res;
}

export async function getTeamMembersList(addrOfPop:HexType, seqOfTeam: number): Promise<number[]>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'getTeamMembersList',
    args: [ BigInt(seqOfTeam) ]
  });

  return res.map(v => Number(v.toString()));
}

export async function getMemberInfo(
  addrOfPop:HexType,
  acct: number, 
  seqOfTeam: number
): Promise<Member>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'getMemberInfo',
    args: [ BigInt(acct), BigInt(seqOfTeam) ]
  });

  return res;
}

export async function getMembersOfTeam(addrOfPop:HexType, seqOfTeam: number): Promise<readonly Member[]>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'getMembersOfTeam',
    args: [ BigInt(seqOfTeam) ]
  });

  return res;
}

// ---- Payroll ----

export async function getPayroll(addrOfPop:HexType): Promise<number[]>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'getPayroll',
  });

  return res.map(v => Number(v.toString()));
}

export async function inPayroll(addrOfPop:HexType, acct: number): Promise<boolean>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'inPayroll',
    args: [BigInt(acct)],
  });

  return res;
}

export async function getBalanceOf(addrOfPop:HexType, acct: number): Promise<bigint>{

  let res = await readContract({
    address: addrOfPop,
    abi: listOfProjectsABI,
    functionName: 'getBalanceOf',
    args: [BigInt(acct)],
  });

  return res;
}

export async function balanceOfWei(addr: HexType):Promise<bigint>{
  let res = await fetchBalance({
    address: addr,
    formatUnits: 'wei'
  })

  return res.value;
}

