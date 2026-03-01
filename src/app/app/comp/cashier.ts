import { readContract } from "@wagmi/core";
import { HexType } from "../common";
import { cashierABI } from "../../../../generated";

// ==== Balances ====

export async function custodyOf(addr:HexType, acct:HexType): Promise<bigint> {

  let res = await readContract({
     address: addr,
     abi: cashierABI,
     functionName: 'custodyOf',
     args: [acct]
   })
 
   return res; 
}


export async function totalEscrow(addr:HexType, blk?: bigint): Promise<bigint> {

  let res = await readContract({
     address: addr,
     abi: cashierABI,
     functionName: 'totalEscrow',
     blockNumber: blk,
   })
 
   return res; 
}

export async function totalUsdDeposits(addr:HexType, blk?: bigint): Promise<bigint> {

  let res = await readContract({
     address: addr,
     abi: cashierABI,
     functionName: 'totalDeposits',
     blockNumber: blk,
   })
 
   return res; 
}

export async function depositOfMine(addr:HexType, acct:bigint): Promise<bigint> {

  let res = await readContract({
     address: addr,
     abi: cashierABI,
     functionName: 'depositOfMine',
     args: [acct],
   })
 
   return res; 
}

export async function balanceOfComp(addr:HexType, blk?: bigint): Promise<bigint> {

  let res = await readContract({
     address: addr,
     abi: cashierABI,
     functionName: 'balanceOfComp',
     blockNumber: blk,
   })
 
   return res; 
}

