import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { HexType } from '../../app/common';

export type DealLog = {
  seq: number,
  blockNumber: string,
  timestamp: number,
  fromSn: HexType,
  toSn: HexType,
  qtySn: HexType,
  consideration: string,
}

export async function getDealLogsByMonth(gk: HexType, coinType:string, month:string): Promise<DealLog[] | undefined> {

  // 获取特定文档
  const docRef = doc(db, gk.toLowerCase(), 'dealLogs', coinType, month);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    let res = docSnap.data()?.records as DealLog[];
    return res;
  } else {
    console.log("no financial data found!");
    return undefined;
  }
}

export async function getDealLogs(gk: HexType, coinType: string): Promise<DealLog[] | undefined> {
  let output: DealLog[] = [];

  try {
    const monthCollRef = collection(db, gk.toLowerCase(), 'dealLogs', coinType);
    const monthDocsSnap = await getDocs(monthCollRef);

    if (monthDocsSnap.empty) {
      console.log('No month data exists');
      return undefined;
    }

    const months = monthDocsSnap.docs.map(coll => coll.id).sort();

    // Use `for...of` to ensure proper async handling in loops
    for (const month of months) {
      const queryData = await getDealLogsByMonth(gk, coinType, month);

      if (queryData && queryData.length > 0) {
        output = output.concat(queryData);
      }
    }

    return output.length > 0 ? output : undefined;

  } catch (error) {
    console.error("Error fetching financial data: ", error);
    return undefined;
  }
}

export async function setDealLogsByMonth(gk: HexType, coinType:string, month:string, data:DealLog[]): Promise<boolean> {

  // 创建一个文档引用
  const docRef = doc(db, gk.toLowerCase(), 'dealLogs', coinType, month);

  try {

    let prevData = await getDealLogsByMonth(gk, coinType, month);

    if (prevData && prevData.length > 0) {
      if (prevData[prevData.length - 1].blockNumber < data[0].blockNumber) {
          data = prevData.concat(data);
      } else {
          return true;
      }
    }

    await setDoc(docRef, {records: data});
    console.log('successfully setDealLogs');
    
    return true;
  } catch (error: any) {
    console.error("Error set deal logs data: ", error);
    return false;
  }

}

export function getMonthLableByTimestamp(stamp:number):string {
  const date = new Date(Number(stamp) * 1000);  // Convert the timestamp to Date
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');  // Months are 0-based in JS

  const key = `${year}-${month}`;  // e.g., '2023-09' 
  return key; 
}

export async function setDealLogs(gk: HexType, coinType:string, data:DealLog[]): Promise<boolean> {

  if (!data || data.length === 0) {
    console.log("No cashflow data to process.");
    return false;
  }

  // Group the data by year and month
  const groupedByMonth:{[key:string]:DealLog[]} = {};

  data.forEach(v => {
    const key = getMonthLableByTimestamp(v.timestamp);

    if (!groupedByMonth[key]) {
      groupedByMonth[key] = [];
    }

    groupedByMonth[key].push(v);
  });

  console.log('Deal Logs groupedByMonth: ', groupedByMonth);

  // Array to store all Firestore write operations
  const promises: Promise<boolean>[] = [];

  // Store each grouped array in Firestore
  for (const key in groupedByMonth) {
    if (Object.hasOwnProperty.call(groupedByMonth, key)) {

      const dataForMonth = groupedByMonth[key];
      // console.log('key', key);
      // console.log('dataForMonth: ', dataForMonth);

      promises.push(setDealLogsByMonth(gk, coinType, key, dataForMonth));

    }
  }

  // Wait for all the setFinDataByMonth calls to complete
  const results = await Promise.all(promises);

  // Check if all operations were successful
  return results.every(result => result === true);
}
