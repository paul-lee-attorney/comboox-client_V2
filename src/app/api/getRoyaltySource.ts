import { AddrOfRegCenter, AddrZero, Bytes32Zero, HexType } from "../app/common";
import { HexParser } from "../app/common/toolsKit";
import { getHeadByBody } from "../app/rc";
import { iGeneralKeeperABI } from "../../../generated";
import { ethers } from "ethers";
import { getNetwork } from "@wagmi/core";

export interface RoyaltySource {
  input: HexType,
  api: string,
  target: HexType,
  typeOfDoc: number,
  version: number,
};

export function getFuncNameByPayload(payload:HexType):string {

  const iface = new ethers.Interface(iGeneralKeeperABI);

  let res = "";

  try {
    const parsed = iface.parseTransaction({data: payload});
    // console.log('func name:', parsed?.name);
    if (parsed?.name) res = parsed.name;
  } catch(err:any) {
    console.log('failed to parse payload:', err.message);
  }
  // console.log('res of funcName: ', res);
  return res;
}

// Main function to fetch and parse transaction trace
export async function getRoyaltySource(txHash:HexType): Promise<RoyaltySource> {

  const fetch = (await import("node-fetch")).default;

  const network = getNetwork();

  const url = network.chain?.id == 42161
            ? `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
            : `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}` ;

  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "debug_traceTransaction",
    params: [txHash, {
      tracer: "callTracer"
    }]
  };

  let rs:RoyaltySource = {
    input: Bytes32Zero,
    api: '',
    target: AddrZero,
    typeOfDoc: 0,
    version: 0,
  };

  try {
    // Fetch debug_traceTransaction result
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    type Call = {
      from: string,
      gas: string,
      gasUsed: string,
      to: string,
      input: string,
      calls: Call[],
      value: string,
      type: string,
    };

    const data = await response.json();
    // console.log('data:', data, '\n');
    const calls:Call[] = data.result.calls[0].calls[0].calls[0].calls;
    // console.log('calls: ', calls, '\n');

    let len = calls.length;
    for (let i=0; i<len; i++) {
      const v = calls[i];
      if (v.to == AddrOfRegCenter.toLowerCase() && v.input.substring(0, 10) == "0xdf1a1490") {
        rs.input = HexParser(data.result.input);
        rs.target = HexParser(v.from);
        break;
      }
    }

  } catch (error:any) {
    console.error("Error fetching or parsing trace:", error.message);
  }

  if (rs.target != AddrZero) {
    const head = await getHeadByBody(rs.target);
    rs.typeOfDoc = head.typeOfDoc;
    rs.version = head.version;

    rs.api = getFuncNameByPayload(rs.input);
  }

  // console.log('rs: ', rs, '\n');

  return rs;
}
