import { readContract } from "@wagmi/core";
import { antiDilutionABI } from "../../../../../../../../../generated";
import { HexType } from "../../../../../../common";
import { bigIntToNum, longDataParser, longSnParser, strNumToBigInt } from "../../../../../../common/toolsKit";
import { Deal } from "../../../../../roa/ia/ia";

export interface BenchmarkType {
  classOfShare: string,
  floorPrice: string,
  obligors: string,
}

export async function isMarked(addr: HexType, classOfShare: number): Promise<boolean>{
  let res = await readContract({
    address: addr,
    abi: antiDilutionABI,
    functionName: 'isMarked',
    args: [ BigInt(classOfShare)],
  })

  return res;
}

export async function getClasses(addr: HexType): Promise<readonly bigint[]>{
  let res = await readContract({
    address: addr,
    abi: antiDilutionABI,
    functionName: 'getClasses',
  })

  return res;
}

export async function getFloorPriceOfClass(addr: HexType, classOfShare: number): Promise<number>{
  
  let res = await readContract({
    address: addr,
    abi: antiDilutionABI,
    functionName: 'getFloorPriceOfClass',
    args: [ BigInt(classOfShare) ],
  })

  return res;
}

export async function getObligorsOfAD(addr: HexType, classOfShare: number): Promise<readonly bigint[]>{
  
  let res = await readContract({
    address: addr,
    abi: antiDilutionABI,
    functionName: 'getObligorsOfAD',
    args: [ BigInt(classOfShare) ],
  })

  return res;
}

export async function isObligor(addr: HexType, classOfShare: number, acct: number): Promise<boolean>{
  
  let res = await readContract({
    address: addr,
    abi: antiDilutionABI,
    functionName: 'isObligor',
    args: [ BigInt(classOfShare), BigInt(acct) ],
  })

  return res;
}

export async function getGiftPaid(addr: HexType, ia: HexType, seqOfDeal: number, seqOfShare: number): Promise<bigint>{
  
  let res = await readContract({
    address: addr,
    abi: antiDilutionABI,
    functionName: 'getGiftPaid',
    args: [ ia, BigInt(seqOfDeal), BigInt(seqOfShare) ],
  })

  return res;
}

export async function isTriggered(addr: HexType, deal: Deal, seqOfShare: number): Promise<boolean>{
  
  let res = await readContract({
    address: addr,
    abi: antiDilutionABI,
    functionName: 'isTriggered',
    args: [ deal, BigInt(seqOfShare) ],
  })

  return res;
}

export async function getBenchmarks(addr: HexType): Promise<BenchmarkType[]> {

  let classes = await getClasses(addr);

  let len = classes.length;
  let output: BenchmarkType[] = [];

  while (len > 0) {

    let classOfShare = Number(classes[len - 1]);

    let floorPrice = await getFloorPriceOfClass(addr, classOfShare);

    let obligors = await getObligorsOfAD(addr, classOfShare)
    
    let strObligors = '';

    obligors.map(v => {
      strObligors += longSnParser(v.toString()) + `\n`;
    });

    let item: BenchmarkType = {
      classOfShare: classOfShare.toString(),
      floorPrice: bigIntToNum(BigInt(floorPrice), 4),
      obligors: strObligors,
    }

    output.push(item);

    len--;
  }

  return output;
}
