import { readContract } from "@wagmi/core";
import { AddrOfTank, HexType } from "../common";
import { fuelTankABI } from "../../../../generated";



export async function rate():Promise<bigint> {

  let res = await readContract({
    address: AddrOfTank,
    abi: fuelTankABI,
    functionName: 'rate',
  })

  return res;
}

export async function sum():Promise<bigint> {

  let res = await readContract({
    address: AddrOfTank,
    abi: fuelTankABI,
    functionName: 'sum',
  })

  return res;
}

export async function getOwner():Promise<HexType> {

  let res = await readContract({
    address: AddrOfTank,
    abi: fuelTankABI,
    functionName: 'getOwner',
  })

  return res;
}

export async function getRegCenter():Promise<HexType> {

  let res = await readContract({
    address: AddrOfTank,
    abi: fuelTankABI,
    functionName: 'getRegCenter',
  })

  return res;
}

