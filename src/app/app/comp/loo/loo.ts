import { readContract } from "@wagmi/core";
import { listOfOrdersABI } from "../../../../../generated";
import { HexType } from "../../common";
import { Deal, Order } from "../../compV1/loe/loe";
import { HexParser } from "../../common/toolsKit";

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

