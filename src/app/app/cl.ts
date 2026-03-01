import { readContract } from "@wagmi/core";
import { cashLockersABI } from "../../../generated";
import { AddrZero, Bytes32Zero, HexType } from "./common";
import { parasParser } from "./rc";

export interface Head {
  from: HexType;
  payer: number;
  expireDate: number;
  state: number;
  to: HexType;
  payee: number;
  pickupDate: number;
  flag: boolean;
  amt: bigint;
}

export const defaultHead = {
  from: AddrZero,
  payer: 0,
  expireDate: 0,
  state: 0,
  to: AddrZero,
  payee: 0,
  pickupDate: 0,
  flag: false,
  amt: 0n
}

export interface Body {
  counterLocker: HexType,
  payload: HexType;
}

export const defaultBody = {
  counterLocker: AddrZero,
  payload: Bytes32Zero,
}

export interface Locker {
  head: Head;
  body: Body;
}

export const defaltLocker = {
  head: defaultHead,
  body: defaultBody,
}

export interface ItemBody {
  counterLocker: HexType;
  selector: HexType;
  paras: string[];
}

export const defaultItemBody = {
  counterLocker: AddrZero,
  selector: Bytes32Zero,
  paras: [Bytes32Zero],
}

export interface ItemLocker {
  lock: HexType;
  head: Head;
  body: ItemBody;
}

export const defaultItemLocker = {
  lock: Bytes32Zero,
  head: defaultHead,
  body: defaultItemBody,
}

export async function isLocked(addr:HexType, lock: HexType): Promise<boolean> {

  let flag = await readContract({
     address: addr,
     abi: cashLockersABI,
     functionName: 'isLocked',
     args: [lock]
   })
 
   return flag; 
}

export async function counterOfLockers(addr:HexType): Promise<bigint> {

  let res = await readContract({
     address: addr,
     abi: cashLockersABI,
     functionName: 'counterOfLockers',
   })
 
   return res; 
}

export async function getHeadOfLocker(addr:HexType, lock:HexType): Promise<Head> {

  let res = await readContract({
     address: addr,
     abi: cashLockersABI,
     functionName: 'getHeadOfLocker',
     args: [lock]
   })
 
   return res; 
}

export async function getLocker(addr:HexType, lock:HexType): Promise<Locker> {

  let res = await readContract({
     address: addr,
     abi: cashLockersABI,
     functionName: 'getLocker',
     args: [lock]
   })
 
   return res; 
}

export async function getLocksList(addr:HexType): Promise<readonly HexType[]> {

  let res = await readContract({
     address: addr,
     abi: cashLockersABI,
     functionName: 'getLockersList',
   })
 
   return res; 
}

export function parseOrgLocker(hashLock: HexType, input: Locker): ItemLocker {

  let lk: ItemLocker = {
    lock: hashLock,
    head: input.head,
    body: 
      { 
        counterLocker: input.body.counterLocker,
        selector: `0x${input.body.payload.substring(2,10)}`,
        paras: parasParser(input.body.payload.substring(10)),
      }
  };

  return lk;
}

export async function getUsdLockersList(addr:HexType): Promise<ItemLocker[]> {

  let list = await getLocksList(addr);
  let len = list.length;
  let out:ItemLocker[] = [];

  while (len > 0) {
    let lock = list[len-1];
    let locker = await getLocker(addr, lock);

    if (locker.head.state == 1) {
      out.push( parseOrgLocker(lock, locker));
    }

    len--;
  }

  console.log('usdLockers: ', out);

  return out;
}

export async function custodyOf(addr:HexType, acct:HexType): Promise<bigint> {

  let res = await readContract({
     address: addr,
     abi: cashLockersABI,
     functionName: 'custodyOf',
     args: [acct]
   })
 
   return res; 
}

export async function totalCustody(addr:HexType): Promise<bigint> {

  let res = await readContract({
     address: addr,
     abi: cashLockersABI,
     functionName: 'totalCustody',
   })
 
   return res; 
}
