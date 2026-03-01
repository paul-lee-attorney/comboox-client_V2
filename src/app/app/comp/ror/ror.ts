import { readContract } from "@wagmi/core";
import { registerOfRedemptionsABI } from "../../../../../generated";
import { HexType } from "../../common";

// ==== Request ====

export interface Request {
  class: number;
  seqOfShare: number;
  navPrice: number;
  shareholder: number;
  paid: bigint;
  value: bigint;
  seqOfPack: number;
}

export function requestParser(hexReq: HexType): Request {
  let req: Request = {
    class: parseInt(hexReq.substring(2, 6), 16),
    seqOfShare: parseInt(hexReq.substring(6, 14), 16),
    navPrice: parseInt(hexReq.substring(14, 22), 16),
    shareholder: parseInt(hexReq.substring(22, 32), 16),
    paid: BigInt(hexReq.substring(32, 48)),
    value: BigInt(hexReq.substring(48, 64)),
    seqOfPack: parseInt(hexReq.substring(64, 66), 16),    
  }
  return req;
}

export function codifyRequest(objReq: Request): HexType {
  let sn:HexType = `0x${
    Number(objReq.class).toString(16).padStart(4,'0') +
    Number(objReq.seqOfShare).toString(16).padStart(8,'0') +
    Number(objReq.navPrice).toString(16).padStart(8,'0') +
    Number(objReq.shareholder).toString(16).padStart(10,'0') +
    Number(objReq.paid).toString(16).padStart(16,'0') +
    Number(objReq.value).toString(16).padStart(16,'0') +
    Number(objReq.seqOfPack).toString(16).padStart(2,'0')
  }`;

  return sn;
}


export interface RequestProps extends Request {
  seqNum: number,
  blockNumber: bigint,
  timestamp: bigint,
  transactionHash: HexType,
}

export async function isRedeemable(addr: HexType, classOfShare:number): Promise <boolean> {
  let res = await readContract({
    address: addr,
    abi: registerOfRedemptionsABI,
    functionName: 'isRedeemable',
    args: [ BigInt(classOfShare) ]
  });

  return res;
}

export async function getClassesList(addr: HexType): Promise <number[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfRedemptionsABI,
    functionName: 'getClassesList',
  });

  return res.map(v => Number(v));
}

export async function getInfoOfClass(addr: HexType, classOfShare:number): Promise <Request> {
  let res = await readContract({
    address: addr,
    abi: registerOfRedemptionsABI,
    functionName: 'getInfoOfClass',
    args: [ BigInt(classOfShare) ]
  });

  return res;
}

export async function getPacksList(addr: HexType, classOfShare:number): Promise <number[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfRedemptionsABI,
    functionName: 'getPacksList',
    args: [ BigInt(classOfShare) ]
  });

  return res.map(v => Number(v));
}

export async function getInfoOfPack(addr: HexType, classOfShare:number, seqOfPack:number): Promise <Request> {
  let res = await readContract({
    address: addr,
    abi: registerOfRedemptionsABI,
    functionName: 'getInfoOfPack',
    args: [ BigInt(classOfShare), BigInt(seqOfPack) ]
  });

  return res;
}

export async function getSharesList(addr: HexType, classOfShare:number, seqOfPack:number): Promise <number[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfRedemptionsABI,
    functionName: 'getSharesList',
    args: [ BigInt(classOfShare), BigInt(seqOfPack) ]
  });

  return res.map(v => Number(v));
}

export async function getRequest(addr: HexType, classOfShare:number, seqOfPack:number, seqOfShare:number): Promise <Request> {
  let res = await readContract({
    address: addr,
    abi: registerOfRedemptionsABI,
    functionName: 'getRequest',
    args: [ BigInt(classOfShare), BigInt(seqOfPack), BigInt(seqOfShare) ]
  });

  return res;
}

export async function getRequests(addr: HexType, classOfShare:number, seqOfPack:number): Promise <readonly Request[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfRedemptionsABI,
    functionName: 'getRequests',
    args: [ BigInt(classOfShare), BigInt(seqOfPack) ]
  });

  return res;
}

export async function getAllRequests(addr: HexType, classOfShare:number): Promise <Request[]> {

  let packs = await getPacksList(addr, classOfShare);
  let len = packs.length;
  let list:Request[] = [];

  while(len > 0) {
    let ls:readonly Request[] = await getRequests(addr, classOfShare, packs[len-1]);
    len--;
    list = list.concat(ls);
  }

  return list;
}



