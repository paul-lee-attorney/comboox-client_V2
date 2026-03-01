import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { HexType } from '../../app/common';
import { Cashflow } from '../../app/compV1/components/FinStatement';
import { HexParser } from '../../app/common/toolsKit';


export type CashflowStrProps = {
  seq: string,
  blockNumber: string,
  timestamp: string,
  transactionHash: string,
  typeOfIncome: string,
  amt: string,
  usd: string,
  ethPrice: string,
  addr: string,
  acct: string,
  input: string,
  api: string,
  target: string,
  typeOfDoc: string,
  version: string,
}

export function cashflowDataToString(input:Cashflow[]): CashflowStrProps[] {
  let output = input.map(v=>({
    seq: v.seq.toString(),
    blockNumber: v.blockNumber.toString(),
    timestamp: v.timestamp.toString(),
    transactionHash: v.transactionHash.toLowerCase(),
    typeOfIncome: v.typeOfIncome,
    amt: v.amt.toString(),
    usd: v.usd.toString(),
    ethPrice: v.ethPrice.toString(),
    addr: v.addr.toLowerCase(),
    acct: v.acct.toString(),
    input: v.input,
    api: v.api,
    target: v.target.toLowerCase(),
    typeOfDoc: v.typeOfDoc.toString(),
    version: v.version.toString(),
  }));

  return output;
}

export function cashflowStringToData(input:CashflowStrProps[]): Cashflow[] {
  let output = input.map(v=>({
    seq: Number(v.seq),
    blockNumber: BigInt(v.blockNumber),
    timestamp: Number(v.timestamp),
    transactionHash: HexParser(v.transactionHash),
    typeOfIncome: v.typeOfIncome,
    amt: BigInt(v.amt),
    usd: BigInt(v.usd),
    ethPrice: BigInt(v.ethPrice),
    addr: HexParser(v.addr),
    acct: BigInt(v.acct),
    input: HexParser(v.input),
    api: v.api,
    target: HexParser(v.target),
    typeOfDoc: Number(v.typeOfDoc),
    version: Number(v.version),
  }));

  return output;
}

// export async function getFinDataTopBlk(gk: HexType, typeOfInfo:string): Promise<bigint | undefined> {

//   // 获取特定文档
//   const docRef = doc(db, gk.toLowerCase(), 'finInfo', typeOfInfo, 'topBlk');
//   const docSnap = await getDoc(docRef);

//   if (docSnap.exists()) {
//     let res = docSnap.data();
//     return BigInt(res.blockNumber);
//   } else {
//     console.log("no financial data found!");
//     return undefined;
//   }

// }

export async function getFinDataByMonth(gk: HexType, typeOfInfo:string, month:string): Promise<Cashflow[] | undefined> {

  // 获取特定文档
  const docRef = doc(db, gk.toLowerCase(), 'finInfo', typeOfInfo, month);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    let res = docSnap.data()?.records as CashflowStrProps[];
    return cashflowStringToData(res);
  } else {
    console.log("no financial data found!");
    return undefined;
  }
}

export async function getFinData(gk: HexType, typeOfInfo: string): Promise<Cashflow[] | undefined> {
  let output: Cashflow[] = [];

  try {
    const monthCollRef = collection(db, gk.toLowerCase(), 'finInfo', typeOfInfo);
    const monthDocsSnap = await getDocs(monthCollRef);

    if (monthDocsSnap.empty) {
      console.log('No month data exists');
      return undefined;
    }

    const months = monthDocsSnap.docs.map(coll => coll.id).sort();

    // Use `for...of` to ensure proper async handling in loops
    for (const month of months) {
      if (month == 'topBlk') continue;

      const queryData = await getFinDataByMonth(gk, typeOfInfo, month);

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

// export async function setFinDataTopBlk(gk: HexType, typeOfInfo:string, blkNum:bigint): Promise<boolean> {

//   // 创建一个文档引用
//   const docRef = doc(db, gk.toLowerCase(), 'finInfo', typeOfInfo, 'topBlk');

//   try {
//     await setDoc(docRef, {blockNumber: blkNum.toString()});
//     return true;
//   } catch (error: any) {
//     console.error("Error set financial data: ", error);
//     return false;
//   }

// }

const mergeAndSort = (a: Cashflow[], b: Cashflow[]): Cashflow[] => {
  const mergedMap = new Map<string, Cashflow>();
  [...a, ...b].forEach(item => {
    mergedMap.set(item.transactionHash.toLowerCase(), item);
  });

  return Array.from(mergedMap.values()).sort((x, y) => {
    if (x.blockNumber > y.blockNumber) return 1;
    if (x.blockNumber < y.blockNumber) return -1;
    return Number(x.amt) - Number(y.amt);
  });
}

export async function setFinDataByMonth(gk: HexType, typeOfInfo:string, month:string, data:Cashflow[]): Promise<boolean> {

  // 创建一个文档引用
  const docRef = doc(db, gk.toLowerCase(), 'finInfo', typeOfInfo, month);

  try {

    let prevData = await getFinDataByMonth(gk, typeOfInfo, month);

    if (prevData && prevData.length > 0) {
      data = mergeAndSort(prevData, data);
    }

    await setDoc(docRef, {records: cashflowDataToString(data)});
    // console.log('successfully setDoc');
    
    return true;
  } catch (error: any) {
    console.error("Error set financial data: ", error);
    return false;
  }

}

export async function updateRoyaltyByItem(gk: HexType, month:string, item:Cashflow): Promise<boolean> {

  // 创建一个文档引用
  const docRef = doc(db, gk.toLowerCase(), 'finInfo', 'cbpInflow', month);

  try {

    let list = await getFinDataByMonth(gk, 'cbpInflow', month);

    if (list && list.length > 0) {

      let i = list.findIndex(v => (
        v.transactionHash == item.transactionHash &&
        v.typeOfIncome == 'Royalty' &&
        v.amt == item.amt &&
        v.addr == item.addr
      ));

      if (i > 0) {
        list[i] = item;
      } else {
        return false;
      }

    } else {
      return false;
    }

    await setDoc(docRef, {records: cashflowDataToString(list)});
    // console.log('successfully updateRoyaltyByItem');
    
    return true;

  } catch (error: any) {
    console.error("Error setRoyaltyByItem:", error);
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

export async function setFinData(gk: HexType, typeOfInfo:string, data:Cashflow[]): Promise<boolean> {

  if (!data || data.length === 0) {
    console.log("No cashflow data to process.");
    return false;
  }

  // Group the data by year and month
  const groupedByMonth:{[key:string]:Cashflow[]} = {};

  data.forEach(v => {
    const key = getMonthLableByTimestamp(v.timestamp);

    if (!groupedByMonth[key]) {
      groupedByMonth[key] = [];
    }

    groupedByMonth[key].push(v);
  });

  console.log('groupedByMonth: ', groupedByMonth);

  // Array to store all Firestore write operations
  const promises: Promise<boolean>[] = [];

  // Store each grouped array in Firestore
  for (const key in groupedByMonth) {
    if (Object.hasOwnProperty.call(groupedByMonth, key)) {

      const dataForMonth = groupedByMonth[key];
      // console.log('key', key);
      // console.log('dataForMonth: ', dataForMonth);

      promises.push(setFinDataByMonth(gk, typeOfInfo, key, dataForMonth));

    }
  }

  // Wait for all the setFinDataByMonth calls to complete
  const results = await Promise.all(promises);

  // Check if all operations were successful
  return results.every(result => result === true);
}
