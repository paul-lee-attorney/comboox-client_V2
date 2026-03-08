import { readContract } from "@wagmi/core";
import { HexType } from "../../common";
import { iRegisterOfConstitutionABI } from "../../../../../generated";


export async function getSha(boc: HexType): Promise<HexType> {
  let sha = readContract({
    address: boc,
    abi: iRegisterOfConstitutionABI,
    functionName: "pointer",
  });

  return sha;
} 



