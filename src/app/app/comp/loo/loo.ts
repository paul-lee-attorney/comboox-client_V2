import { readContract } from "@wagmi/core";
import { iListOfOrdersABI } from "../../../../../generated";

import { AddrZero, HexType } from "../../common";

import { HexParser } from "../../common/toolsKit";

// ==== Order ====

export const statesOfOrder = [
  'Active',
  'Closed',
  'Terminated'
]

export interface InitOffer{
  seqOfOrder: string;
  classOfShare: string;
  seqOfShare: string;
  execHours: string;
  paid: string;
  price: string;
  seqOfLR: string;
}

export const defaultOffer: InitOffer = {
  seqOfOrder: '0',
  classOfShare: '0',
  seqOfShare: '0',
  execHours: '0',
  paid: '0',
  price: '0',
  seqOfLR: '1024',
}

// ==== Order ====

export interface Node {
  seq: number;
  prev: number;
  next: number;
  issuer: number;
  paid: bigint;
  price: number;
  expireDate: number;
  isOffer: boolean;
}

export const defaultNode: Node = {
  seq: 0,
  prev: 0,
  next: 0,
  issuer: 0,
  paid: 0n,
  price: 0,
  expireDate: 0,
  isOffer: false  
}

export interface Data {
  classOfShare: number;
  seqOfShare: number;
  groupRep: number;
  votingWeight: number;
  distrWeight: number;
  margin: bigint;
  inEth: boolean;
  pubKey: HexType;
  date: number;
  issueDate: number;
}

export const defaultData: Data = {
  classOfShare: 0,
  seqOfShare: 0,
  groupRep: 0,
  votingWeight: 0,
  distrWeight: 0,
  margin: 0n,
  inEth: false,
  pubKey: AddrZero,
  date: 0,
  issueDate: 0,
}

export interface Order {
  node: Node;
  data: Data;
}

export const defaultOrder: Order = {
  node: defaultNode,
  data: defaultData
}

// ==== Deal ====

export interface Brief {
  seqOfDeal: number;
  classOfShare: string;
  seqOfShare: string;
  buyer: string;
  seller: string;
  paid: bigint;
  price: bigint;
  votingWeight: string;
  distrWeight: string;
  consideration: bigint;
}

export interface Deal {
  seqOfDeal: number;
  from: HexType;
  buyer: string;
  groupRep: string;
  classOfShare: string;
  to: HexType;
  seller: string;
  seqOfShare: string;
  state: string;
  inEth: boolean;
  isOffer: boolean;
  paid: bigint;
  price: bigint;
  votingWeight: string;
  distrWeight: string;
  consideration: bigint;
}

export const defaultDeal: Deal = {
  seqOfDeal: 0,
  from: AddrZero,
  buyer: '0',
  groupRep: '0',
  classOfShare: '0',
  to: AddrZero,
  seller: '0',
  seqOfShare: '0',
  state: '0',
  inEth: false,
  isOffer: false,
  paid: 0n,
  price: 0n,
  votingWeight: '0',
  distrWeight: '0',
  consideration: 0n
}

export const defaultBrief: Brief = {
  seqOfDeal: 0,
  classOfShare: '0',
  seqOfShare: '0',
  buyer: '0',
  seller: '0',
  paid: 0n,
  price: 0n,
  votingWeight: '0',
  distrWeight: '0',
  consideration: 0n,
}


export function briefParser(hexBrief: HexType):Brief {
  let brief: Brief = {
    seqOfDeal: 0,
    classOfShare: parseInt(hexBrief.substring(2, 6), 16).toString(),
    seqOfShare: parseInt(hexBrief.substring(6, 14), 16).toString(),
    buyer: parseInt(hexBrief.substring(14, 24), 16).toString(),
    seller: parseInt(hexBrief.substring(24, 34), 16).toString(),
    paid: BigInt(`0x${hexBrief.substring(34, 50)}`),
    price: BigInt(`0x${hexBrief.substring(50, 58)}`),
    votingWeight: parseInt(hexBrief.substring(58, 62), 16).toString(),
    distrWeight: parseInt(hexBrief.substring(62, 66), 16).toString(),
    consideration: 0n,
  }
  return brief;
}

// ==== BriefProps ====

export interface BriefProps extends Brief {
  blockNumber: bigint,
  timestamp: bigint,
  transactionHash: HexType,
}

// ==== DealProps ====

export interface DealProps extends Deal {
  blockNumber: bigint,
  timestamp: bigint,
  transactionHash: HexType,
}

export function dealParser(fromSn: HexType, toSn: HexType, qtySn: HexType):Deal {
  let deal: Deal = {
    seqOfDeal: 0,

    from: HexParser(fromSn.substring(2,42)),
    buyer: parseInt(fromSn.substring(42, 52), 16).toString(),
    groupRep: parseInt(fromSn.substring(52, 62), 16).toString(),
    classOfShare: parseInt(fromSn.substring(62, 66), 16).toString(),

    to: HexParser(toSn.substring(2,42)),
    seller: parseInt(toSn.substring(42, 52), 16).toString(),
    seqOfShare: parseInt(toSn.substring(52, 60), 16).toString(),
    state: parseInt(toSn.substring(60, 62), 16).toString(),
    inEth: toSn.substring(62, 64) == '01',
    isOffer: toSn.substring(64, 66) == '01',

    paid: BigInt(`0x${qtySn.substring(2, 18)}`),
    price: BigInt(`0x${qtySn.substring(18, 26)}`),
    votingWeight: parseInt(qtySn.substring(26, 30), 16).toString(),
    distrWeight: parseInt(qtySn.substring(30, 34), 16).toString(),
    consideration: BigInt(`0x${qtySn.substring(34, 66)}`),
  }

  return deal;
}

// ==== Deals ====

export async function counterOfOrders(addr: HexType, classOfShare:number, isOffer:boolean):Promise<number>{
  let res = await readContract({
    address: addr,
    abi: iListOfOrdersABI,
    functionName: 'counterOfOrders',
    args: [ BigInt(classOfShare), isOffer ]
  });

  return res;
}

export async function headOfList(addr: HexType, classOfShare:number, isOffer:boolean):Promise<number>{
  let res = await readContract({
    address: addr,
    abi: iListOfOrdersABI,
    functionName: 'headOfList',
    args: [ BigInt(classOfShare), isOffer ]
  });

  return res;
}

export async function tailOfList(addr: HexType, classOfShare:number, isOffer:boolean):Promise<number>{
  let res = await readContract({
    address: addr,
    abi: iListOfOrdersABI,
    functionName: 'tailOfList',
    args: [ BigInt(classOfShare), isOffer ]
  });

  return res;
}

export async function lengthOfList(addr: HexType, classOfShare:number, isOffer:boolean):Promise<bigint>{
  let res = await readContract({
    address: addr,
    abi: iListOfOrdersABI,
    functionName: 'lengthOfList',
    args: [ BigInt(classOfShare), isOffer ]
  });

  return res;
}

export async function getSeqList(addr: HexType, classOfShare:number, isOffer:boolean):Promise<readonly bigint[]>{
  let res = await readContract({
    address: addr,
    abi: iListOfOrdersABI,
    functionName: 'getSeqList',
    args: [ BigInt(classOfShare), isOffer ]
  });

  return res;
}

// ==== Order ====


export async function isOrder(addr: HexType, classOfShare:number, seqOfOrder: number, isOffer:boolean):Promise<boolean>{
  let res = await readContract({
    address: addr,
    abi: iListOfOrdersABI,
    functionName: 'isOrder',
    args: [ BigInt(classOfShare), BigInt(seqOfOrder), isOffer ]
  });

  return res;
}

export async function getOrder(addr: HexType, classOfShare:number, seqOfOrder: number, isOffer:boolean):Promise<Order>{
  let res = await readContract({
    address: addr,
    abi: iListOfOrdersABI,
    functionName: 'getOrder',
    args: [ BigInt(classOfShare), BigInt(seqOfOrder), isOffer ]
  });
  
  let output: Order = {
    node: {
      seq: seqOfOrder,
      ...res.node,
    },
    data: {...res.data},
  };

  return output;
}

export async function getOrders(addr: HexType, classOfShare:number, isOffer:boolean):Promise<readonly Order[]>{
  let res = await readContract({
    address: addr,
    abi: iListOfOrdersABI,
    functionName: 'getSeqList',
    args: [ BigInt(classOfShare), isOffer ],
  });

  let len = res.length;
  let output: Order[] = [];

  let i=0;
  while (i < len) {
    let order = await getOrder(addr, classOfShare, Number(res[i]), isOffer);
    output.push(order);
    i++;
  }
  
  return output;
}

export async function isClass(addr: HexType, classOfShare:number):Promise<boolean>{
  let res = await readContract({
    address: addr,
    abi: iListOfOrdersABI,
    functionName: 'isClass',
    args: [ BigInt(classOfShare) ]
  });

  return res;
}

export async function getClassesList(addr: HexType):Promise<readonly bigint[]>{
  let res = await readContract({
    address: addr,
    abi: iListOfOrdersABI,
    functionName: 'getClassesList',
  });

  return res;
}

