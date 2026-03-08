import { readContract } from "@wagmi/core";
import { AddrOfRegCenter, HexType } from "../common";
import { usdFuelTankABI, regCenterABI } from "../../../../generated";

import { getTypeByName } from "../common/toolsKit";

export async function getFuelTankAddr(): Promise<HexType> {

  const typeOfTank = getTypeByName('UsdFuelTank');

  const version = await readContract({
     address: AddrOfRegCenter,
     abi: regCenterABI,
     functionName: 'counterOfVersions',
     args: [typeOfTank]
   })

  const seqOfTank = await readContract({
     address: AddrOfRegCenter,
     abi: regCenterABI,
     functionName: 'counterOfDocs',
     args: [typeOfTank, BigInt(version)]
   })

  let res = await readContract({
     address: AddrOfRegCenter,
     abi: regCenterABI,
     functionName: 'getDoc',
     args: [typeOfTank, BigInt(version), seqOfTank]
   })
 
   return res.body; 
}

export async function rate():Promise<bigint> {

  let res = await readContract({
    address: await getFuelTankAddr(),
    abi: usdFuelTankABI,
    functionName: 'rate',
  })

  return res;
}

export async function sum():Promise<bigint> {

  let res = await readContract({
    address: await getFuelTankAddr(),
    abi: usdFuelTankABI,
    functionName: 'sum',
  })

  return res;
}

export async function cashier():Promise<HexType> {

  let res = await readContract({
    address: await getFuelTankAddr(),
    abi: usdFuelTankABI,
    functionName: 'cashier',
  })

  return res;
}



