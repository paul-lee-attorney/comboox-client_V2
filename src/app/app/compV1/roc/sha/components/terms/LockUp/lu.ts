import { readContract } from "@wagmi/core";
import { lockUpABI } from "../../../../../../../../../generated-v1";
import { HexType } from "../../../../../../common";
import { Deal } from "../../../../../roa/ia/ia";


export interface Locker {
  seqOfShare: number;
  dueDate: number;
  keyholders: number[];
}


// ==== Funcs ====

export async function isLocked(lu: HexType, seqOfShare: number): Promise<boolean> {
  let res = await readContract({
    address: lu,
    abi: lockUpABI,
    functionName: 'isLocked',
    args: [ BigInt(seqOfShare) ],
  });

  return res;
}

export async function getLocker(lu: HexType, seq: number): Promise<Locker> {
  let res = await readContract({
    address: lu,
    abi: lockUpABI,
    functionName: 'getLocker',
    args: [ BigInt(seq) ],
  });

  let locker: Locker = {
    seqOfShare: seq,
    dueDate: res[0],
    keyholders: res[1].map(v => Number(v)),
  }

  return locker;
}

export async function lockedShares(lu: HexType): Promise<readonly bigint[]> {
  let res = await readContract({
    address: lu,
    abi: lockUpABI,
    functionName: 'lockedShares',
  });

  return res;
}

export async function isTriggered(lu: HexType, deal: Deal): Promise<boolean> {
  let res = await readContract({
    address: lu,
    abi: lockUpABI,
    functionName: 'isTriggered',
    args: [ deal ],
  });

  return res;
}

export async function isExempted(lu: HexType, ia: HexType, deal: Deal): Promise<boolean> {
  let res = await readContract({
    address: lu,
    abi: lockUpABI,
    functionName: 'isExempted',
    args: [ ia, deal ],
  });

  return res;
}

// ==== Special ====

export async function getLockers(lu: HexType): Promise<Locker[]> {

  let shares = await lockedShares(lu);
  let len = shares.length;
  let output: Locker[] = [];

  while (len > 0) {
    let seqOfShare = Number(shares[len - 1]);
    let locker = await getLocker(lu, seqOfShare);
    output.push(locker);
    len--;
  }

  return output;
}











