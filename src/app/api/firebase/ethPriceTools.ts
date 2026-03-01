import { db } from "./firebase";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

export type EthPrice = {
  timestamp: number,
  price: number,
}

export async function getEthPrice(yearMonth:string): Promise<EthPrice[] | undefined> {

  const docRef = doc(db, 'ethPrice', yearMonth);

  try {
    // 使用 set 方法添加或覆盖文档
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      let info = docSnap.data();
      if (info.prices.length > 0) return info.prices;
      else return undefined;
    } else return undefined;
    
  } catch (error) {
    console.error("Error getEthPrice:", error);
    throw error;
  }
  
}

export async function setEthPrice(yearMonth:string, data: EthPrice[]) {

  try {
    const docRef = doc(db, 'ethPrice', yearMonth);
    await setDoc(docRef, {prices: data});
    return true;
  } catch (error) {
    console.error("Error setEthPrice", error);
    return false;
  }

}

export async function getLatestMonthEthPrice(): Promise<EthPrice[] | undefined> {

  const colRef = collection(db, 'ethPrice');
  const docsSnap = await getDocs(colRef);

  if (docsSnap.empty) {
    console.log('No monthly Eth Prices exists');
    return undefined;
  }

  const months = docsSnap.docs.map(col => col.id).sort();

  return getEthPrice(months[months.length-1]);
}

// ==== Fetch Gecko Prices ====

export type GeckoData = {
  prices: number[][],
  market_caps: number[][],
  total_volumes: number[][]
}

export async function fetchEthPriceData(from:number, to:number): Promise<GeckoData | undefined>  {
  const fetch = (await import('node-fetch')).default;
  const url = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;
  const response = await fetch(url);
  
  if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
  }
  
  return response.json();
}

// ==== Update & Store Monthly Eth Prices ====
export type MonthRage = {
  from: number;
  to: number;
  month: string;
}

export function getMonthRanges(start:number, end:number): MonthRage[] {
  const ranges:MonthRage[] = [];
  let currentDate = new Date(start);
  console.log('currentDate: ', currentDate.toUTCString());
  const endDate = new Date(end);
  console.log('endDate: ', endDate.toUTCString());

  while (currentDate <= endDate) {
      const from = Math.floor(currentDate.getTime() / 1000);
      const nextMonth = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0));
      const to = Math.min(Math.floor(nextMonth.getTime() / 1000 + 86399), Math.floor(endDate.getTime() / 1000)); // UTC end of the month

      ranges.push({
          from,
          to,
          month: `${currentDate.getUTCFullYear()}-${(currentDate.getUTCMonth() + 1).toString().padStart(2, '0')}`
      });

      currentDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 1));
  }

  return ranges;
}

export function dateToYearMonthStr(input: Date): string {
  return `${input.getUTCFullYear().toString()}-${Number(input.getUTCMonth() + 1).toString().padStart(2,'0')}`;
}

export async function updateMonthlyEthPrices(): Promise<boolean> {
  const curTime = Date.now();

  const latestMonthPrices = await getLatestMonthEthPrice();
  if (!latestMonthPrices) return false;

  const latestRecordTime = latestMonthPrices[latestMonthPrices.length - 1].timestamp;
  const lastRecordDate = new Date(latestRecordTime);
  const lastRecordYearMonthStr = dateToYearMonthStr(lastRecordDate);

  const monthRanges = getMonthRanges(latestRecordTime + 1000, curTime)

  for (const range of monthRanges) {

    try {
        console.log(`Fetching data for ${range.month}...`);
        const data = await fetchEthPriceData(range.from, range.to);

        if (!data) return false;

        const newPrices = data.prices.map(v => ({
          timestamp: v[0],
          price: v[1],
        }));
        console.log('newPrices: ', newPrices);

        let flag = false;

        if (range.month == lastRecordYearMonthStr) {

          if (newPrices.length > 0) {
            const input = latestMonthPrices.concat(newPrices);
            console.log('input: ', input);
  
            flag = await setEthPrice(range.month, input);
            if (!flag) return false;
          } else {
            continue;
          }

        } else {
          flag = await setEthPrice(range.month, newPrices);
          if (!flag) return false;
        }

    } catch (error:any) {
        console.error(`Failed to update Eth Price for ${range.month}: ${error.message}`);
    }

  }

  return true;
}

// ==== Get ETH Prices For Append Records ====

// export async function getEthPricesForAppendRecords(start:number): Promise<EthPrice[]|undefined> {
//   const curTime = Date.now();
//   const monthRanges = getMonthRanges(start, curTime);

//   let output:EthPrice[] = [];

//   for (const range of monthRanges) {

//     try {
//       const prices = await getEthPrice(range.month);
//       if (!prices) return undefined;

//       output = output.concat(prices);

//     } catch (error:any) {
//         console.error(`Failed to get EthPrice for ${range.month}: ${error.message}`);
//     }

//   }

//   return output;
// }

export function findClosestPrice(targetTimestamp:number, data:EthPrice[]): EthPrice {
  let left = 0;
  let right = data.length - 1;
  let mark:EthPrice = {
      timestamp: 0,
      price: 1,
  };

  while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midTimestamp = data[mid].timestamp;

      if (midTimestamp === targetTimestamp) {
          mark.timestamp = midTimestamp;
          mark.price = data[mid].price;
          break;
      }

      if (midTimestamp < targetTimestamp) {
          mark.timestamp = midTimestamp;
          mark.price = data[mid].price;
          left = mid + 1;
      } else {
          right = mid - 1;
      }
      
  }

  return mark;
}

export type CentPrice = {
  timestamp: number;
  centPrice: bigint;
}

export function getPriceAtTimestamp(targetTimestamp: number, prices: EthPrice[]): CentPrice {
  let mark:EthPrice = findClosestPrice(targetTimestamp, prices);
  
  let output:CentPrice = {
      timestamp: mark.timestamp,
      centPrice: 10n ** 34n / BigInt(mark.price * 10 ** 18),
  }

  return output;
}

export async function retrieveMonthlyEthPriceByTimestamp(timestamp: number): Promise<EthPrice[]|undefined> {

  const msTimestamp = timestamp * 1000;
  const date = new Date(msTimestamp);

  const yearMonth = dateToYearMonthStr(date);
  const prices = await getEthPrice(yearMonth);

  return prices;  
}


export async function retrieveEthPriceByTimestamp(timestamp: number): Promise<EthPrice|undefined> {

  const prices = await retrieveMonthlyEthPriceByTimestamp(timestamp);
  if (!prices) return undefined;

  const mark = findClosestPrice(timestamp * 1000, prices);
  return mark;
}

