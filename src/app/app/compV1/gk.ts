import { readContract } from "@wagmi/core";
import { AddrZero, HexType } from "../common";
import { generalKeeperABI } from "../../../../generated-v1";
import { getDK } from "./common/draftControl";
import { toStr } from "../common/toolsKit";
import { getOwner } from "../common/ownable";

export const nameOfBooks = [
  'GK', 'ROC', 'ROD', 'BMM', 'ROM', 'GMM', 
  'ROA', 'ROO', 'ROP', 'ROS', 'LOE', 
  'Cashier', 'USDC', 'LOU'
]

export const titleOfKeepers = [
  'GK', 'RocKeeper', 'RodKeeper', 'BmmKeeper', 'RomKeeper', 'GmmKeeper', 
  'RoaKeeer', 'RooKeeper', 'RopKeeper', 'ShaKeeper', 'LooKeeper',
  'UsdRomKeeper', 'UsdRoaKeeper', 'UsdLooKeeper', 'UsdRooKeeper', 'UsdKeeper',
  'UsdFuelTank'
]

export async function getKeeper(addr: HexType, title: number):Promise<HexType> {
  let keeper: HexType = await readContract({
    address: addr,
    abi: generalKeeperABI,
    functionName: 'getKeeper',
    args: [BigInt(title)]
  })

  return keeper;
}

export async function getBook(addr: HexType, title: number):Promise<HexType> {
  let keeper: HexType = await readContract({
    address: addr,
    abi: generalKeeperABI,
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

export async function getV1Boox(gk: HexType): Promise<BookInfo[]>{
  let books: BookInfo[] = [];

  books.push({
    title: 0,
    addr: gk,
    owner: await getOwner(gk),
    dk: await getDK(gk),
  })

  let i = 1;
  let addr = await getBook(gk, i);

  while (addr != AddrZero) {
 
    let owner = i == 12
        ? AddrZero
        : await getOwner(addr);
        
    let dk = i == 12
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
    addr = await getBook(gk, i);

  };

  return books;  
}


export async function getV1Keepers(gk: HexType):Promise<BookInfo[]>{
  let books: BookInfo[] = [];

  books.push({
    title: 0,
    addr: gk,
    owner: await getOwner(gk),
    dk: await getDK(gk),
  })

  let i = 1;
  let addr = await getKeeper(gk, i);

  while (addr != AddrZero) {
 
    let owner = await getOwner(addr);
    let dk = AddrZero;
    
    if (i < 16 || i > 16 ) dk = await getDK(addr);
 
    let item: BookInfo = {
      title: i,
      addr: addr,
      owner: owner,
      dk: dk,    
    }

    books.push(item);

    i++;
    addr = await getKeeper(gk, i);
  }

  return books;  
}

export async function getSHA(gk: HexType):Promise<HexType>{
  return await readContract({
    address: gk,
    abi: generalKeeperABI,
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

export async function getOldCompInfo(gk: HexType):Promise<CompInfo>{

  let res = await readContract({
    address: gk,
    abi: generalKeeperABI,
    functionName: 'getCompInfo',
  })

  let info:CompInfo = {
    regNum: res.regNum,
    regDate: res.regDate,
    typeOfEntity: 4,
    currency: res.currency,
    symbol: toStr(res.symbol),
    name: res.name,
    state: res.state,
  }

  return info;
}

export async function getCentPrice(gk: HexType):Promise<bigint>{
  let res = await readContract({
    address: gk,
    abi: generalKeeperABI,
    functionName: 'getCentPrice',
  })

  return res;
}

export async function totalDeposits(gk: HexType, blk?: bigint): Promise<bigint>{
  let res = await readContract({
    address: gk,
    abi: generalKeeperABI,
    functionName: 'totalDeposits',
    blockNumber: blk,
  })

  return res;
}

export async function depositOfMine(gk: HexType, acct: number): Promise<bigint>{
  let res = await readContract({
    address: gk,
    abi: generalKeeperABI,
    functionName: 'depositOfMine',
    args: [ BigInt(acct) ]
  })

  return res;
}