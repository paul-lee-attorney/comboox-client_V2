import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { HexType } from ".";
import { waitForTransaction } from "@wagmi/core";
import { Dispatch, SetStateAction } from "react";
import { keccak256, toUtf8Bytes } from "ethers";

dayjs.extend(utc);

export function stampToUtc(stamp: number ): dayjs.Dayjs {
  return dayjs.unix(stamp).utc();
}

export function utcToStamp(date: dayjs.Dayjs | null): number {
  return date ? dayjs(date).utc().unix() : 0;
}

export function toPercent(strNum: string): string {
  let num = Number(strNum);
  let percent = num == 0 ? '-' : Number(num / 100).toFixed(2) + '%';
  return percent;
}

export function ppToPercent(num: number): string {
  let percent = num == 0 ? '-' : num.toString() + '%';
  return percent;
}

export function toBasePoint(percent: string): number {
  let strPercent = percent.replace('%', '').replace('.', '');
  let basePoint = parseInt(strPercent);
  return basePoint;
}

export function dateParser(timestampStr: string): string {
  let timestamp = Number(timestampStr);
  return timestamp == 0 ? '-' : dayjs.unix(timestamp).utc().format('YYYY-MM-DD HH:mm:ss');
}

export function longSnParser(sn: string): string {
  if (sn.length < 4) sn = sn.padStart(4, '0');
  sn = sn.replace(/\d{1,4}(?=(\d{4})+$)/g, (match) => (match + '-'));
  if (sn === '0000') sn = '-';
  return sn;
}

export function longDataParser(data: string): string {
  if (data === '0')
    return '-';
  else
    return data.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

export function splitStrArr(input: string[]):string{
  let out:string = '';
  input.forEach(v => {
    out += v + '\n';
  });
  return out;
}

export function splitPayload(input: string):string[]{
  let out:string[] = [];
  let len = parseInt(`${input.length/64}`);
  let i = 0;
  while (i < len) {
    out.push(input.substring(i*64, (i+1)*64));
    i++;
  }
  return out;
}

export function HexParser(input: string):HexType {
  
  let prefix = input.substring(0,2);

  let output: HexType;

  if (prefix == '0x') output = `0x${input.substring(2)}`;
  else output = `0x${input}`;

  return output;
}

export function toStr(input: HexType): string {

  let hex = input.substring(2);
  if (hex.length % 2 != 0) hex = hex + '0';
  let len = hex.length;
  let i=0;
  let str = '';

  while (i <= len) {
    let charHex = `0x${hex.substring(0, 2)}`;
    str += String.fromCharCode(Number(charHex));
    hex = hex.substring(2);
    i += 2;
  }

  return str;
}

export function toAscii(input: string): string {
  let str = '';
  
  input.split('').forEach(
    v => str += v.charCodeAt(0).toString(16).padStart(2,'0')
  );

  return str;
}

export function weiToEth(input: string): string {

  if (input == '0') return '-';

  let len = input.length;

  let int = len > 18
          ? longDataParser(input.substring(0, len - 18))
          : '0';

  let dec = len > 18
          ? input.substring(len - 18)
          : input.padStart(18, '0');

  dec = dec.replace(/\B(?=(\d{3})+$)/g, ",");
  dec = dec.substring(0, 11) + ' - ' + dec.substring(12);

  return int + '.' + dec;
}

export function getGEthPart(input: string): string {
  
  let len = input.length;

  let res = len > 27
          ? longDataParser(input.substring(0, len - 27).toString())
          : '-';

  return res;
}


export function getEthPart(input: string): string {
  
  let len = input.length;

  let res = len > 18
          ? len > 27
            ? longDataParser(input.substring(len - 27, len - 18))
            : longDataParser(input.substring(0, len - 18))
          : '-';

  return res;
}

export function getGWeiPart(input: string): string {
  
  let len = input.length;

  let res = len > 9
          ? len > 18
            ? longDataParser(input.substring(len - 18, len - 9))
            : longDataParser(input.substring(0, len - 9))
          : '-'

  return res;
}

export function getWeiPart(input: string): string {
  let len = input.length;

  let res = len > 9
          ? longDataParser(input.substring(len - 9))
          : longDataParser(input)

  return res;
}

export function removeKiloSymbol(input: string): string {
  let reg = new RegExp(",", "g");
  let out = input.replace(reg, "");
  return out;
}

export async function refreshAfterTx(hash: HexType, refresh:()=>void ) {
  let res = await waitForTransaction({hash});
  console.log("Receipt: ", res);
  refresh();
} 

// ==== Input Validation ====

export interface Result {
  error: boolean;
  helpTx: string;
}

export interface FormResults {
  [id: string]: Result;
}

export const defResult: Result = {
  error: false,
  helpTx: '',
}

export const defFormResults:FormResults = {
  '': defResult, 
}

export function onlyInt(id: string, input: string, max: bigint, setValid:Dispatch<SetStateAction<FormResults>>) {
  let reg = /^(0|[1-9][0-9]*)$/;
  let error: boolean = !reg.test(input);
  let overflow: boolean = error
                        ? false
                        : max == 0n
                          ? false
                          : BigInt(input) > max;

  let result:Result = {
    error: error || overflow,
    helpTx: error 
          ? 'Only Integer'
          : overflow
            ? 'Over Flow'
            : ' ',
  }

  setValid( v => {
    let out = {...v};
    out[id] = result;
    return out;
  });
}

export function removeDotFromStrNum(input:string, dec:number): string {
  if (!isNum(input)) return '0';

  let len = input.length;
  let pos = input.indexOf('.');
  let dif = dec - (pos > 0 ? len - 1 - pos : 0);
  let output = input.replace('.', '') + (dif > 0 ? '0'.padEnd(dif, '0') : '');

  return output; 
}

export function strNumToBigInt(input:string, dec:number): bigint {
  let output = BigInt(removeDotFromStrNum(input, dec));

  return output; 
}

export function isNum(input: string): boolean {
  let reg = /^([1-9]\d*\.?\d*)|(0\.\d*[1-9])|(0)$/;
  let output = reg.test(input);

  return output;
}

export function tailTooLong(input:string, maxDec:number):boolean {
  let output = maxDec == 0 || input.indexOf('.') < 0
            ? false 
            : (input.length - input.indexOf('.') - 1) > maxDec;

  return output;
}

export function overflow(input:string, max:bigint, maxDec:number):boolean {
  let output = max == 0n
            ? false
            : strNumToBigInt(input, maxDec) > max;

  return output;
}

export function onlyNum(id: string, input: string, max:bigint, maxDec: number, setValid:Dispatch<SetStateAction<FormResults>>) {

  let result:Result = {error:false, helpTx:' '} ;
  
  if (!isNum(input)) {
    result = {error: true, helpTx: 'Only Number'};
  } else if (tailTooLong(input, maxDec)) {
    result = {error: true, helpTx: 'Tail Too Long'};
  } else if (overflow(input, max, maxDec)) {
    result = {error: true, helpTx: 'Value Overflow'};
  }
  
  setValid( v => {
    let out = {...v};
    out[id] = result;
    return out;
  });
}

export function isHex(input: string): boolean {
  let reg = /^(?:0x)?[a-f0-9A-F]+$/;
  return reg.test(input);
}

export function onlyHex(id: string, input: string, len: number, setValid:Dispatch<SetStateAction<FormResults>>){
  let error: boolean = !isHex(input);
  let overflow: boolean = error
                        ? false
                        : len == 0
                          ? false
                          : input.substring(0,2) == '0x'
                              ? input.length != (len + 2)
                              : input.length != len;

  let result:Result = {
    error: error || overflow,
    helpTx: error 
          ? 'Only Hex'
          : overflow
            ? 'Incorrect Length'
            : ' ', 
  };

  setValid( v => {
    let out = {...v};
    out[id] = result;
    return out;
  });
}

export function isChar(input: string): boolean {
  let reg = /^([a-zA-Z\s]+)$/;
  return reg.test(input);
}

export function onlyChars(id: string, input: string, len: number, setValid:Dispatch<SetStateAction<FormResults>>){
  let error: boolean = !isChar(input);
  let overflow: boolean = error
                        ? false
                        : len == 0
                          ? false
                          : input.length > len;

  let result:Result = {
    error: error || overflow,
    helpTx: error 
          ? 'Only Char'
          : overflow
            ? 'Incorrect Length'
            : ' ', 
  };

  setValid( v => {
    let out = {...v};
    out[id] = result;
    return out;
  });
}

export function isEmail(input: string): boolean {
  let reg = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
  return reg.test(input);
}

export function onlyEmail(id: string, input: string, setValid:Dispatch<SetStateAction<FormResults>>){
  let error: boolean = !isEmail(input);

  let result:Result = {
    error: error,
    helpTx: error 
          ? 'Only Email'
          : ' ', 
  };

  setValid( v => {
    let out = {...v};
    out[id] = result;
    return out;
  });
}

export function numOrChar(input: string): boolean {
  let reg = /^[a-zA-Z0-9]+$/;
  return reg.test(input);
}

export function onlyNumOrChar(id: string, input: string, setValid:Dispatch<SetStateAction<FormResults>>){
  let error: boolean = !numOrChar(input);
  let result:Result = {
    error: error,
    helpTx: error 
          ? 'Only Number or Char'
          : ' ', 
  };

  setValid( v => {
    let out = {...v};
    out[id] = result;
    return out;
  });
}

export function hasError(valid: FormResults): boolean {

  for (let key in valid) {
    if (valid[key]?.error) return true;    
  }  
  
  return false;
}

export function centToDollar(input: string): string {
  return strIntToNum(input, 2);
}

export function baseToDollar(input: string): string {
  return strIntToNum(input, 4);
}

export function bigIntToStrNum(input: bigint, dec: number): string {
  return strIntToNum(input.toString(), dec);
}

export function bigIntToNum(input: bigint, dec: number): string {
  return removeKiloSymbol(bigIntToStrNum(input, dec));
}

export function trimZeroInTail(input: string):string {
  return input.replace(/(?:\.0*|(\.\d+?)0+)$/,'$1');
}

function strIntToNum(input: string, dec: number): string {
  let neg = false;
  
  if (input[0] == '-') {
    neg = true;
    input = input.substring(1); 
  }

  let len = input.length;
  let front = len > dec ? longDataParser(input.substring(0,  (len - dec))) : '0';
  let end = len > dec ? input.substring(len - dec, len) : input.padStart(dec, '0');
  let res = front + trimZeroInTail('.' + end);

  return  neg ? '-' + res : res;
}

export async function getReceipt(hash: HexType): Promise< any > {
  const res = await waitForTransaction({
    hash: hash
  });
  return res;
}

export function addrToUint(addr: HexType): bigint {
  let uintHex = HexParser(addr.substring(2).padStart(64, '0'));
  return BigInt(uintHex);
}

export function bigIntToAddr(num:bigint): HexType {
  return HexParser(num.toString(16).padStart(64, '0').substring(24));
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getTypeByName = (name: string): bigint => {
  const hash = BigInt(keccak256(toUtf8Bytes(name)));
  return hash & BigInt(0xFFFFFFFF);
}

export function userNoParser(hex:string) {
  let s = String(hex).trim().toUpperCase();

  const has0x = /^0x/i.test(s);
  if (has0x) s = s.slice(2);

  s = s.replace(/[^0-9A-F]/g, "");

  if (s.length === 0 || /^0+$/.test(s)) return "-";

  const parts = [];
  for (let i = s.length; i > 0; i -= 5) {
    parts.unshift(s.slice(Math.max(0, i - 5), i));
  }

  return parts.join("_");
}

export function userNoCodifier(userNo: string) {
  if (userNo === '-') return '0'.padStart(10, '0');

  userNo = userNo.replace('0x', '');

  let parts = userNo.split('_');
  let hex = parts.length > 1
      ? parts.map(part => part.padStart(5, '0')).join('')
      : userNo.padStart(10, '0');
  return hex;
}

export function hexToBigInt(hex:string) {
  const normalized = hex.trim().replace(/^0x/i, '');
  return BigInt(`0x${normalized === '' ? '0' : normalized}`);
}
