import { readContract } from "@wagmi/core";
import { listOfOrdersABI } from "../../../../../generated-v1";
import { AddrZero, HexType } from "../../common";

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

// ==== Deals ====

export async function counterOfOrders(addr: HexType, classOfShare:number, isOffer:boolean):Promise<number>{
  let res = await readContract({
    address: addr,
    abi: listOfOrdersABI,
    functionName: 'counterOfOrders',
    args: [ BigInt(classOfShare), isOffer ]
  });

  return res;
}

export async function headOfList(addr: HexType, classOfShare:number, isOffer:boolean):Promise<number>{
  let res = await readContract({
    address: addr,
    abi: listOfOrdersABI,
    functionName: 'headOfList',
    args: [ BigInt(classOfShare), isOffer ]
  });

  return res;
}

export async function tailOfList(addr: HexType, classOfShare:number, isOffer:boolean):Promise<number>{
  let res = await readContract({
    address: addr,
    abi: listOfOrdersABI,
    functionName: 'tailOfList',
    args: [ BigInt(classOfShare), isOffer ]
  });

  return res;
}

export async function lengthOfList(addr: HexType, classOfShare:number, isOffer:boolean):Promise<bigint>{
  let res = await readContract({
    address: addr,
    abi: listOfOrdersABI,
    functionName: 'lengthOfList',
    args: [ BigInt(classOfShare), isOffer ]
  });

  return res;
}

export async function getSeqList(addr: HexType, classOfShare:number, isOffer:boolean):Promise<readonly bigint[]>{
  let res = await readContract({
    address: addr,
    abi: listOfOrdersABI,
    functionName: 'getSeqList',
    args: [ BigInt(classOfShare), isOffer ]
  });

  return res;
}

// ==== Order ====

export async function isOrder(addr: HexType, classOfShare:number, seqOfOrder: number, isOffer:boolean):Promise<boolean>{
  let res = await readContract({
    address: addr,
    abi: listOfOrdersABI,
    functionName: 'isOrder',
    args: [ BigInt(classOfShare), BigInt(seqOfOrder), isOffer ]
  });

  return res;
}

export async function getOrder(addr: HexType, classOfShare:number, seqOfOrder: number, isOffer:boolean):Promise<Order>{
  let res = await readContract({
    address: addr,
    abi: listOfOrdersABI,
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
    abi: listOfOrdersABI,
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
    abi: listOfOrdersABI,
    functionName: 'isClass',
    args: [ BigInt(classOfShare) ]
  });

  return res;
}

export async function getClassesList(addr: HexType):Promise<readonly bigint[]>{
  let res = await readContract({
    address: addr,
    abi: listOfOrdersABI,
    functionName: 'getClassesList',
  });

  return res;
}

