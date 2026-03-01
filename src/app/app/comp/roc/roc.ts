import { readContract } from "@wagmi/core";
import { HexType } from "../../common";
import { registerOfConstitutionABI } from "../../../../../generated";


export async function getSha(boc: HexType): Promise<HexType> {
  let sha = readContract({
    address: boc,
    abi: registerOfConstitutionABI,
    functionName: "pointer",
  });

  return sha;
} 



