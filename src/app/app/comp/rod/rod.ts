import { readContract } from "@wagmi/core";
import { HexType } from "../../common";
import { registerOfDirectorsABI } from "../../../../../generated";

export interface Position {
  title: number;
  seqOfPos: number;
  acct: number;
  nominator: number;
  startDate: number;
  endDate: number;
  seqOfVR: number;
  titleOfNominator: number;
  argu: number;  
}

// ==== Funcs ====

export async function posExist(addr:HexType, seqOfPos: number):Promise<boolean> {
  let res = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'posExist',
    args: [BigInt(seqOfPos)],
  })

  return res;
}

export async function isOccupied(addr:HexType, seqOfPos: number):Promise<boolean> {
  let res = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'isOccupied',
    args: [BigInt(seqOfPos)],
  })

  return res;
}

export async function getPosition(addr:HexType, seqOfPos: number):Promise<Position> {
  let pos = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'getPosition',
    args: [ BigInt(seqOfPos)],
  })

  return pos;
}

// ==== Managers ====

export async function isManager(addr:HexType, acct: number):Promise<boolean> {
  let res = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'isManager',
    args: [ BigInt(acct) ],
  })

  return res;
}

export async function getNumOfManagers(addr:HexType):Promise<bigint> {
  let res = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'getNumOfManagers',
  })

  return res;
}

export async function getManagersList(addr:HexType):Promise<readonly bigint[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'getManagersList',
  })

  return res;
}

export async function getManagersPosList(addr:HexType):Promise<readonly bigint[]>{
  let list = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'getManagersPosList',
  })

  return list;
}

// ==== Director ====

export async function isDirector(addr:HexType, acct: number):Promise<boolean> {
  let res = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'isDirector',
    args: [ BigInt(acct) ],
  })

  return res;
}

export async function getNumOfDirectors(addr:HexType):Promise<bigint> {
  let res = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'getNumOfDirectors',
  })

  return res;
}

export async function getDirectorsList(addr:HexType):Promise<readonly bigint[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'getDirectorsList',
  })

  return res;
}

export async function getDirectorsPosList(addr:HexType):Promise<readonly bigint[]>{
  let list = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'getDirectorsPosList',
  })

  return list;
}

// ==== Executives ====

export async function hasPosition(addr:HexType, acct: number, seqOfPos: number):Promise<boolean> {
  let res = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'hasPosition',
    args: [ BigInt(acct), BigInt(seqOfPos) ],
  })

  return res;
}

export async function getPosInHand(addr:HexType, acct: number):Promise<readonly bigint[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'getPosInHand',
    args: [ BigInt(acct) ],
  })

  return res;
}

export async function getFullPosInfoInHand(addr:HexType, acct: number):Promise<readonly Position[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'getFullPosInfoInHand',
    args: [ BigInt(acct) ],
  })

  return res;
}

export async function hasTitle(addr:HexType, acct: number, title: number):Promise<boolean> {
  let res = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'hasTitle',
    args: [ BigInt(acct), BigInt(title) ],
  })

  return res;
}

export async function hasNominationRight(addr:HexType, seqOfPos:number, acct: number):Promise<boolean> {
  let res = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'hasNominationRight',
    args: [ BigInt(seqOfPos), BigInt(acct) ],
  })

  return res;
}

export async function getBoardSeatsOccupied(addr:HexType, acct: number):Promise<bigint> {
  let res = await readContract({
    address: addr,
    abi: registerOfDirectorsABI,
    functionName: 'getBoardSeatsOccupied',
    args: [ BigInt(acct) ],
  })

  return res;
}

// ==== Special ====

export async function getManagersFullPosInfo(addr:HexType):Promise<readonly Position[]>{

  let list = await getManagersPosList(addr);
  let len = list.length;
  let output:Position[] = [];

  while (len > 0) {
    let pos = await getPosition(addr, Number(list[len-1]));
    output.push(pos);
    len--;
  }

  return output;
}

export async function getDirectorsFullPosInfo(addr:HexType):Promise<readonly Position[]>{

  let list = await getDirectorsPosList(addr);
  let len = list.length;
  let output:Position[] = [];

  while (len > 0) {
    let pos = await getPosition(addr, Number(list[len-1]));
    output.push(pos);
    len--;
  }

  return output;
}



