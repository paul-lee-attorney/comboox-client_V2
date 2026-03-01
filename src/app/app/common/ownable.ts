import { readContract } from "@wagmi/core";
import { ownableABI } from "../../../../generated";
import { HexType } from ".";


export async function getOwner(addr: HexType): Promise<HexType> {
  let owner = await readContract({
    address: addr,
    abi: ownableABI,
    functionName: 'getOwner',
  });

  return owner;
}

export async function getRegCenter(addr: HexType): Promise<HexType> {
  let res = await readContract({
    address: addr,
    abi: ownableABI,
    functionName: 'getRegCenter',
  });

  return res;
}
