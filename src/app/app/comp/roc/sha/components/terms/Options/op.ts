import { readContract } from "@wagmi/core";
import { HexType } from "../../../../../../common";
import { iOptionsABI } from "../../../../../../../../../generated";
import { OptWrap, Option } from "../../../../../roo/roo";

export async function counterOfOptions(term:HexType):Promise<number>{
  let res = await readContract({
    address: term,
    abi: iOptionsABI,
    functionName: 'counterOfOptions',
  })

  return res;
}

export async function qtyOfOptions(term:HexType):Promise<bigint>{
  let res = await readContract({
    address: term,
    abi: iOptionsABI,
    functionName: 'qtyOfOptions',
  })

  return res;
}

export async function isOption(term:HexType, seqOfOpt: number):Promise<boolean>{
  let res = await readContract({
    address: term,
    abi: iOptionsABI,
    functionName: 'isOption',
    args: [ BigInt(seqOfOpt) ]
  })

  return res;
}

export async function getOption(term:HexType, seqOfOpt: number):Promise<Option>{
  let res = await readContract({
    address: term,
    abi: iOptionsABI,
    functionName: 'getOption',
    args: [ BigInt(seqOfOpt) ]
  })

  return  res;
}

export async function getAllOptions(term:HexType):Promise<readonly Option[]>{
  let res = await readContract({
    address: term,
    abi: iOptionsABI,
    functionName: 'getAllOptions',
  })

  return res;
}

export async function isObligor(term:HexType, seqOfOpt: number, acct: number):Promise<boolean>{
  let res = await readContract({
    address: term,
    abi: iOptionsABI,
    functionName: 'isObligor',
    args: [ BigInt(seqOfOpt), BigInt(acct) ]
  })

  return res;
}

export async function getObligorsOfOption(term:HexType, seqOfOpt: number):Promise<readonly bigint[]>{
  let res = await readContract({
    address: term,
    abi: iOptionsABI,
    functionName: 'getObligorsOfOption',
    args: [ BigInt(seqOfOpt) ]
  })

  return res;
}

export async function getSeqList(term:HexType):Promise<readonly bigint[]>{
  let res = await readContract({
    address: term,
    abi: iOptionsABI,
    functionName: 'getSeqList',
  })

  return res;
}

// ==== Special ====

export async function getOpts(term: HexType): Promise<OptWrap[]>{

  let ls = await getAllOptions(term);

  let out:OptWrap[] = [];
  let len = ls.length;

  while(len > 0) {
    let obligors = await getObligorsOfOption(term, ls[len-1].head.seqOfOpt);
    let item:OptWrap = {
      opt: ls[len-1],
      obligors: obligors.map(v => Number(v)),
    }
    out.push(item);
    len--;
  }

  return out;
}




