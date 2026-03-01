import { readContract } from "@wagmi/core";
import { HexType } from "../../common";
import { strNumToBigInt } from "../../common/toolsKit";
import { registerOfOptionsABI } from "../../../../../generated-v1";

export interface StrHeadOfOpt{
  seqOfOpt: string;
  typeOfOpt: string;
  classOfShare: string;
  rate: string;
  issueDate: number;
  triggerDate: number;
  execDays: string;
  closingDays: string;
  obligor: string;
}

export interface HeadOfOpt{
  seqOfOpt: number;
  typeOfOpt: number;
  classOfShare: number;
  rate: number;
  issueDate: number;
  triggerDate: number;
  execDays: number;
  closingDays: number;
  obligor: number;
}

// export function parseOrgHead(head: OrgHeadOfOpt): HeadOfOpt {
//   let out: HeadOfOpt = {
//     seqOfOpt: head.seqOfOpt,
//     typeOfOpt: head.typeOfOpt,
//     classOfShare: head.classOfShare.toString(),
//     rate: head.rate.toString(),
//     issueDate: head.issueDate,
//     triggerDate: head.triggerDate,
//     execDays: head.execDays.toString(),
//     closingDays: head.closingDays.toString(),
//     obligor: head.obligor.toString(),
//   };
//   return out;
// }

export const defaultStrHeadOfOpt: StrHeadOfOpt = {
  seqOfOpt: '0',
  typeOfOpt: '0',
  classOfShare: '0',
  rate: '0',
  issueDate: 0,
  triggerDate: 0,
  execDays: '0',
  closingDays: '0',
  obligor: '0',
}

export const defaultHeadOfOpt: HeadOfOpt = {
  seqOfOpt: 0,
  typeOfOpt: 0,
  classOfShare: 0,
  rate: 0,
  issueDate: 0,
  triggerDate: 0,
  execDays: 0,
  closingDays: 0,
  obligor: 0,
}

export function optHeadCodifier(head: StrHeadOfOpt): HexType {
  let out: HexType = `0x${
    Number(head.seqOfOpt).toString(16).padStart(8, '0') +
    Number(head.typeOfOpt).toString(16).padStart(2, '0') +
    Number(head.classOfShare).toString(16).padStart(4, '0') +
    strNumToBigInt(head.rate, 4).toString(16).padStart(8, '0') +
    head.issueDate.toString(16).padStart(12, '0') +
    head.triggerDate.toString(16).padStart(12, '0') +
    Number(head.execDays).toString(16).padStart(4, '0') +
    Number(head.closingDays).toString(16).padStart(4, '0') +
    Number(head.obligor).toString(16).padStart(10, '0')
  }`;
  return out;
}

// ==== BodyOfOpt ====

export interface StrBodyOfOpt{
  closingDeadline: number;
  rightholder: string;
  paid: string;
  par: string;
  state: string;
  para: string;
  argu: string;
}

export const defaultStrBodyOfOpt: StrBodyOfOpt = {
  closingDeadline: 0,
  rightholder: '0',
  paid: '0',
  par: '0',
  state: '0',
  para: '0',
  argu: '0',
}

export interface BodyOfOpt{
  closingDeadline: number;
  rightholder: number;
  paid: bigint;
  par: bigint;
  state: number;
  para: number;
  argu: number;
}

export const defaultBodyOfOpt: BodyOfOpt = {
  closingDeadline: 0,
  rightholder: 0,
  paid: 0n,
  par: 0n,
  state: 0,
  para: 0,
  argu: 0,
}

// export function parseOrgBody(body: BodyOfOpt): StrBodyOfOpt {

//   let out: StrBodyOfOpt = {
//     closingDeadline: body.closingDeadline.toString(),
//     rightholder: body.rightholder.toString(),
//     paid: body.paid.toString(),
//     par: body.par.toString(),
//     state: body.state,
//     para: body.para.toString(),
//     argu: body.argu.toString(),
//   };

//   return out;
// }

// ==== Cond ====

export interface StrCond {
  seqOfCond: string;
  logicOpr: string;    
  compOpr1: string;    
  para1: string;           
  compOpr2: string;    
  para2: string;           
  compOpr3: string;    
  para3: string;                               
}

export const defaultStrCond: StrCond = {
  seqOfCond: '0',
  logicOpr: '0',    
  compOpr1: '0',    
  para1: '0',           
  compOpr2: '0',
  para2: '0',        
  compOpr3: '0',
  para3: '0',             
}

export interface Cond {
  seqOfCond: number;
  logicOpr: number;    
  compOpr1: number;    
  para1: bigint;           
  compOpr2: number;    
  para2: bigint;           
  compOpr3: number;    
  para3: bigint;                               
}

export const defaultCond: Cond = {
  seqOfCond: 0,
  logicOpr: 0,    
  compOpr1: 0,    
  para1: 0n,           
  compOpr2: 0,
  para2: 0n,        
  compOpr3: 0,
  para3: 0n,             
}

// export function parseOrgCond(cond: Cond): StrCond {
//   let out: StrCond = {
//     seqOfCond: cond.seqOfCond,
//     logicOpr: cond.logicOpr,
//     compOpr1: cond.compOpr1,
//     para1: cond.para1.toString(),
//     compOpr2: cond.compOpr2,
//     para2: cond.para2.toString(),
//     compOpr3: cond.compOpr3,
//     para3: cond.para3.toString(),
//   };

//   return out;
// }

export function condCodifier(cond: StrCond): HexType {
  let out: HexType = `0x${
    Number(cond.seqOfCond).toString(16).padStart(8, '0') +
    Number(cond.logicOpr).toString(16).padStart(2, '0') +
    Number(cond.compOpr1).toString(16).padStart(2, '0') +
    strNumToBigInt(cond.para1, 4).toString(16).padStart(16, '0') +
    Number(cond.compOpr2).toString(16).padStart(2, '0') +
    strNumToBigInt(cond.para2, 4).toString(16).padStart(16, '0') +
    Number(cond.compOpr3).toString(16).padStart(2, '0') +
    strNumToBigInt(cond.para3, 4).toString(16).padStart(16, '0')
  }`;
  return out;
}

// ==== Option ====

export interface StrOption {
  head: StrHeadOfOpt;
  cond: StrCond;
  body: StrBodyOfOpt;
}

export interface Option {
  head: HeadOfOpt;
  cond: Cond;
  body: BodyOfOpt;
}

// export function parseOrgOpt(opt: OrgOption): Option {
//   let out: Option = {
//     head: parseOrgHead(opt.head),
//     cond: parseOrgCond(opt.cond),
//     body: parseOrgBody(opt.body),
//   };
//   return out;
// } 

export interface OptWrap {
  opt: Option;
  obligors: number[];
}

export const defaultOpt: Option = {
  head: defaultHeadOfOpt,
  cond: defaultCond,
  body: defaultBodyOfOpt,
}

export const defaultOptWrap: OptWrap = {
  opt: defaultOpt,
  obligors: [0],
}

export const typeOfOpts = [
  'Call @ Price', 'Put @ Price', 'Call @ ROE', 'Put @ ROE', 
  'Call @ Price & Cnds', 'Put @ Price & Cnds', 'Call @ ROE & Cnds', 'Put @ ROE & Cnds'
]

export const logOps = [
  '(SoleCond)', 
  '&& (And)', '|| (Or)', '== (Equal)', '!= (NotEqual)',
  '&&_&&', '||_||', '&&_||', '||_&&', 
  '==_==', '!=_!=', '==_!=', '!=_==', 
  '&&_==', '==_&&', '||_==', '==_||', 
  '&&_!=', '!=_&&', '||_!=', '!=_||', 
]

export const comOps = [
  'None', '==', '!=', '>', '<', '>=', '<=' 
]

export interface StrCheckPoint {
  timestamp: string;
  paid: string;
  par: string;
  points: string;
}


export interface CheckPoint {
  timestamp: number;
  paid: bigint;
  par: bigint;
  points: bigint;
}

// export function parseOrgOracle(oracle: OrgCheckPoint): CheckPoint {
//   let out: CheckPoint = {
//     timestamp: oracle.toString(),
//     paid: oracle.paid.toString(),
//     par: oracle.par.toString(),
//     cleanPaid: oracle.cleanPaid.toString(),
//   }
//   return out;
// }

export interface StrSwap{
  seqOfSwap: string;
  seqOfPledge: string;
  paidOfPledge: string;
  seqOfTarget: string;
  paidOfTarget: string;
  priceOfDeal: string;
  isPutOpt: boolean;
  state: string; 
}

export interface Swap{
  seqOfSwap: number;
  seqOfPledge: number;
  paidOfPledge: bigint;
  seqOfTarget: number;
  paidOfTarget: bigint;
  priceOfDeal: number;
  isPutOpt: boolean;
  state: number; 
}

// export function parseOrgSwap(swap: OrgSwap): Swap {

//   let out: Swap = {
//     seqOfSwap: swap.seqOfSwap.toString(),
//     seqOfPledge: swap.seqOfPledge.toString(),
//     paidOfPledge: swap.paidOfPledge.toString(),
//     seqOfTarget: swap.seqOfTarget.toString(),
//     paidOfTarget: swap.paidOfTarget.toString(),
//     priceOfDeal: swap.priceOfDeal.toString(),
//     isPutOpt: swap.isPutOpt,
//     state: swap.state.toString(),
//   }

//   return out;
// }

// ==== Read Funcs =====

export async function counterOfOptions(addr: HexType): Promise<number>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'counterOfOptions',
  })

  return res;
}

export async function qtyOfOptions(addr: HexType): Promise<bigint>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'qtyOfOptions',
  })

  return res;
}

export async function isOption(addr: HexType, seqOfOpt: number): Promise<boolean>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'isOption',
    args: [ BigInt(seqOfOpt) ]
  })

  return res;
}

export async function getOption(addr: HexType, seqOfOpt: string): Promise<Option>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'getOption',
    args: [ BigInt(seqOfOpt) ]
  })

  return res;
}

export async function getAllOptions(addr: HexType): Promise<readonly Option[]>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'getAllOptions',
  })

  return res;
}

export async function isRightholder(addr: HexType, seqOfOpt: number, acct: number): Promise<boolean>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'isRightholder',
    args: [ BigInt(seqOfOpt), BigInt(acct) ]
  })

  return res;
}

export async function isObligor(addr: HexType, seqOfOpt: number, acct: number): Promise<boolean>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'isObligor',
    args: [ BigInt(seqOfOpt), BigInt(acct) ]
  })

  return res;
}

export async function getObligorsOfOption(addr: HexType, seqOfOpt: string): Promise<readonly bigint[]>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'getObligorsOfOption',
    args: [ BigInt(seqOfOpt) ]
  })

  return res;
}

export async function getSeqListOfOptions(addr: HexType): Promise<readonly bigint[]>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'getSeqListOfOptions',
  })

  return res;
}

// ==== Swap ====

export async function counterOfSwaps(addr: HexType, seqOfOpt: number): Promise<number>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'counterOfSwaps',
    args: [ BigInt(seqOfOpt) ],
  })

  return res;
}

export async function sumPaidOfTarget(addr: HexType, seqOfOpt: number): Promise<bigint>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'sumPaidOfTarget',
    args: [ BigInt(seqOfOpt) ],
  })

  return res;
}

export async function isSwap(addr: HexType, seqOfOpt: number, seqOfSwap: number): Promise<boolean>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'isSwap',
    args: [ BigInt(seqOfOpt), BigInt(seqOfSwap) ],
  })

  return res;
}

export async function getSwap(addr: HexType, seqOfOpt: number, seqOfSwap: number): Promise<Swap>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'getSwap',
    args: [ BigInt(seqOfOpt), BigInt(seqOfSwap) ],
  })

  return res;
}

export async function getAllSwapsOfOption(addr: HexType, seqOfOpt: number): Promise<readonly Swap[]>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'getAllSwapsOfOption',
    args: [ BigInt(seqOfOpt) ],
  })

  return res;
}

export async function allSwapsClosed(addr: HexType, seqOfOpt: number): Promise<boolean>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'allSwapsClosed',
    args: [ BigInt(seqOfOpt) ],
  })

  return res;
}

// ==== Oracles ====

export async function getOracleAtDate(addr: HexType, seqOfOpt: number, date: number): Promise<CheckPoint>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'getOracleAtDate',
    args: [ BigInt(seqOfOpt), BigInt(date) ],
  })

  return res;
}

export async function getLatestOracle(addr: HexType, seqOfOpt: number): Promise<CheckPoint>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'getLatestOracle',
    args: [ BigInt(seqOfOpt) ],
  })

  return res;
}

export async function getAllOraclesOfOption(addr: HexType, seqOfOpt: number): Promise<readonly CheckPoint[]>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'getAllOraclesOfOption',
    args: [ BigInt(seqOfOpt) ],
  })

  return res;
}

// ==== Value ====

export async function checkValueOfSwap(addr: HexType, seqOfOpt: number, seqOfSwap: number): Promise<bigint>{

  let res = await readContract({
    address: addr,
    abi: registerOfOptionsABI,
    functionName: 'checkValueOfSwap',
    args: [ BigInt(seqOfOpt), BigInt(seqOfSwap) ],
  })

  return res;
}

// ==== Special Funcs ====

export async function getAllOpts(addr: HexType): Promise<readonly OptWrap[]>{

  let opts = await getAllOptions(addr);
  let len = opts.length;
  let out: OptWrap[] = [];

  while(len > 0) {
    let opt = opts[len - 1];
    let obligors = await getObligorsOfOption(addr, opt.head.seqOfOpt.toString());
    let item: OptWrap = {
      opt: opt,
      obligors: obligors.map(v => Number(v)),
    };
    out.push(item);
    len--;
  }

  return out;
}

export async function getOptWrap(addr: HexType, seqOfOpt: string): Promise<OptWrap>{

  let opt = await getOption(addr, seqOfOpt);
  let obligors = await getObligorsOfOption(addr, seqOfOpt);

  let out:OptWrap = {
    opt: opt,
    obligors: obligors.map(v => Number(v)), 
  }

  return out;
}
