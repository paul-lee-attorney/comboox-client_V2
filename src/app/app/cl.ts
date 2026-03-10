import { readContract } from "@wagmi/core";
import { cashLockersABI, regCenterABI } from "../../../generated";
import { AddrOfRegCenter, AddrZero, Bytes32Zero, HexType } from "./common";
import { parasParser } from "./rc";
import { getTypeByName } from "./common/toolsKit";

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

// const addrCL = await getCashLockersAddr();

export async function getCashLockersAddr(): Promise<HexType> {

  const typeOfCashLockers = getTypeByName('CashLockers');

  const version = await readContract({
     address: AddrOfRegCenter,
     abi: regCenterABI,
     functionName: 'counterOfVersions',
     args: [typeOfCashLockers]
  })

  let res = await readContract({
     address: AddrOfRegCenter,
     abi: regCenterABI,
     functionName: 'getTemp',
     args: [ typeOfCashLockers, BigInt(version) ]
   })
 
   return res.body; 
}

export async function isLocked(lock: HexType): Promise<boolean> {

  const addrCL = await getCashLockersAddr();

  const flag = await readContract({
     address: addrCL,
     abi: cashLockersABI,
     functionName: 'isLocked',
     args: [lock]
   })
 
   return flag; 
}

export async function counterOfLockers(): Promise<bigint> {

  const addrCL = await getCashLockersAddr();

  let res = await readContract({
     address: addrCL,
     abi: cashLockersABI,
     functionName: 'counterOfLockers',
   })
 
   return res; 
}

export async function getHeadOfLocker(lock:HexType): Promise<Head> {

  const addrCL = await getCashLockersAddr();

  let res = await readContract({
     address: addrCL,
     abi: cashLockersABI,
     functionName: 'getHeadOfLocker',
     args: [lock]
   })
 
   return res; 
}

export async function getLocker(lock:HexType): Promise<Locker> {

  const addrCL = await getCashLockersAddr();

  let res = await readContract({
     address: addrCL,
     abi: cashLockersABI,
     functionName: 'getLocker',
     args: [lock]
   })
 
   return res; 
}

export async function getLockersList(): Promise<readonly HexType[]> {

  const addrCL = await getCashLockersAddr();

  const res = await readContract({
     address: addrCL,
     abi: cashLockersABI,
     functionName: 'getLockersList',
   })
 
   return res; 
}

export function parseOrgLocker(hashLock: HexType, input: Locker): ItemLocker {

  const lk: ItemLocker = {
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

export async function getUsdLockersList(): Promise<ItemLocker[]> {

  let list = await getLockersList();
  let len = list.length;
  let out:ItemLocker[] = [];

  while (len > 0) {
    let lock = list[len-1];
    let locker = await getLocker(lock);

    if (locker.head.state == 1) {
      out.push( parseOrgLocker(lock, locker));
    }

    len--;
  }

  console.log('usdLockers: ', out);

  return out;
}

export async function custodyOf(acct:HexType): Promise<bigint> {

    const addrCL = await getCashLockersAddr();

    const res = await readContract({
      address: addrCL,
      abi: cashLockersABI,
      functionName: 'custodyOf',
      args: [acct]
    })
 
   return res; 
}

export async function totalCustody(): Promise<bigint> {

  const addrCL = await getCashLockersAddr();

  let res = await readContract({
     address: addrCL,
     abi: cashLockersABI,
     functionName: 'totalCustody',
  });
 
  return res; 
}
