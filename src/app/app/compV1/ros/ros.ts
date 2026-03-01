import { readContract } from "@wagmi/core";
import { HexType } from "../../common";
import { registerOfSharesABI } from "../../../../../generated-v1";
import { StrLocker, parasParser } from "../../rc";
import { bigIntToStrNum, strNumToBigInt } from "../../common/toolsKit";

export interface StrHead {
  class: string; // 股票类别/轮次编号
  seqOfShare: string; // 股票序列号
  preSeq: string; // 前序股票序列号（股转时原标的股序列号）
  issueDate: number; // 股票签发日期（秒时间戳）
  shareholder: string; // 股东代码
  priceOfPaid: string; // 发行价格（实缴出资价）
  priceOfPar: string; // 发行价格（认缴出资价）
  votingWeight: string; // 表决权重（基点）
}

export interface Head {
  class: number; // 股票类别/轮次编号
  seqOfShare: number; // 股票序列号
  preSeq: number; // 前序股票序列号（股转时原标的股序列号）
  issueDate: number; // 股票签发日期（秒时间戳）
  shareholder: number; // 股东代码
  priceOfPaid: number; // 发行价格（实缴出资价）
  priceOfPar: number; // 发行价格（认缴出资价）
  votingWeight: number; // 表决权重（基点）
}

export const defStrHead: StrHead = {
  class: '0',
  seqOfShare: '0',
  preSeq: '0',
  issueDate: 0,
  shareholder: '0',
  priceOfPaid: '1.0',
  priceOfPar: '1.0',
  votingWeight: '100',  
}

// export function parseOrgHead(head: OrgHead): Head {
//   let out: Head = {
//     class: head.class.toString(),
//     seqOfShare: head.seqOfShare.toString(),
//     preSeq: head.preSeq.toString(),
//     issueDate: head.issueDate,
//     shareholder: head.shareholder.toString(),
//     priceOfPaid: head.priceOfPaid.toString(),
//     priceOfPar: head.priceOfPar.toString(),
//     votingWeight: head.votingWeight.toString(),
//   };

//   return out;
// }

export interface StrBody {
  payInDeadline: number; // 出资期限（秒时间戳）
  paid: string; // 实缴出资
  par: string; // 认缴出资（注册资本面值）
  cleanPaid: string; // 清洁实缴出资（扣除出质、远期、销售要约金额）
  distrWeight: string;
}

export interface Body {
  payInDeadline: number; // 出资期限（秒时间戳）
  paid: bigint; // 实缴出资
  par: bigint; // 认缴出资（注册资本面值）
  cleanPaid: bigint; // 清洁实缴出资（扣除出质、远期、销售要约金额）
  distrWeight: number;
}

export const defStrBody: StrBody = {
  payInDeadline: 0,
  paid: '0',
  par: '0',
  cleanPaid: '0',
  distrWeight: '100',  
}

// export function parseOrgBody(body: OrgBody): Body {
//   let out: Body = {
//     payInDeadline: body.payInDeadline,
//     paid: body.paid.toString(),
//     par: body.par.toString(),
//     cleanPaid: body.cleanPaid.toString(),
//     state: body.state,
//   }

//   return out;
// }

export interface Share {
  head: Head;
  body: Body;
}

export interface StrShare {
  head: StrHead;
  body: StrBody;
}

export const defStrShare: StrShare = {
  head: defStrHead,
  body: defStrBody,
}

// export function parseOrgShare(share: OrgShare):Share {
//   let out:Share = {
//     head: parseOrgHead(share.head),
//     body: parseOrgBody(share.body),
//   }
//   return out;
// }

export function codifyHeadOfShare(head: Head): HexType {
  let sn: HexType = `0x${
    head.class.toString(16).padStart(4, '0') +
    head.seqOfShare.toString(16).padStart(8, '0') +
    head.preSeq.toString(16).padStart(8, '0') +
    head.issueDate.toString(16).padStart(12, '0') +
    head.shareholder.toString(16).padStart(10, '0') +
    head.priceOfPaid.toString(16).padStart(8, '0') +
    head.priceOfPar.toString(16).padStart(8, '0') +
    head.votingWeight.toString(16).padStart(4, '0') +
    '00'
  }`;
  return sn;
}

export function codifyHeadOfStrShare(head: StrHead): HexType {
  let sn: HexType = `0x${
    Number(head.class).toString(16).padStart(4, '0') +
    Number(head.seqOfShare).toString(16).padStart(8, '0') +
    Number(head.preSeq).toString(16).padStart(8, '0') +
    Number(head.issueDate).toString(16).padStart(12, '0') +
    Number(head.shareholder).toString(16).padStart(10, '0') +
    (strNumToBigInt(head.priceOfPaid, 4).toString(16).padStart(8, '0')) +
    (strNumToBigInt(head.priceOfPar, 4).toString(16).padStart(8, '0')) +
    Number(head.votingWeight).toString(16).padStart(4, '0') +
    '00'
  }`;
  return sn;
}

export function parseSnOfShare(sn: HexType): Head {
  let head: Head = {
    class: parseInt(sn.substring(2, 6), 16),
    seqOfShare: parseInt(sn.substring(6, 14), 16),
    preSeq: parseInt(sn.substring(14, 22), 16),
    issueDate: parseInt(sn.substring(22, 34), 16),
    shareholder: parseInt(sn.substring(34, 44), 16),
    priceOfPaid: parseInt(sn.substring(44, 52), 16),
    priceOfPar: parseInt(sn.substring(52, 60), 16),
    votingWeight: parseInt(sn.substring(60, 64), 16)
  };

  return head
}

// ==== Read Funcs ====

export async function counterOfShares(ros: HexType): Promise<number>{

  let counter = await readContract({
    address: ros,
    abi: registerOfSharesABI,
    functionName: 'counterOfShares',
  })

  return counter;
}

export async function counterOfClasses(ros: HexType): Promise<number>{

  let counter = await readContract({
    address: ros,
    abi: registerOfSharesABI,
    functionName: 'counterOfClasses',
  })

  return counter;
}

export async function isShare(ros: HexType, seqOfShare: string): Promise<boolean>{

  let flag = await readContract({
    address: ros,
    abi: registerOfSharesABI,
    functionName: 'isShare',
    args: [BigInt(seqOfShare)],
  })

  return flag;
}

export async function getShare(ros: HexType, seq: string): Promise<Share> {

  let share = await readContract({
    address: ros,
    abi: registerOfSharesABI,
    functionName: 'getShare',
    args: [BigInt(seq)],
  });

  return share;
}

export async function getQtyOfShares(ros: HexType): Promise<bigint>{

  let res = await readContract({
    address: ros,
    abi: registerOfSharesABI,
    functionName: 'getQtyOfShares',
  })

  return res;
}

export async function getSeqListOfShares(ros: HexType): Promise<readonly bigint[]>{

  let res = await readContract({
    address: ros,
    abi: registerOfSharesABI,
    functionName: 'getSeqListOfShares',
  })

  return res;
}

export async function getSharesList(ros: HexType): Promise<readonly Share[]> {
  let res = await readContract({
    address: ros,
    abi: registerOfSharesABI,
    functionName: 'getSharesList',
  })

  return res;
}

// ==== Classes ====

export async function getQtyOfSharesInClass(ros: HexType, classOfShare: string): Promise<bigint> {
  let res = await readContract({
    address: ros,
    abi: registerOfSharesABI,
    functionName: 'getQtyOfSharesInClass',
    args: [ BigInt(classOfShare) ]
  })

  return res;
}

export async function getSeqListOfClass(ros: HexType, classOfShare: string): Promise<readonly bigint[]> {
  let res = await readContract({
    address: ros,
    abi: registerOfSharesABI,
    functionName: 'getSeqListOfClass',
    args: [ BigInt(classOfShare) ]
  })

  return res;
}

export async function getInfoOfClass(ros: HexType, classOfShare: string): Promise<Share> {
  let res = await readContract({
    address: ros,
    abi: registerOfSharesABI,
    functionName: 'getInfoOfClass',
    args: [ BigInt(classOfShare) ]
  })

  return res;
}

export async function getSharesOfClass(ros: HexType, classOfShare: string): Promise<readonly Share[]>{

  let list = await readContract({
    address: ros,
    abi: registerOfSharesABI,
    functionName: 'getSharesOfClass',
    args: [ BigInt(classOfShare) ],
  })
  
  return list;
}

export async function getPremium(ros: HexType): Promise<bigint>{

  let res = await readContract({
    address: ros,
    abi: registerOfSharesABI,
    functionName: 'getPremium',
  })
  
  return res;
}



// ==== PayInCap ====

export async function getLocker(ros: HexType, hashLock: HexType): Promise<StrLocker>{

  let res = await readContract({
    address: ros,
    abi: registerOfSharesABI,
    functionName: 'getLocker',
    args: [ hashLock ],
  })
  
  let locker:StrLocker = {
    hashLock: hashLock,
    head: {
      from: res.head.from.toString(),
      to: res.head.to.toString(),
      expireDate: res.head.expireDate,
      value: bigIntToStrNum(res.head.value, 2),
    },
    body: 
      { 
        counterLocker: res.body.counterLocker,
        selector: `0x${res.body.payload.substring(2,10)}`,
        paras: parasParser(res.body.payload.substring(10)),
      }
  }

  return locker;
}

export async function getLocksList(ros: HexType): Promise<readonly HexType[]>{

  let list = await readContract({
    address: ros,
    abi: registerOfSharesABI,
    functionName: 'getLocksList',
  })
  
  return list;
}
