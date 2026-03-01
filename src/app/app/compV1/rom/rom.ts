import { readContract } from "@wagmi/core";
import { registerOfMembersABI } from "../../../../../generated-v1";
import { HexType } from "../../common";

export async function isMember(addr: HexType, acct: number):Promise<boolean>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'isMember',
    args: [ BigInt(acct) ]
  })
  
  return res;
}

export async function qtyOfMembers(addr: HexType):Promise<bigint>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'qtyOfMembers',
  })
  
  return res;
}

export async function membersList(addr: HexType): Promise<readonly bigint[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'membersList',
  });

  return res;
}

export async function sortedMembersList(addr: HexType): Promise<readonly bigint[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'sortedMembersList',
  });

  return res;
}

export async function qtyOfTopMembers(addr: HexType): Promise<bigint> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'qtyOfTopMembers',
  });

  return res;
}

export async function topMembersList(addr: HexType): Promise<readonly bigint[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'topMembersList',
  });

  return res;
}

// ==== Cap & Equity ====

export interface ShareClip {
  timestamp: number;
  rate: number;
  paid: bigint;
  par: bigint;
  points: bigint;
}

export interface MemberShareClip {
  acct: bigint;
  sharesInHand: readonly string[];
  clip: ShareClip;
  distr: ShareClip;
}

export async function getOwnersEquity(addr: HexType): Promise<ShareClip> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'ownersEquity',
  });

  return res;
}

export async function getOwnersPoints(addr: HexType): Promise<ShareClip> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'ownersPoints',
  });

  return res;
}


export async function capAtDate(addr: HexType, date: number): Promise<ShareClip> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'capAtDate',
    args: [ BigInt(date) ]
  });

  return res;
}

export async function equityOfMember(addr: HexType, acct: number): Promise<ShareClip> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'equityOfMember',
    args: [ BigInt(acct) ],
  });

  return res;
}

export async function pointsOfMember(addr: HexType, acct: number): Promise<ShareClip> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'pointsOfMember',
    args: [ BigInt(acct) ],
  });

  return res;
}

export async function equityAtDate(addr: HexType, acct: number, date: number): Promise<ShareClip> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'equityAtDate',
    args: [ BigInt(acct), BigInt(date) ],
  });

  return res;
}

export async function votesInHand(addr: HexType, acct: number): Promise<bigint> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'votesInHand',
    args: [ BigInt(acct) ],
  });

  return res;
}

export async function votesAtDate(addr: HexType, acct: number, date: number): Promise<bigint> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'votesAtDate',
    args: [ BigInt(acct), BigInt(date) ],
  });

  return res;
}

export async function votesHistory(addr: HexType, acct: number): Promise< readonly ShareClip[] > {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'votesHistory',
    args: [ BigInt(acct) ],
  });

  return res;
}

// ==== ShareNumber ====

export async function qtyOfSharesInHand(addr: HexType, acct: number): Promise< bigint > {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'qtyOfSharesInHand',
    args: [ BigInt(acct) ],
  });

  return res;
}

export async function sharesInHand(addr: HexType, acct: number): Promise<readonly bigint[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'sharesInHand',
    args: [ BigInt(acct) ],
  });

  return res;
}

// ==== Class ====

export async function qtyOfSharesInClass(addr: HexType, acct: number, classOfShare: number): Promise<bigint> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'qtyOfSharesInClass',
    args: [ BigInt(acct), BigInt(classOfShare) ],
  });

  return res;
}

export async function sharesInClass(addr: HexType, acct: number, classOfShare: number): Promise<readonly bigint[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'sharesInClass',
    args: [ BigInt(acct), BigInt(classOfShare) ],
  });

  return res;
}

export async function isClassMember(addr: HexType, acct: number, classOfShare: number): Promise<boolean> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'isClassMember',
    args: [ BigInt(acct), BigInt(classOfShare) ],
  });

  return res;
}

export async function classesBelonged(addr: HexType, acct: number): Promise<readonly bigint[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'classesBelonged',
    args: [ BigInt(acct) ],
  });

  return res;
}

export async function qtyOfClassMember(addr: HexType, classOfShare: number): Promise<bigint> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'qtyOfClassMember',
    args: [ BigInt(classOfShare) ],
  });

  return res;
}

export async function getMembersOfClass(addr: HexType, classOfShare: number): Promise<readonly bigint[]> {
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'getMembersOfClass',
    args: [ BigInt(classOfShare) ],
  });

  return res;
}

// ==== Top Chain ====

export async function basedOnPar(addr: HexType):Promise<boolean>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'basedOnPar',
  })
  
  return res;
}

export async function maxQtyOfMembers(addr: HexType):Promise<number>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'maxQtyOfMembers',
  })
  
  return res;
}

export async function minVoteRatioOnChain(addr: HexType):Promise<number>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'minVoteRatioOnChain',
  })
  
  return res;
}

export async function totalVotes(addr: HexType):Promise<bigint>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'totalVotes',
  })
  
  return res;
}

export async function getControllor(addr: HexType):Promise<number>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'controllor',
  })
  
  return res;
}

export async function tailOfChain(addr: HexType):Promise<number>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'tailOfChain',
  })
  
  return res;
}

export async function headOfQueue(addr: HexType):Promise<number>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'headOfQueue',
  })
  
  return res;
}

export async function tailOfQueue(addr: HexType):Promise<number>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'tailOfQueue',
  })
  
  return res;
}

// ==== Group ====

export async function groupRep(addr: HexType, acct: number):Promise<number>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'groupRep',
    args: [ BigInt(acct) ]
  })
  
  return res;
}

export async function votesOfGroup(addr: HexType, acct: number):Promise<bigint>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'votesOfGroup',
    args: [ BigInt(acct) ]
  })
  
  return res;
}

export async function deepOfGroup(addr: HexType, acct: number):Promise<bigint>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'deepOfGroup',
    args: [ BigInt(acct) ]
  })
  
  return res;
}

export async function membersOfGroup(addr: HexType, acct: number):Promise<readonly bigint[]>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'membersOfGroup',
    args: [ BigInt(acct) ]
  })
  
  return res;
}

export async function qtyOfGroupsOnChain(addr: HexType):Promise<number>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'qtyOfGroupsOnChain',
  })
  
  return res;
}

export async function qtyOfGroups(addr: HexType):Promise<bigint>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'qtyOfGroups',
  })
  
  return res;
}

export async function affiliated(addr: HexType, acct1: number, acct2: number):Promise<boolean>{
  let res = await readContract({
    address: addr,
    abi: registerOfMembersABI,
    functionName: 'affiliated',
    args: [ BigInt(acct1), BigInt(acct2) ]
  })
  
  return res;
}

// ==== EquityList ====

export async function getEquityList(rom: HexType, members: number[]): Promise<MemberShareClip[]> {

  let list: MemberShareClip[] = [];
  let len: number = members.length;
  let i=0;

  while(i < len) {

    let item: ShareClip = await equityOfMember(rom, members[i]);
    let distr: ShareClip = await pointsOfMember(rom, members[i]);
    let shares = await sharesInHand(rom, members[i]); 

    list[i] = {
      acct: BigInt(members[i]),
      sharesInHand: shares.map(v => v.toString()),
      clip: item,
      distr: distr,
    };

    i++;

  }

  return list;
}



