import { readContract } from "@wagmi/core";
import { HexType } from "../../../common";
import { filesFolderABI } from "../../../../../../generated-v1";

export interface Head {
  circulateDate: number;
  signingDays: number;
  closingDays: number;
  seqOfVR: number;
  frExecDays: number;
  dtExecDays: number;
  dtConfirmDays: number;
  proposeDate: number;
  invExitDays: number;
  votePrepareDays: number;
  votingDays: number;
  execDaysForPutOpt: number;
  seqOfMotion: bigint;
  state: number;
}

export interface Ref {
  docUrl: HexType;
  docHash: HexType; 
}

export interface File {
  snOfDoc: HexType;
  head: Head;
  ref: Ref;
}

export interface InfoOfFile {
  addr: HexType;
  sn: HexType;
  head: Head;
  ref: Ref;
}

export async function signingDeadline(folder: HexType, body: HexType):Promise<number>{
  let res: number = await readContract({
    address: folder,
    abi: filesFolderABI,
    functionName: 'signingDeadline',
    args: [ body ],
  })

  return res;
}

export async function closingDeadline(folder: HexType, body: HexType):Promise<number>{
  let deadline: number = await readContract({
    address: folder,
    abi: filesFolderABI,
    functionName: 'closingDeadline',
    args: [ body ],
  })

  return deadline;
}

export async function frExecDeadline(folder: HexType, body: HexType):Promise<number>{
  let deadline: number = await readContract({
    address: folder,
    abi: filesFolderABI,
    functionName: 'frExecDeadline',
    args: [ body ],
  })

  return deadline;
}

export async function dtExecDeadline(folder: HexType, body: HexType):Promise<number>{
  let deadline: number = await readContract({
    address: folder,
    abi: filesFolderABI,
    functionName: 'dtExecDeadline',
    args: [ body ],
  })

  return deadline;
}

export async function terminateStartpoint(folder: HexType, body: HexType):Promise<number>{
  let res = await readContract({
    address: folder,
    abi: filesFolderABI,
    functionName: 'terminateStartpoint',
    args: [ body ],
  })

  return res;
}

export async function votingDeadline(folder: HexType, body: HexType):Promise<number>{
  let deadline: number = await readContract({
    address: folder,
    abi: filesFolderABI,
    functionName: 'votingDeadline',
    args: [ body ],
  })

  return deadline;
}

export async function qtyOfFiles(folder: HexType, body: HexType):Promise<BigInt>{
  let qty: BigInt = await readContract({
    address: folder,
    abi: filesFolderABI,
    functionName: 'qtyOfFiles',
  })

  return qty;
}

export async function getSnOfFile(folder: HexType, body: HexType):Promise<HexType>{
  let file: File = await readContract({
    address: folder,
    abi: filesFolderABI,
    functionName: 'getFile',
    args: [ body ],
  })

  return file.snOfDoc;
}

export async function getFile(folder: HexType, body: HexType):Promise<File>{
  let file: File = await readContract({
    address: folder,
    abi: filesFolderABI,
    functionName: 'getFile',
    args: [ body ],
  })

  return file;
}

export async function getFilesList(folder: HexType):Promise<readonly HexType[]> {

  let list: readonly HexType[] = await readContract({
    address: folder,
    abi: filesFolderABI,
    functionName: 'getFilesList',
  })

  return list;
}

export async function isRegistered(folder: HexType, body: HexType):Promise<boolean>{
  let flag: boolean = await readContract({
    address: folder,
    abi: filesFolderABI,
    functionName: 'isRegistered',
    args: [ body ],
  })

  return flag;
}

export async function getHeadOfFile(folder: HexType, addrOfFile: HexType): Promise<Head> {

  let res = await readContract({
    address: folder,
    abi: filesFolderABI,
    functionName: 'getHeadOfFile',
    args: [ addrOfFile ],
  })

  return res;
}

export async function getFilesListWithInfo(addr: HexType):Promise<InfoOfFile[]>{

  let ls = await getFilesList(addr);

  let list: InfoOfFile[] = [];
  let len: number = ls.length;
  let i = len > 100 ? len - 100 : 0;

  while(i < len) {
  
    let file = await getFile(addr, ls[len - i - 1]);

    list.push({
      addr: ls[len - i - 1],
      sn: file.snOfDoc,
      head: file.head,
      ref: file.ref,
    });

    i++;

  }

  return list;
}

export async function getFilesInfoList(addr: HexType, ls: readonly HexType[]):Promise<InfoOfFile[]>{

  let list: InfoOfFile[] = [];
  let len: number = ls.length;
  let i = len > 100 ? len - 100 : 0;

  while(i < len) {
  
    let file = await getFile(addr, ls[i]);

    list.push({
      addr: ls[i],
      sn: file.snOfDoc,
      head: file.head,
      ref: file.ref,
    });

    i++;

  }

  return list;
}

