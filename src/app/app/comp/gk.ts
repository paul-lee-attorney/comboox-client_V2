import { readContract } from "@wagmi/core";
import { AddrZero, HexType } from "../common";
import { baseKeeperABI } from "../../../../generated";
import { getDK } from "./common/draftControl";
import { toStr } from "../common/toolsKit";
import { getOwner } from "../common/ownable";

export const nameOfBooks = [
  'GK', 'ROC', 'ROD', 'BMM', 'ROM', 'GMM', 
  'ROA', 'ROO', 'ROP', 'ROS', 'LOO', 'ROI',
  'Bank', 'Blank', 'Blank', 'Cashier', 'ROR'
]

export const titleOfKeepers = [
  'GK', 'RocKeeper', 'RodKeeper', 'BmmKeeper', 'RomKeeper', 
  'GmmKeeper', 'RoaKeeer', 'RooKeeper', 'RopKeeper', 'ShaKeeper', 
  'LooKeeper', 'RoiKeeper', 'Accountant', 'Blank', 'Blank', 
  'Blank', 'RorKeeper'
]

export async function getKeeper(addr: HexType, title: number):Promise<HexType> {
  let keeper: HexType = await readContract({
    address: addr,
    abi: baseKeeperABI,
    functionName: 'getKeeper',
    args: [BigInt(title)]
  })

  return keeper;
}

export async function getBook(addr: HexType, title: number):Promise<HexType> {
  let keeper: HexType = await readContract({
    address: addr,
    abi: baseKeeperABI,
    functionName: 'getBook',
    args: [BigInt(title)]
  })

  return keeper;
}

export interface BookInfo {
  title: number;
  addr: HexType;
  owner: HexType;
  dk: HexType;
}

export async function getBoox(gk: HexType): Promise<BookInfo[]>{
  let books: BookInfo[] = [];

  books.push({
    title: 0,
    addr: gk,
    owner: await getOwner(gk),
    dk: await getDK(gk),
  })

  let i = 1;

  while (i <= 16) {

    let addr = await getBook(gk, i);
    
    let owner = i == 12 || nameOfBooks[i] == 'Blank' || addr == AddrZero
        ? AddrZero
        : await getOwner(addr);
        
    let dk = i == 12 || nameOfBooks[i] == 'Blank' || addr == AddrZero
        ? AddrZero
        : await getDK(addr);
     
    let item: BookInfo = {
      title: i,
      addr: addr,
      owner: owner,
      dk: dk,    
    };

    books.push(item);

    i++;
  };

  return books;  
}


export async function getKeepers(gk: HexType):Promise<BookInfo[]>{
  let books: BookInfo[] = [];

  books.push({
    title: 0,
    addr: gk,
    owner: await getOwner(gk),
    dk: await getDK(gk),
  })

  let i = 1;
  while (i <= 16) {

    let addr = await getKeeper(gk, i);
    let owner = titleOfKeepers[i] == 'Blank' || addr == AddrZero
      ? AddrZero
      : await getOwner(addr);

    let dk = titleOfKeepers[i] == 'Blank' || addr == AddrZero
      ? AddrZero
      : await getDK(addr);
 
    let item: BookInfo = {
      title: i,
      addr: addr,
      owner: owner,
      dk: dk,    
    }

    books.push(item);

    i++;
  }

  return books;  
}

export async function getSHA(gk: HexType):Promise<HexType>{
  return await readContract({
    address: gk,
    abi: baseKeeperABI,
    functionName: 'getSHA'
  });
}

export interface CompInfo {
  regNum: number;
  regDate: number;
  typeOfEntity: number;
  currency: number;
  state: number;
  symbol: string;
  name: string;
}

export async function getCompInfo(gk: HexType):Promise<CompInfo>{

  let res = await readContract({
    address: gk,
    abi: baseKeeperABI,
    functionName: 'getCompInfo',
  })

  let info:CompInfo = {
    regNum: res.regNum,
    regDate: res.regDate,
    typeOfEntity: res?.typeOfEntity ?? 4,
    currency: res.currency,
    symbol: toStr(res.symbol),
    name: res.name,
    state: res.state,
  }

  return info;
}

