
import { parseAbiItem, decodeEventLog, Log, Hex } from "viem";
import { HexType } from ".";
import { delay } from "./toolsKit";
import { PublicClient } from "wagmi";
import { getLogsTopBlk, setLogs, setLogsTopBlk, getLogs, FirebaseLog } from "../../api/firebase/logInfoTools";


interface FetchLogsParams {
  address: HexType;
  eventAbiString: string;
  args?: Record<string, any>;
  fromBlkNum: bigint;
  toBlkNum: bigint;
  client: PublicClient;
};

// 转换函数（BigInt → String + 保留原始 data）
const convertForFirebase = (log: Log) => ({
  ...log,
  blockNumber: log.blockNumber?.toString() ?? '0',
  // args 字段变为空字符串.
  args: '',
});

const decodeFirebaseLog = (
  log: FirebaseLog,
  eventAbiString:string,
) => {

  const eventFilter = parseAbiItem(eventAbiString);

  if (eventFilter.type !== "event") {
    throw new Error("Provided ABI is not an event.");
  }

  try {
    const { eventName, args } = decodeEventLog({
      abi: [eventFilter],
      data: log.data,
      topics: log.topics as [Hex, ...Hex[]]
    })
    
    return {
      ...log,
      eventName,
      blockNumber: BigInt(log.blockNumber),
      args: args as Record<string, unknown>,
    }
  } catch (error) {
    console.error('Log decoding failed:', {
      blockNumber: log.blockNumber,
      data: log.data,
      error
    })
    return null
  }
}

export const fetchLogs = async ({
  address,
  eventAbiString,
  args = {},
  fromBlkNum,
  toBlkNum,
  client,
}:FetchLogsParams): Promise<any[]> => {
  
  let allLogs:any[] = [];
  let currentBlk = fromBlkNum;
  
  const eventFilter = parseAbiItem(eventAbiString);

  if (eventFilter.type !== "event") {
    throw new Error("Provided ABI is not an event.");
  }

  let topBlk = await getLogsTopBlk(address, eventFilter.name);
  let cnt = 0;

  if (topBlk && topBlk <= toBlkNum) {

    let logs = await getLogs(address, eventFilter.name);

    if (logs && logs.length >0) {
      console.log("obtained logs from firebase:", logs.length);

      const decodedFirebaseLogs = logs.map((firebaseLog) => 
        decodeFirebaseLog(firebaseLog, eventAbiString)
      );

      allLogs = [...allLogs, ...decodedFirebaseLogs];
    }
    currentBlk = topBlk + 1n;
  
  }

  while (currentBlk <= toBlkNum) {

    const endBlk = currentBlk + 499n > toBlkNum ? toBlkNum : currentBlk + 499n;
    let retries = 0;
    let success = false;

    while (!success && retries < 10) {
      try {
        const logs = await client.getLogs({
          address,
          event: eventFilter,
          args,
          fromBlock: currentBlk,
          toBlock: endBlk,
        });

        if (logs && logs.length > 0) {
          console.log('obtained logs from chain:', logs);

          const firebaseLogs = logs.map(convertForFirebase);

          setLogs(address, eventFilter.name, firebaseLogs);
          allLogs = [...allLogs, ...logs];
        } 

        currentBlk = endBlk + 1n;
        success = true;
        cnt++;

        // if (cnt % 1200 == 0 || endBlk == toBlkNum) {
        //   setLogsTopBlk(address, eventFilter.name, endBlk);
        // }
        
        await delay(500);

      } catch (error:any) {
        if (retries < 10) {
          console.warn(`Rate limited. Retrying in 500 ms...`);
          await delay((retries + 1) * 500);
          retries++;
          continue;
        } else {
          throw new Error(`Failed after ${retries} retries: ${error.message}`);
        }
      }
    }

    if (!success) {
      throw new Error(`Block range ${currentBlk}-${endBlk} failed after ${10} retries`);
    }    

  }

  return allLogs;
};


