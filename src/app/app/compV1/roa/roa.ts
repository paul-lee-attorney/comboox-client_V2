import { readContract } from "@wagmi/core";
import { HexType } from "../../common";
import { registerOfAgreementsABI } from "../../../../../generated-v1";

export interface DTClaim{
  typeOfClaim: number;
  seqOfShare: number;
  paid: bigint;
  par: bigint;
  claimer: number;
  sigDate: number;
  sigHash: HexType;
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
    abi: registerOfAgreementsABI,
    functionName: 'hasFRClaims',
    args: [ia, BigInt(seqOfDeal)],
  })

  return res;
}

export async function isFRClaimer(boa: HexType, ia: HexType, acct: number ): Promise<boolean> {

  let res = await readContract({
    address: boa,
    abi: registerOfAgreementsABI,
    functionName: 'isFRClaimer',
    args: [ia, BigInt(acct)],
  })

  return res;
}

export async function getSubjectDealsOfFR(boa: HexType, ia: HexType ): Promise<readonly bigint[]> {

  let res = await readContract({
    address: boa,
    abi: registerOfAgreementsABI,
    functionName: 'getSubjectDealsOfFR',
    args: [ia],
  })

  return res;
}

export async function getFRClaimsOfDeal(boa: HexType, ia: HexType, seqOfDeal: number ): Promise<readonly FRClaim[]> {

  let res = await readContract({
    address: boa,
    abi: registerOfAgreementsABI,
    functionName: 'getFRClaimsOfDeal',
    args: [ia, BigInt(seqOfDeal)],
  })

  return res;
}

export async function allFRClaimsAccepted(boa: HexType, ia: HexType ): Promise<boolean> {

  let res = await readContract({
    address: boa,
    abi: registerOfAgreementsABI,
    functionName: 'allFRClaimsAccepted',
    args: [ia],
  })

  return res;
}

// ==== DTClaims ====

export async function hasDTClaims(boa: HexType, ia: HexType, seqOfDeal: number ): Promise<boolean> {

  let res = await readContract({
    address: boa,
    abi: registerOfAgreementsABI,
    functionName: 'hasDTClaims',
    args: [ia, BigInt(seqOfDeal)],
  })

  return res;
}

export async function getSubjectDealsOfDT(boa: HexType, ia: HexType): Promise<readonly bigint[]> {

  let res = await readContract({
    address: boa,
    abi: registerOfAgreementsABI,
    functionName: 'getSubjectDealsOfDT',
    args: [ia],
  })

  return res;
}

export async function getDTClaimsOfDeal(boa: HexType, ia: HexType, seqOfDeal: number ): Promise<readonly DTClaim[]> {

  let res = await readContract({
    address: boa,
    abi: registerOfAgreementsABI,
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
    abi: registerOfAgreementsABI,
    functionName: 'getDTClaimForShare',
    args: [ia, BigInt(seqOfDeal), BigInt(seqOfShare)],
  })

  return res;
}

export async function allDTClaimsAccepted(boa: HexType, ia: HexType): Promise<boolean> {

  let res = await readContract({
    address: boa,
    abi: registerOfAgreementsABI,
    functionName: 'allDTClaimsAccepted',
    args: [ia],
  })

  return res;
}

// ==== Mock Results ====

export async function mockResultsOfIA(boa: HexType, ia: HexType): Promise<readonly [number, number]> {

  let res = await readContract({
    address: boa,
    abi: registerOfAgreementsABI,
    functionName: 'mockResultsOfIA',
    args: [ia],
  })

  return res;
}

export async function mockResultsOfAcct(boa: HexType, ia: HexType, acct: number): Promise<readonly [number, number]> {

  let res = await readContract({
    address: boa,
    abi: registerOfAgreementsABI,
    functionName: 'mockResultsOfAcct',
    args: [ia, BigInt(acct)],
  })

  return res;
}

export async function allClaimsAccepted(boa: HexType, ia: HexType): Promise<boolean> {

  let res = await readContract({
    address: boa,
    abi: registerOfAgreementsABI,
    functionName: 'allClaimsAccepted',
    args: [ia],
  })

  return res;
}

