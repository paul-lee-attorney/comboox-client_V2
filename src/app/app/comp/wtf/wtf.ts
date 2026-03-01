import { readContract } from "@wagmi/core";
import { HexType } from "../../common";
import { waterfallsABI } from "../../../../../generated";

// ---- Drop ----

export interface Drop {
  seqOfDistr: number;
  member: number;
  class: number;
  distrDate: number;
  principal: bigint;
  income: bigint;
}

export interface DropInfo extends Drop {
  name: string;
}

export interface DropProps extends Drop {
  seqNum: number;
}

export const defaultDrop: Drop = {
  seqOfDistr: 0,
  member: 0,
  class: 0,
  distrDate: 0,
  principal: 0n,
  income: 0n
}

export async function getDrop(addr: HexType, seqOfDistr: number, member: number, classOfShare: number, seqOfShare: number): Promise <Drop> {
  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getDrop',
    args: [ 
      BigInt(seqOfDistr),
      BigInt(member),
      BigInt(classOfShare),
      BigInt(seqOfShare),
    ]
  });

  return res;
}

// ---- Flow ----

export async function getFlowInfo(addr: HexType, seqOfDistr: number, member: number, classOfShare: number): Promise <Drop> {
  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getFlowInfo',
    args: [ 
      BigInt(seqOfDistr),
      BigInt(member),
      BigInt(classOfShare),
    ]
  });

  return res;
}

export async function getDropsOfFlow(addr: HexType, seqOfDistr: number, member: number, classOfShare: number): Promise <readonly Drop[]> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getDropsOfFlow',
    args: [ 
      BigInt(seqOfDistr),
      BigInt(member),
      BigInt(classOfShare),
    ]
  });

  return res;
}

// ---- Creek ----

export async function getCreekInfo(addr: HexType, seqOfDistr: number, member: number): Promise <Drop> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getCreekInfo',
    args: [ 
      BigInt(seqOfDistr),
      BigInt(member),
    ]
  });

  return res;
}

export async function getDropsOfCreek(addr: HexType, seqOfDistr: number, member: number): Promise <readonly Drop[]> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getDropsOfCreek',
    args: [ 
      BigInt(seqOfDistr),
      BigInt(member),
    ]
  });

  return res;
}

  // ---- Stream ----

export async function getStreamInfo(addr: HexType, seqOfDistr: number): Promise <Drop> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getStreamInfo',
    args: [ 
      BigInt(seqOfDistr),
    ]
  });

  return res;
}

export async function getCreeksOfStream(addr: HexType, seqOfDistr: number): Promise <readonly Drop[]> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getCreeksOfStream',
    args: [ 
      BigInt(seqOfDistr),
    ]
  });

  return res;
}


export async function getDropsOfStream(addr: HexType, seqOfDistr: number): Promise <readonly Drop[]> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getDropsOfStream',
    args: [ 
      BigInt(seqOfDistr),
    ]
  });

  return res;
}

// ---- Member ----

export async function getPoolInfo(addr: HexType, member: number, classOfShare: number): Promise <Drop> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getPoolInfo',
    args: [ 
      BigInt(member),
      BigInt(classOfShare),
    ]
  });

  return res;
}

export async function getLakeInfo(addr: HexType, member: number): Promise <Drop> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getLakeInfo',
    args: [ 
      BigInt(member),
    ]
  });

  return res;
}

// ---- Class ----

export async function getInitSeaInfo(addr: HexType, classOfShare: number): Promise <Drop> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getInitSeaInfo',
    args: [ 
      BigInt(classOfShare),
    ]
  });

  return res;
}

export async function getSeaInfo(addr: HexType, classOfShare: number): Promise <Drop> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getSeaInfo',
    args: [ 
      BigInt(classOfShare),
    ]
  });

  return res;
}


export async function getGulfInfo(addr: HexType, classOfShare: number): Promise <Drop> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getGulfInfo',
    args: [ 
      BigInt(classOfShare),
    ]
  });

  return res;
}

export async function getIslandInfo(addr: HexType, classOfShare: number, seqOfDistr:number): Promise <Drop> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getIslandInfo',
    args: [ 
      BigInt(classOfShare),
      BigInt(seqOfDistr),
    ]
  });

  return res;
}

export async function getListOfClasses(addr: HexType): Promise <number[]> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getListOfClasses',
  });

  return res.map(v => Number(v));
}

export async function getAllSeasInfo(addr: HexType): Promise <readonly Drop[]> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getAllSeasInfo',
  });

  return res;
}

export async function getOceanInfo(addr: HexType): Promise <Drop> {

  let res = await readContract({
    address: addr,
    abi: waterfallsABI,
    functionName: 'getOceanInfo',
  });

  return res;
}



