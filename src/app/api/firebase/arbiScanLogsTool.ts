import { collection, doc, getDoc, getDocs, setDoc, updateDoc} from 'firebase/firestore';
import fetch from 'node-fetch';
import { decodeEventLog, Hex, keccak256, Log, parseAbiItem, toHex} from 'viem';
import { db } from './firebase';
import { delay, HexParser } from '../../app/common/toolsKit';

export interface ArbiscanLog extends Omit<Log, 'blockNumber'|'logIndex'|'transactionIndex'> {
  timeStamp: string;          // 时间戳的十六进制表示
  gasPrice: string;           // Gas价格的十六进制值
  gasUsed: string;            // 消耗Gas的十六进制值
  blockNumber: string;        // 区块高度的十六进制表示
  logIndex: string;           // 日志索引的十六进制位置
  transactionIndex: string;   // 交易索引的十六进制位置
}

interface ArbiscanData {
    status: string,
    message: string,
    result: ArbiscanLog[],
}

// ===== Get Arbiscan Logs ====

export async function fetchArbiscanData(
    chainId: number,
    address:Hex,
    fromBlock:bigint, 
    toBlock:bigint,
): Promise<ArbiscanData | undefined>  {

    const url = `https://api.etherscan.io/v2/api?chainid=${chainId}&`;
  
    const api = url + 
        `module=logs&` + 
        `action=getLogs&` +
        `address=${address}&` +
        `fromBlock=${fromBlock.toString()}&` +
        `toBlock=${toBlock.toString()}&` +
        // `topic0=${topic0}&` +
        `apikey=${process.env.NEXT_PUBLIC_ARBISCAN_API_KEY}`;

  const response = await fetch(api);
  
  if (!response.ok) {
      throw new Error(`Error fetching Logs: ${response.statusText}`);
  }

  return response.json();
}

// ==== Get & Set with DB ====

// ==== TopBlk and Menue of Logs ====

export async function getTopBlkOf(
    gk:Hex, address:string,
): Promise<bigint> {

    const docRef = doc(db, gk.toLowerCase(), 'topBlkOf');

    try {
        const docSnap = await getDoc(docRef);
        const records = {...docSnap.data()} as Record<string, string>;

        let top = records[address];
        if (!top) top = '1';
        console.log(`get topBlkOf ${address}:`, top);

        return BigInt(top);
    } catch (error) {
        console.error(`Error fetching TopBlkOf ${address}:`, error);
        return 1n;
    }

}

export async function setTopBlkOf(
    gk:Hex, address:string, blkNum:bigint,
): Promise<boolean> {

  const docRef = doc(db, gk.toLowerCase(), 'topBlkOf');

  try {
    const docSnap = await getDoc(docRef);

    // 初始化records对象，如果文档不存在则创建空对象
    const records = docSnap.exists() ? {...docSnap.data()} as Record<string, string> : {};
    
    // 无论address是否存在，直接更新或添加该地址的区块号
    const newBlkNum = blkNum.toString();
    records[address] = newBlkNum;

    await setDoc(docRef, records);
    console.log(`updated topBlkOf ${address}:`, newBlkNum);

    return true;
  } catch (error: any) {
    console.error(`Error set topBlkOf ${address}:`, error);
    return false;
  }

}

// ---- Menu ----

interface EventInfo {
    title: string,
    address: Hex,
    name: string[],
    abiStr: string[],
}

export async function getMenuOfLogs(
    gk:Hex
): Promise<EventInfo[] | undefined> {
    const docRef = doc(db, gk.toLowerCase(), 'menuOfLogs');

    try {
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // 不存在则创建一个空的 menuOfLogs
          await setDoc(docRef, { list: [] });
          return [];
        }

        let out = docSnap.data()?.list as EventInfo[];
        return out.map(v => ({...v, address: HexParser(v.address)}));
    } catch (error) {
        console.error("Error fetching financial data: ", error);
        return undefined;
    }
}

export async function upsertMenuOfLogs(
    gk: Hex,
    title: string,
    address: Hex,
    name: string,
    abiStr: string
): Promise<void> {
    const docRef = doc(db, gk.toLowerCase(), "menuOfLogs");

    try {
        const docSnap = await getDoc(docRef);

        let list: EventInfo[] = [];

        if (docSnap.exists()) {
            list = docSnap.data()?.list || [];
        }

        // 查找是否存在相同 title + address 的 EventInfo
        let eventInfo = list.find(
            (v) => v.title === title && v.address.toLowerCase() === address.toLowerCase()
        );

        if (!eventInfo) {
            // 不存在则新建
            eventInfo = {
                title,
                address,
                name: [name],
                abiStr: [abiStr],
            };
            list.push(eventInfo);
        } else {
            // 已存在，检查 name
            const idx = eventInfo.name.findIndex((n) => n === name);
            if (idx >= 0) {
                // name 已存在 → 更新对应 abiStr
                eventInfo.abiStr[idx] = abiStr;
            } else {
                // name 不存在 → 新增
                eventInfo.name.push(name);
                eventInfo.abiStr.push(abiStr);
            }
        }

        // 更新或创建文档
        if (docSnap.exists()) {
            await updateDoc(docRef, { list });
        } else {
            await setDoc(docRef, { list });
        }

    } catch (error) {
        console.error("Error updating menuOfLogs: ", error);
    }
}

// ==== Contents of Logs ====

export async function getLogsByMillion(
  gk:Hex, titleOfSM:string, address:Hex, name:string, million:string
): Promise<ArbiscanLog[] | undefined> {

    const docRef = doc(db, gk.toLowerCase(), 'logInfo', titleOfSM, address.toLowerCase(), name, million);
    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data()?.records as ArbiscanLog[];
        } else {
            console.log("no Logs found!");
            return undefined;
        }
    } catch (error) {
        console.error("Error fetching financial data: ", error);
        return undefined;   
    }

}

export async function getAllLogs(
    gk:Hex, titleOfSM:string, address:Hex, name:string,
): Promise<ArbiscanLog[] | undefined> {
  let output: ArbiscanLog[] = [];

  try {
    const millionCollRef = collection(db, gk.toLowerCase(), 'logInfo', titleOfSM, address.toLowerCase(), name);
    const millionDocsSnap = await getDocs(millionCollRef);

    if (millionDocsSnap.empty) {
      console.log('No million data exists');
      return undefined;
    }

    const millions = millionDocsSnap.docs.map(coll => coll.id).sort();

    for (const million of millions) {
      const queryData = await getLogsByMillion(gk, titleOfSM, address, name, million);
      if (queryData && queryData.length > 0) {
        output = output.concat(queryData);
      }
    }

    return output.length > 0 ? output : undefined;

  } catch (error) {
    console.error("Error fetching all logs: ", error);
    return undefined;
  }
}

export async function getNewLogs(
    gk:Hex, titleOfSM:string, address:Hex, name:string, fromBlk:bigint
): Promise<ArbiscanLog[]> {
  let output: ArbiscanLog[] = [];
  let fromMillion = Number(fromBlk / 10n ** 6n); 

  try {
    const millionCollRef = collection(db, gk.toLowerCase(), 'logInfo', titleOfSM, address.toLowerCase(), name);
    const millionDocsSnap = await getDocs(millionCollRef);

    if (millionDocsSnap.empty) {
      console.log('No million data exists');
      return output;
    }

    let millions = millionDocsSnap.docs.map(coll => Number(coll.id)).sort();
    millions = millions.filter(v => v >= fromMillion);

    for (const million of millions) {
      const queryData = await getLogsByMillion(gk, titleOfSM, address, name, million.toString());
      if (queryData && queryData.length > 0) {
        output = output.concat(queryData);
      }
    }
    output = output.length > 0 
      ? output.sort((a,b) => Number(a.blockNumber) - Number(b.blockNumber)).
        filter(v => BigInt(v.blockNumber) >= fromBlk)
      : output;

    return output;

  } catch (error) {
    console.error("Error fetching new logs: ", error);
    return [];
  }
}

// ==== Set ====

const mergeAndSort = (a: ArbiscanLog[], b: ArbiscanLog[]): ArbiscanLog[] => {
  const mergedMap = new Map<string, ArbiscanLog>();
  [...a, ...b].forEach(item => {
    mergedMap.set(item.blockNumber + item.logIndex, item);
  });

  return Array.from(mergedMap.values()).sort((x, y) => {
    if (BigInt(x.blockNumber) > BigInt(y.blockNumber)) return 1;
    if (BigInt(x.blockNumber) < BigInt(y.blockNumber)) return -1;
    return Number(x.logIndex) - Number(y.logIndex);
  });
}

export async function setLogsByMillion(
  gk:Hex, title:string, address:Hex, 
  name:string, million:string, data:ArbiscanLog[],
): Promise<boolean> {

  const docRef = doc(db, gk.toLowerCase(), 'logInfo', title, address.toLowerCase(), name, million);

  try {
    let prevData = await getLogsByMillion(gk, title, address, name, million);
    if (prevData && prevData.length > 0) 
        data = mergeAndSort(prevData, data);

    await setDoc(docRef, {records: data});    
    return true;
  } catch (error: any) {
    console.error("Error set Logs by million: ", error);
    return false;
  }

}

export async function setLogs(
  gk:Hex, title:string, address: Hex, name:string, data:ArbiscanLog[]
): Promise<boolean> {

  if (!data || data.length === 0) {
    console.log("No logs data to process.");
    return false;
  }

  const groupedByMillion:{[key:string]:ArbiscanLog[]} = {};

  data.forEach(v => {
    const key = (BigInt(v.blockNumber) / 10n ** 6n).toString();

    if (!groupedByMillion[key]) {
      groupedByMillion[key] = [];
    }

    groupedByMillion[key].push(v);
  });

  console.log('ArbiscanLogs grouped by Million: ', groupedByMillion);

  const promises: Promise<boolean>[] = [];

  for (const key in groupedByMillion) {
    if (Object.hasOwnProperty.call(groupedByMillion, key)) {
      const dataForMonth = groupedByMillion[key];
      promises.push(setLogsByMillion(gk, title, address, name, key, dataForMonth));
    }
  }

  const results = await Promise.all(promises);

  return results.every(result => result === true);
}

// ==== Auto Update ====

export async function autoUpdateLogs(chainId:number, gk:Hex, toBlk:bigint):Promise<boolean> {

    let menu = await getMenuOfLogs(gk);

    if (!menu) return false;

    let len = menu.length;

    while (len > 0) {
        let info = menu[len-1];

        let fromBlk = await getTopBlkOf(gk, info.address);

        if (fromBlk == 1n || fromBlk >= toBlk) return false;
        else fromBlk++;

        let data = await fetchArbiscanData(chainId, info.address, fromBlk, toBlk);
        
        if (data) {
            let logs = data.result;
            console.log('get logs:', logs);

            if (logs.length > 0) {
                let width = info.name.length;

                while(width > 0) {
                    let name = info.name[width - 1];
                    let topic0 = keccak256(toHex(info.abiStr[width - 1]));
                    
                    let events = logs.filter((v) => {
                        return v.topics[0]?.toLowerCase() == topic0.toLowerCase();
                    });

                    if (events.length > 0) {
                        let flag = await setLogs(gk, info.title, info.address, name, events);   
                        if (flag) console.log('appended', events.length, ' events of ', name);
                        else return false;
                    }

                    width--;
                }
            }

           let flag = await setTopBlkOf(gk, info.address, toBlk);
           if (!flag) return false;
            
        }

        await delay(500);

        len--;
    }

    return true;
}

// ==== Decode Arbiscan Log ====

export function decodeArbiscanLog(log:ArbiscanLog, abiStr:string) {
    const eventAbi = parseAbiItem(abiStr);

    const {eventName, args} = decodeEventLog({
    abi: [eventAbi],
    data: log.data,
    topics: log.topics,
    });

    return {...log, eventName, args};
}


