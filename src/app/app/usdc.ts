import { readContract } from "@wagmi/core";
import { iusdcABI } from "../../../generated";
import { AddrOfUSDC, HexType } from "./common";


export async function balanceOfUsd(addr:HexType): Promise<bigint>{

    let res = await readContract({
        address: AddrOfUSDC,
        abi: iusdcABI,
        functionName: 'balanceOf',
        args: [addr],
    })

    return res;
}



