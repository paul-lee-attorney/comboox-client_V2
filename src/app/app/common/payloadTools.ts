import { getFunctionSelector, keccak256, toHex } from "viem";
import { Bytes32Zero, HexType } from ".";

export interface Selector {
  selector: HexType;
  offSet:number;
}

export interface Selectors {
  [key: string]: Selector
}

// export function selectorCodifier(func: string): HexType {
//     let hash = keccak256(toHex(func));
//     return `0x${hash.substring(2,10)}`;
// }

// ==== payload constructor ====

export const selectors: Selectors = {
  'requestPaidInCapital': {selector: getFunctionSelector('requestPaidInCapital(bytes32,string)'), offSet: 0x40},
  'closeDeal': {selector: getFunctionSelector('closeDeal(address,uint256,string)'), offSet: 0x60},
  'releasePledge': {selector: getFunctionSelector('releasePledge(uint256,uint256,string)'), offSet: 0x60},
  'transferUsd': {selector: getFunctionSelector('transferUsd(address,uint256)'), offSet: 0x00},
}

export const funcNames:string[] = [
  'requestPaidInCapital',
  'closeDeal',
  'releasePledge',
]

export function constructPayload(func:string, paras:string[]):HexType {
  let selector = selectors[func].selector;
  let strParas:string = '';
  paras.forEach(v=>strParas = strParas.concat(v));
  let offSet = selectors[func].offSet.toString(16).padStart(64, '0');

  return `0x${selector.substring(2) + strParas + offSet }`;
}

export function calDefaultParas(hashLock:HexType, offSet:number):string[]{

  let out:string[] = [ hashLock.substring(2).padStart(0x40, '0') ];
  let len = parseInt(`${offSet/0x20}`) - 1;
  while (len > 1) {
    out.push(Bytes32Zero);
    len--;
  }
  return out;
}