import { readContract } from "@wagmi/core";
import { HexType } from "../common";
import { iCashierABI } from "../../../../generated";

// ==== Balances ====

export async function custodyOf(addr:HexType, acct:HexType): Promise<bigint> {

  let res = await readContract({
     address: addr,
     abi: iCashierABI,
     functionName: 'custodyOf',
     args: [acct]
   })
 
   return res; 
}


export async function totalEscrow(addr:HexType, blk?: bigint): Promise<bigint> {

  let res = await readContract({
     address: addr,
     abi: iCashierABI,
     functionName: 'totalEscrow',
     blockNumber: blk,
   })
 
   return res; 
}

export async function totalUsdDeposits(addr:HexType, blk?: bigint): Promise<bigint> {

  let res = await readContract({
     address: addr,
     abi: iCashierABI,
     functionName: 'totalDeposits',
     blockNumber: blk,
   })
 
   return res; 
}

export async function depositOfMine(addr:HexType, acct:bigint): Promise<bigint> {

  let res = await readContract({
     address: addr,
     abi: iCashierABI,
     functionName: 'depositOfMine',
     args: [acct],
   })
 
   return res; 
}

export async function balanceOfComp(addr:HexType, blk?: bigint): Promise<bigint> {

  let res = await readContract({
     address: addr,
     abi: iCashierABI,
     functionName: 'balanceOfComp',
     blockNumber: blk,
   })
 
   return res; 
}

