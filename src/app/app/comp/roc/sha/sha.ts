import { readContract } from "@wagmi/core";
import { AddrZero, Bytes32Zero, HexType } from "../../../common";
import { shareholdersAgreementABI } from "../../../../../../generated";
import { FirstRefusalRule, frParser } from "./components/rules/FirstRefusalRules/SetFirstRefusalRule";
import { membersList } from "../../rom/rom";
import { getParties, isSigner } from "./components/sigPage/sigPage";

export const defaultTerms:HexType[] = [
  AddrZero, AddrZero, AddrZero,
  AddrZero, AddrZero
]

export async function hasTitle(sha: HexType, title: number): Promise<boolean> {
  let res = await readContract({
    address: sha,
    abi: shareholdersAgreementABI,
    functionName: 'hasTitle',
    args: [ BigInt(title) ]
  });

  return res;
}

export async function qtyOfTerms(sha: HexType): Promise<bigint> {
  let res = await readContract({
    address: sha,
    abi: shareholdersAgreementABI,
    functionName: 'qtyOfTerms',
  });

  return res;
}

export async function getTitles(sha: HexType): Promise<readonly bigint[]> {
  let res = await readContract({
    address: sha,
    abi: shareholdersAgreementABI,
    functionName: 'getTitles',
  });

  return res;
}

export async function getTerm(addr: HexType, title: number): Promise<HexType> {

  let addrOfTerm = await readContract({
    address: addr,
    abi: shareholdersAgreementABI,
    functionName: 'getTerm',
    args: [BigInt(title)],
  });

  return addrOfTerm;
}

export async function hasRule(sha: HexType, seq: number): Promise<boolean> {
  let res = await readContract({
    address: sha,
    abi: shareholdersAgreementABI,
    functionName: 'hasRule',
    args: [ BigInt(seq) ]
  });

  return res;
}

export async function qtyOfRules(sha: HexType): Promise<bigint> {
  let res = await readContract({
    address: sha,
    abi: shareholdersAgreementABI,
    functionName: 'qtyOfRules',
  });

  return res;
}

export async function getRules(sha: HexType): Promise<readonly bigint[]> {
  let res = await readContract({
    address: sha,
    abi: shareholdersAgreementABI,
    functionName: 'getRules',
  });

  return res;
}

export async function getRule(sha: HexType, seq: number): Promise<HexType> {
  let rule = await readContract({
    address: sha,
    abi: shareholdersAgreementABI,
    functionName: 'getRule',
    args: [BigInt(seq)],
  });

  return rule;
}

// ==== Special ====

export async function getFirstRefusalRules(sha: HexType): Promise<FirstRefusalRule[]> {

  let out: FirstRefusalRule[] = [];
  let strFr = await getRule(sha, 512);

  if ( strFr != Bytes32Zero ) {
    
    let fr = frParser(strFr);
    out.push(fr);
    let len = Number(fr.qtyOfSubRule);

    while (len > 1) {
      out.push(frParser(await getRule(sha, 511 + len)));
      len--;
    }

  }

  return out;
}

export async function membersAllSigned(rom:HexType, sha: HexType): Promise<boolean> {
  let members = (await membersList(rom)).map(v=>(v.toString()));
  let lenOfMembers = members.length;
  let parties = (await getParties(sha)).map(v=>(v.toString()));
  let lenOfParties = parties.length;

  if (lenOfParties == 0 || lenOfMembers != lenOfParties) {
    return false;
  }

  while (lenOfMembers > 0) {
    if (parties.indexOf(members[lenOfMembers-1]) < 0) {
      return false;
    }
    lenOfMembers--;
  }

  return true;
}

  // ==== Rules ====

  export const titleOfPositions: string[] = [
    'Shareholder', 'Chairman', 'ViceChairman', 'ManagintDirector', 'Director', 
    'CEO', 'CFO', 'COO', 'CTO', 'President', 'VicePresident', 'Supervisor', 
    'SeniorManager', 'Manager', 'ViceManager'
  ];
  