import { readContract } from "@wagmi/core";
import { HexType } from "../../common";
import { iRegisterOfAgreementsABI } from "../../../../../generated";
import { Hex } from "viem";

export interface DTClaim{
  typeOfClaim: number;
  seqOfShare: number;
  paid: bigint;
  par: bigint;
  claimer: number;
  sigDate: number;
  sigHash: HexType;
}

export function dtClaimCodifier(
  seqOfDeal: number,
  dragAlong: boolean,
  seqOfShare: number,
  paid: bigint,
  par: bigint
): HexType {

  let hexDtClaim: HexType = `0x${
    seqOfDeal.toString(16).padStart(4, '0') +
    (dragAlong ? '01' : '00') +
    seqOfShare.toString(16).padStart(8, '0') +
    paid.toString(16).padStart(16, '0') +
    par.toString(16).padStart(16, '0') +
    '0'.padStart(18, '0')
  }`;

  return hexDtClaim;
}


export interface FRClaim{
  seqOfDeal: number;
  claimer: number;
  weight: bigint;
  ratio: bigint;
  sigDate: number;
  sigHash: HexType;
}

// ==== FR Claims ====

export async function hasFRClaims(boa: HexType, ia: HexType, seqOfDeal: number ): Promise<boolean> {

  let res = await readContract({
    address: boa,
    abi: iRegisterOfAgreementsABI,
    functionName: 'hasFRClaims',
    args: [ia, BigInt(seqOfDeal)],
  })

  return res;
}

export async function isFRClaimer(boa: HexType, ia: HexType, acct: number ): Promise<boolean> {

  let res = await readContract({
    address: boa,
    abi: iRegisterOfAgreementsABI,
    functionName: 'isFRClaimer',
    args: [ia, BigInt(acct)],
  })

  return res;
}

export async function getSubjectDealsOfFR(boa: HexType, ia: HexType ): Promise<readonly bigint[]> {

  let res = await readContract({
    address: boa,
    abi: iRegisterOfAgreementsABI,
    functionName: 'getSubjectDealsOfFR',
    args: [ia],
  })

  return res;
}

export async function getFRClaimsOfDeal(boa: HexType, ia: HexType, seqOfDeal: number ): Promise<readonly FRClaim[]> {

  let res = await readContract({
    address: boa,
    abi: iRegisterOfAgreementsABI,
    functionName: 'getFRClaimsOfDeal',
    args: [ia, BigInt(seqOfDeal)],
  })

  return res;
}

export async function allFRClaimsAccepted(boa: HexType, ia: HexType ): Promise<boolean> {

  let res = await readContract({
    address: boa,
    abi: iRegisterOfAgreementsABI,
    functionName: 'allFRClaimsAccepted',
    args: [ia],
  })

  return res;
}

// ==== DTClaims ====

export async function hasDTClaims(boa: HexType, ia: HexType, seqOfDeal: number ): Promise<boolean> {

  let res = await readContract({
    address: boa,
    abi: iRegisterOfAgreementsABI,
    functionName: 'hasDTClaims',
    args: [ia, BigInt(seqOfDeal)],
  })

  return res;
}

export async function getSubjectDealsOfDT(boa: HexType, ia: HexType): Promise<readonly bigint[]> {

  let res = await readContract({
    address: boa,
    abi: iRegisterOfAgreementsABI,
    functionName: 'getSubjectDealsOfDT',
    args: [ia],
  })

  return res;
}

export async function getDTClaimsOfDeal(boa: HexType, ia: HexType, seqOfDeal: number ): Promise<readonly DTClaim[]> {

  let res = await readContract({
    address: boa,
    abi: iRegisterOfAgreementsABI,
    functionName: 'getDTClaimsOfDeal',
    args: [ia, BigInt(seqOfDeal)],
  })

  return res;
}

export async function getDTClaimForShare(
  boa: HexType, 
  ia: HexType, 
  seqOfDeal: number, 
  seqOfShare: number
): Promise<DTClaim> {

  let res = await readContract({
    address: boa,
    abi: iRegisterOfAgreementsABI,
    functionName: 'getDTClaimForShare',
    args: [ia, BigInt(seqOfDeal), BigInt(seqOfShare)],
  })

  return res;
}

export async function allDTClaimsAccepted(boa: HexType, ia: HexType): Promise<boolean> {

  let res = await readContract({
    address: boa,
    abi: iRegisterOfAgreementsABI,
    functionName: 'allDTClaimsAccepted',
    args: [ia],
  })

  return res;
}

// ==== Mock Results ====

export async function mockResultsOfIA(boa: HexType, ia: HexType): Promise<readonly [number, number]> {

  let res = await readContract({
    address: boa,
    abi: iRegisterOfAgreementsABI,
    functionName: 'mockResultsOfIA',
    args: [ia],
  })

  return res;
}

export async function mockResultsOfAcct(boa: HexType, ia: HexType, acct: number): Promise<readonly [number, number]> {

  let res = await readContract({
    address: boa,
    abi: iRegisterOfAgreementsABI,
    functionName: 'mockResultsOfAcct',
    args: [ia, BigInt(acct)],
  })

  return res;
}

export async function allClaimsAccepted(boa: HexType, ia: HexType): Promise<boolean> {

  let res = await readContract({
    address: boa,
    abi: iRegisterOfAgreementsABI,
    functionName: 'allClaimsAccepted',
    args: [ia],
  })

  return res;
}

