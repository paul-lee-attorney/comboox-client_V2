import { readContract } from "@wagmi/core";
import { Bytes32Zero, HexType } from "../../../common";
import { strNumToBigInt } from "../../../common/toolsKit";
import { investmentAgreementABI } from "../../../../../../generated";
import { Swap } from "../../roo/roo";

export const TypeOfDeal = [
  'CapitalIncrease', 
  'ShareTransfer(External)', 
  'ShareTransfer(Internal)', 
  'PreEmptive', 
  'TagAlong', 
  'DragAlong', 
  'FirstRefusal', 
  'FreeGift'
];

export const TypeOfIa = [
  'NaN',
  'CapitalIncrease',
  'ShareTransfer(External)',
  'ShareTransfer(Internal)',
  'CI & STint',
  'SText & STint',
  'CI & SText & STint',
  'CI & SText'
]

export const StateOfDeal = [
  'Drafting',
  'Locked',
  'Cleared',
  'Closed',
  'Terminated'
];

export interface StrHead {
  typeOfDeal: string,
  seqOfDeal: string,
  preSeq: string,
  classOfShare: string,
  seqOfShare: string,
  seller: string,
  priceOfPaid: string,
  priceOfPar: string,
  closingDeadline: number,
  votingWeight: string,
}

export const defaultStrHead: StrHead = {
  typeOfDeal: '2',
  seqOfDeal: '0',
  preSeq: '0',
  classOfShare: '0',
  seqOfShare: '0',
  seller: '0',
  priceOfPaid: '0.00',
  priceOfPar: '0.00',
  closingDeadline: 0,
  votingWeight: '100',  
}

export interface Head {
  typeOfDeal: number,
  seqOfDeal: number,
  preSeq: number,
  classOfShare: number,
  seqOfShare: number,
  seller: number,
  priceOfPaid: number,
  priceOfPar: number,
  closingDeadline: number,
  votingWeight: number,
}

export const defaultHead: Head = {
  typeOfDeal: 2,
  seqOfDeal: 0,
  preSeq: 0,
  classOfShare: 0,
  seqOfShare: 0,
  seller: 0,
  priceOfPaid: 1,
  priceOfPar: 1,
  closingDeadline: 0,
  votingWeight: 100,  
}

export interface StrBody {
  buyer: string,
  groupOfBuyer: string,
  paid: string,
  par: string,
  state: string,
  para: string,
  distrWeight: string,
  flag: boolean,
}

export interface Body {
  buyer: number,
  groupOfBuyer: number,
  paid: bigint,
  par: bigint,
  state: number,
  para: number,
  distrWeight: number,
  flag: boolean,  
}

// export function convertBody(body: Body): OrgBody {
//   let out: OrgBody = {
//     buyer: Number(body.buyer),
//     groupOfBuyer: Number(body.groupOfBuyer),
//     paid: BigInt(body.paid),
//     par: BigInt(body.par),
//     state: body.state,
//     para: Number(body.para),
//     argu: Number(body.argu),
//     flag: body.flag,      
//   }
//   return out;
// }

// export function parseOrgBody(body: OrgBody): Body {
//   let out: Body = {
//     buyer: body.buyer.toString(),
//     groupOfBuyer: body.groupOfBuyer.toString(),
//     paid: body.paid.toString(),
//     par: body.par.toString(),
//     state: body.state,
//     para: body.para.toString(),
//     argu: body.argu.toString(),
//     flag: body.flag,      
//   }
//   return out;
// }

export const defaultStrBody: StrBody = {
  buyer: '0',
  groupOfBuyer: '0',
  paid: '0',
  par: '0',
  state: '0',
  para: '0',
  distrWeight: '100',
  flag: false,  
}

export const defaultBody: Body = {
  buyer: 0,
  groupOfBuyer: 0,
  paid: 0n,
  par: 0n,
  state: 0,
  para: 0,
  distrWeight: 100,
  flag: false,  
}

export const defaultDeal: Deal ={
  head: defaultHead,
  body: defaultBody,
  hashLock: Bytes32Zero,
}

export interface StrDeal {
  head: StrHead;
  body: StrBody;
  hashLock: HexType;
}

export interface Deal {
  head: Head;
  body: Body;
  hashLock: HexType;
}

export function codifyHeadOfDeal(head: StrHead): HexType {
  let hexSn:HexType = `0x${
    (Number(head.typeOfDeal).toString(16).padStart(2, '0')) +
    (Number(head.seqOfDeal).toString(16).padStart(4, '0')) +
    (Number(head.preSeq).toString(16).padStart(4, '0')) +
    (Number(head.classOfShare).toString(16).padStart(4, '0')) +
    (Number(head.seqOfShare).toString(16).padStart(8, '0')) +
    (Number(head.seller).toString(16).padStart(10, '0')) +
    strNumToBigInt(head.priceOfPaid, 4).toString(16).padStart(8, '0') +
    strNumToBigInt(head.priceOfPar, 4).toString(16).padStart(8, '0') +
    (Number(head.closingDeadline).toString(16).padStart(12, '0')) + 
    (Number(head.votingWeight).toString(16).padStart(4, '0'))
  }`;
  return hexSn;
}

export const dealState = ['Drafting', 'Locked', 'Cleared', 'Closed', 'Terminated'];

export interface Timeline {
  frDeadline: number;
  dtDeadline: number;
  terminateStart: number;
  votingDeadline: number;
  closingDeadline: number;
  stateOfFile: number;
}

export const defaultTimeline: Timeline = {
  frDeadline: 0,
  dtDeadline: 0,
  terminateStart: 0,
  votingDeadline: 0,
  closingDeadline: 0,
  stateOfFile: 0,
}

export const statesOfSwap = [
  'Pending', 'Issued', 'Closed', 'Terminated'
]

export async function getTypeOfIA(ia: HexType):Promise<number>{
  let typeOfIa = await readContract({
    address: ia,
    abi: investmentAgreementABI,
    functionName: 'getTypeOfIA',
  });

  return typeOfIa;
}

export async function getDeal(ia: HexType, seq:bigint):Promise<Deal>{
  let deal = await readContract({
    address: ia,
    abi: investmentAgreementABI,
    functionName: 'getDeal',
    args: [seq],
  });

  return deal;
}

export async function getSeqList(ia: HexType):Promise<readonly bigint[]>{
  let list = await readContract({
    address: ia,
    abi: investmentAgreementABI,
    functionName: 'getSeqList',
  });

  return list;
}

export async function obtainDealsList(addr: HexType, seqList: readonly bigint[]): Promise<Deal[]> {
  let list: Deal[] = [];
  let len = seqList.length;

  while (len > 0) {
    list.push(await getDeal(addr, seqList[len - 1]));
    len--;
  }

  return list;
}

// ==== Swap ====

export async function getSwap(ia: HexType, seqOfDeal: number, seqOfSwap: number): Promise<Swap> {
  let res = await readContract({
    address: ia,
    abi: investmentAgreementABI,
    functionName: 'getSwap',
    args: [BigInt(seqOfDeal), BigInt(seqOfSwap)],
  });

  return res;
}

export async function getAllSwaps(ia: HexType, seqOfDeal: number): Promise<readonly Swap[]> {
  let res = await readContract({
    address: ia,
    abi: investmentAgreementABI,
    functionName: 'getAllSwaps',
    args: [BigInt(seqOfDeal)],
  });

  return res;
}

export async function allSwapsClosed(ia: HexType, seqOfDeal: number): Promise<boolean> {
  let res = await readContract({
    address: ia,
    abi: investmentAgreementABI,
    functionName: 'allSwapsClosed',
    args: [BigInt(seqOfDeal)],
  });

  return res;
}

// export async function checkValueOfSwap(ia: HexType, seqOfDeal: number, seqOfSwap: number): Promise<bigint> {
//   let res = await readContract({
//     address: ia,
//     abi: investmentAgreementABI,
//     functionName: 'checkValueOfSwap',
//     args: [BigInt(seqOfDeal), BigInt(seqOfSwap)],
//   });

//   return res;
// }

// export async function checkValueOfDeal(ia: HexType, seqOfDeal: number): Promise<bigint> {
//   let res = await readContract({
//     address: ia,
//     abi: investmentAgreementABI,
//     functionName: 'checkValueOfDeal',
//     args: [BigInt(seqOfDeal)],
//   });

//   return res;
// }

