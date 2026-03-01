// import * as scReg from "../../../../../comboox/server/src/contracts/contracts-address.json";

// export const AddrOfRegCenter:HexType = `0x${scReg.RegCenter_2.substring(2)}`;
// export const AddrOfTank:HexType = `0x${scReg.FuelTank.substring(2)}`;
// export const AddrOfCNC:HexType = `0x${scReg.CreateNewComp.substring(2)}`;

// export const AddrOfRegCenter:HexType = `0x${'2C3fAE75f0d872DAa78De8FFD6AfedF463013d3c'}`;
// export const AddrOfTank:HexType = `0x${'Ee17716A42D168553B5E77507e5a7dcA786BE39B'}`;
// export const AddrOfCNC:HexType = `0x${'ADdE6d6867880EEa2CA8d88EaF08732a94D572B8'}`;

export const AddrOfRegCenter:HexType = `0x${process.env.NEXT_PUBLIC_RC_ADDR?.substring(2) ?? '0'}`;
export const AddrOfTank:HexType = `0x${process.env.NEXT_PUBLIC_FT_ADDR?.substring(2) ?? '0'}`;
// export const AddrOfCNC:HexType = `0x${process.env.NEXT_PUBLIC_CNC_ADDR?.substring(2) ?? '0'}`;
export const AddrOfUSDC:HexType = `0x${process.env.NEXT_PUBLIC_USDC_ADDR?.substring(2) ?? '0'}`;
export const AddrOfCL:HexType = `0x${process.env.NEXT_PUBLIC_CL_ADDR?.substring(2) ?? '0'}`;

export const FirstUser:HexType = `0x${process.env.NEXT_PUBLIC_FIRST_USER?.substring(2) ?? '0'}`;
export const SecondUser:HexType = `0x${process.env.NEXT_PUBLIC_SECOND_USER?.substring(2) ?? '0'}`;

export const Bytes32Zero:HexType = `0x${'0'.padEnd(64,'0')}`;
export const AddrZero:HexType = `0x${'0'.padEnd(40,'0')}`;
export const SelectorZero:HexType = `0x${'0'.padStart(8,'0')}`;

export const SeqZero:string = '0'.padEnd(4,'0');
export const AcctZero:string = '0'.padEnd(10,'0');
export const DateZero:string = '0'.padEnd(12,'0');
export const DataZero:string = '0'.padEnd(16,'0');

export const MaxLockValue: bigint = 2n**128n-1n;
export const MaxData: bigint = 2n**64n-1n;
export const MaxPrice: bigint = 2n**32n-1n;
export const MaxUserNo: bigint = 2n**40n-1n;
export const MaxSeqNo: bigint = 2n**16n-1n;
export const MaxRatio: bigint = 10000n;
export const MaxByte: bigint = 255n;

export type HexType = `0x${string}`;

interface BooxMap {
  ROC: number;
  ROD: number;
  BMM: number;
  ROM: number;
  GMM: number;
  ROA: number;
  ROO: number;
  ROP: number;
  ROS: number;
  LOO: number;
  ROI: number;
  WTF: number;
  Cashier: number;
  USDC: number;
  UsdLOO: number;
  ROR: number;
}

export const booxMap:BooxMap = {
  ROC: 1,
  ROD: 2,
  BMM: 3,
  ROM: 4,
  GMM: 5, 
  ROA: 6,
  ROO: 7,
  ROP: 8,
  ROS: 9,
  LOO: 10,
  ROI: 11,
  USDC: 12,
  UsdLOO: 13,
  WTF: 14,
  Cashier: 15,
  ROR: 16,
}

interface KeepersMap {
  ROCKeeper: number;
  RODKeeper: number;
  BMMKeeper: number;
  ROMKeeper: number;
  GMMKeeper: number;
  ROAKeeper: number;
  ROOKeeper: number;
  ROPKeeper: number;
  SHAKeeper: number;
  LOOKeeper: number;
  UsdROMKeeper: number;
  UsdROAKeeper: number;
  UsdLOOKeeper: number;
  UsdROOKeeper: number;
  UsdKeeper: number;
  ROIKeeper: number;
  WTFKeeper: number;
  Accountant: number;
  RORKeeper: number;
}

export const keepersMap:KeepersMap = {
  ROCKeeper: 1,
  RODKeeper: 2,
  BMMKeeper: 3,
  ROMKeeper: 4,
  GMMKeeper: 5, 
  ROAKeeper: 6,
  ROOKeeper: 7,
  ROPKeeper: 8,
  SHAKeeper: 9,
  LOOKeeper: 10,
  UsdROMKeeper: 11,
  UsdROAKeeper: 12,
  UsdLOOKeeper: 13,
  UsdROOKeeper: 14,
  UsdKeeper: 15,
  ROIKeeper: 11,
  WTFKeeper: 14,
  Accountant: 12,
  RORKeeper: 16,
}

export const currencies:string[] = [
  'USD', 'GBP', 'EUR', 'JPY', 'KRW', 'CNY',
  'AUD', 'CAD', 'CHF', 'ARS', 'PHP', 'NZD', 
  'SGD', 'NGN', 'ZAR', 'RUB', 'INR', 'BRL'
]
