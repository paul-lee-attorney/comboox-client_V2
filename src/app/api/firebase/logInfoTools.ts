import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { HexType } from '../../app/common';
import { Log } from 'viem';


export interface FirebaseLog extends Omit<Log, 'args' | 'blockNumber'> {
  blockNumber: string;
  args?: string; // 确保没有 args 字段
}

export async function getLogsTopBlk(addr: HexType, nameOfEvent:string): Promise<bigint | undefined> {

  // 获取特定文档
  const docRef = doc(db, 'logInfo', addr.toLowerCase(), nameOfEvent, 'topBlk');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    let res = docSnap.data();
    return BigInt(res.blockNumber);
  } else {
    console.log("no log data found!");
    return undefined;
  }

}

export async function getLogsByTenMillion(addr: HexType, nameOfEvent:string, tenM:string): Promise<FirebaseLog[] | undefined> {

  // 获取特定文档
  const docRef = doc(db, 'logInfo', addr.toLowerCase(), nameOfEvent, tenM);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    let res = docSnap.data()?.logs as FirebaseLog[];
    return res;
  } else {
    console.log("no log data found!");
    return undefined;
  }
}

export async function getLogs(addr: HexType, nameOfEvent: string): Promise<FirebaseLog[] | undefined> {
  let output: FirebaseLog[] = [];

  try {
    const monthCollRef = collection(db, 'logInfo', addr.toLowerCase(), nameOfEvent);
    const monthDocsSnap = await getDocs(monthCollRef);

    if (monthDocsSnap.empty) {
      console.log('No month data exists');
      return undefined;
    }

    const months = monthDocsSnap.docs.map(coll => coll.id).sort();

    // Use `for...of` to ensure proper async handling in loops
    for (const month of months) {
      if (month == 'topBlk') continue;

      const queryData = await getLogsByTenMillion(addr, nameOfEvent, month);

      if (queryData && queryData.length > 0) {
        output = output.concat(queryData);
      }
    }

    return output.length > 0 ? output : undefined;

  } catch (error) {
    console.error("Error fetching log data: ", error);
    return undefined;
  }
}

export async function setLogsTopBlk(addr: HexType, nameOfEvent:string, blkNum:bigint): Promise<boolean> {

  // 创建一个文档引用
  const docRef = doc(db, 'logInfo', addr.toLowerCase(), nameOfEvent, 'topBlk');

  try {
    await setDoc(docRef, {blockNumber: blkNum.toString()});
    return true;
  } catch (error: any) {
    console.error("Error set financial data: ", error);
    return false;
  }

}

export async function setLogsByTenMillion(addr: HexType, nameOfEvent:string, tenM:string, data:FirebaseLog[]): Promise<boolean> {

  // 创建一个文档引用
  const docRef = doc(db, 'logInfo', addr.toLowerCase(), nameOfEvent, tenM);

  try {

    let prevData = await getLogsByTenMillion(addr, nameOfEvent, tenM);

    if (prevData && prevData.length > 0) {
      if (prevData[prevData.length - 1].blockNumber < data[0].blockNumber) {
          data = prevData.concat(data);
      } else {
          return true;
      }
    }

    await setDoc(docRef, {logs: data});
    
    return true;
  } catch (error: any) {
    console.error("Error set logs data: ", error);
    return false;
  }

}

export function getTenMillionLableByBlkNum(blkNum:string):string {
  return (BigInt(blkNum)/10n ** 7n).toString(); 
}

export async function setLogs(addr: HexType, nameOfEvent:string, data:FirebaseLog[]): Promise<boolean> {

  if (!data || data.length === 0) {
    console.log("No logs data to process.");
    return false;
  }

  // Group the data by blockNumber
  const groupedByBlockNumber:{[key:string]:FirebaseLog[]} = {};

  data.forEach(v => {
    const key = getTenMillionLableByBlkNum(v.blockNumber);

    if (!groupedByBlockNumber[key]) {
      groupedByBlockNumber[key] = [];
    }

    groupedByBlockNumber[key].push(v);
  });

  console.log('groupedByBlockNumber: ', groupedByBlockNumber);

  // Array to store all Firestore write operations
  const promises: Promise<boolean>[] = [];

  // Store each grouped array in Firestore
  for (const key in groupedByBlockNumber) {
    if (Object.hasOwnProperty.call(groupedByBlockNumber, key)) {

      const dataForTenMillion = groupedByBlockNumber[key];

      promises.push(setLogsByTenMillion(addr, nameOfEvent, key, dataForTenMillion));

    }
  }

  // Wait for all the setFinDataByMonth calls to complete
  const results = await Promise.all(promises);

  // Check if all operations were successful
  return results.every(result => result === true);
}
