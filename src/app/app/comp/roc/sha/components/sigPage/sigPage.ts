import { HexType } from "../../../../../common";
import { readContract } from "@wagmi/core";
import { sigPageABI } from "../../../../../../../../generated";

export interface Sig{
  signer: number;
  sigDate: number;
  blocknumber: bigint;
  flag: boolean;
  para: number;
  arg: number;
  seq: number;
  attr: number;
  data: number;  
}

export interface Blank {
  sig: Sig;
  sigHash: HexType;
}

export interface ParasOfSigPage {
  circulateDate: number,
  established: boolean,
  counterOfBlanks: number,
  counterOfSigs: number,
  signingDays: number,
  closingDays: number,
}

export const defParasOfSigPage = {
  circulateDate: 0,
  established: false,
  counterOfBlanks: 0,
  counterOfSigs: 0,
  signingDays: 0,
  closingDays: 0,
}

export function parseParasOfPage(sig: Sig): ParasOfSigPage {
  let output: ParasOfSigPage = {
    circulateDate: sig.sigDate,
    established: sig.para == sig.arg,
    counterOfBlanks: sig.para,
    counterOfSigs: sig.arg,
    signingDays: sig.seq,
    closingDays: sig.attr,
  }
  return output;
}

export async function getParasOfPage(addr:HexType, initPage:boolean): Promise<Sig>{

  let paras: Sig = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'getParasOfPage',
    args: [initPage],
  })

  return paras;
}

export async function circulated(addr:HexType): Promise<boolean>{

  let flag: boolean = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'circulated',
  })

  return flag;
}

export async function established(addr:HexType): Promise<boolean>{

  let flag: boolean = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'established',
  })

  return flag;
}

export async function getCirculateDate(addr:HexType): Promise<number>{

  let date: number = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'getCirculateDate',
  })

  return date;
}

export async function getSigningDays(addr:HexType): Promise<number>{

  let days: number = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'getSigningDays',
  })

  return days;
}

export async function getClosingDays(addr:HexType): Promise<number>{

  let days: number = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'getClosingDays',
  })

  return days;
}

export async function getSigDeadline(addr:HexType): Promise<number>{

  let deadline: number = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'getSigDeadline',
  })

  return deadline;
}

export async function getClosingDeadline(addr:HexType): Promise<number>{

  let deadline: number = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'getClosingDeadline',
  })

  return deadline;
}

export async function isBuyer(addr:HexType, initPage:boolean, acct: bigint): Promise<boolean>{

  let flag: boolean = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'isBuyer',
    args: [initPage, acct],
  })

  return flag;
}

export async function isSeller(addr:HexType, initPage:boolean, acct: bigint): Promise<boolean>{

  let flag: boolean = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'isSeller',
    args: [initPage, acct],
  })

  return flag;
}

export async function isParty(addr:HexType, acct: bigint): Promise<boolean>{

  let flag: boolean = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'isParty',
    args: [acct],
  })

  return flag;
}

export async function isInitSigner(addr:HexType, acct: bigint): Promise<boolean>{

  let flag: boolean = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'isInitSigner',
    args: [acct],
  })

  return flag;
}

export async function isSigner(addr:HexType, acct: bigint): Promise<boolean>{

  let flag: boolean = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'isSigner',
    args: [acct],
  })

  return flag;
}

export async function getBuyers(addr:HexType, initPage: boolean): Promise<readonly bigint[]>{

  let buyers: readonly bigint[] = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'getBuyers',
    args: [initPage],
  })

  return buyers;
}

export async function getSellers(addr:HexType, initPage: boolean): Promise<readonly bigint[]>{

  let sellers: readonly bigint[] = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'getSellers',
    args: [initPage],
  })

  return sellers;
}

export async function getParties(addr:HexType): Promise<readonly bigint[]>{

  let parties: readonly bigint[] = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'getParties',
  })

  return parties;
}

export async function getSigOfParty(addr:HexType, initPage: boolean, acct: bigint): Promise<any>{
    
  let res = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'getSigOfParty',
    args: [initPage, acct],
  });

  return res;
}

export interface StrSig {
  signer: number,
  sigDate: number,
  blocknumber: string,
  sigHash: HexType,
}

export async function getSigsOfPage(addr:HexType, initPage: boolean): Promise<[readonly Sig[], readonly Sig[]]>{

  let sigsOfBuyers: readonly Sig[];
  let sigsOfSellers: readonly Sig[];
    
  [sigsOfBuyers, sigsOfSellers] = await readContract({
    address: addr,
    abi: sigPageABI,
    functionName: 'getSigsOfPage',
    args: [initPage],
  })

  return [sigsOfBuyers, sigsOfSellers];
}

// ==== Special ====

export async function getSigsOfRole( addr: HexType, initPage: boolean, parties: readonly bigint[] ): Promise<StrSig[]> {

  let len = parties.length;
  let output: StrSig[] = [];

  while (len > 0) {

    let item = await getSigOfParty(addr, initPage, parties[len - 1]);

    output.push({
      signer: Number(parties[len-1]),
      sigDate: item[1].sigDate,
      blocknumber: item[1].blocknumber.toString(),
      sigHash: item[2],
    });

    len--;
  }

  return output;
}



