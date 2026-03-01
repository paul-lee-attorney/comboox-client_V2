import { AddrZero, HexType } from "../../app/common";
import { verifyMessage } from "ethers";
import * as crypto from "crypto";
import { keccak256 } from "viem";
import Error from "next/error";

export interface UserInfo {
  address: HexType,
  gk: HexType,
  firstName: string,
  lastName: string,
  email: string,
  documentType: string,
  issueCountry: string,
  issueState: string,
  dateOfBirth: string,
  dateOfExpiry: string,
  documentNumber: string,
  sig: string,
}

export const defaultUserInfo: UserInfo = {
  address: AddrZero,
  gk: AddrZero,
  firstName: '',
  lastName: '',
  email: '',
  documentType: '',
  issueCountry: '',
  issueState: '',
  dateOfBirth: '',
  dateOfExpiry: '',
  documentNumber: '',
  sig: ''
}

export const idDocTypes = [
  'ID Card', 'Passport', 'Driver License', 'Travle Document', 'Others'
]

export const countries = [
  'Australia', 'Austria', 'Belgium', 'Brazil', 'Bulgaria', 
  'Canada', 'China', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany',
  'Greece', 'Hungary', 'India', 'Ireland', 'Israel',
  'Italy', 'Japan', 'Latvia', 'Lithuania', 'Luxembourg',
  'Malta', 'Mexico', 'Netherlands', 'New Zealand', 'Norway',
  'Poland', 'Portugal', 'Romania', 'Russia', 'Singapore',
  'Slovakia', 'Slovenia', 'South Africa', 'South Korea',
  'Spain', 'Sweden', 'Switzerland', 'United Kingdom', 'United States',
  'Others'
]

export const statesOfUS = [
  'AL - Alabama', 'AK - Alaska', 'AZ - Arizona', 'AR - Arkansas', 'CA - California', 
  'CO - Colorado', 'CT - Connecticut', 'DE - Delaware', 'FL - Florida', 'GA - Georgia', 
  'HI - Hawaii', 'ID - Idaho', 'IL - Illinois', 'IN - Indiana', 'IA - Iowa', 
  'KS - Kansas', 'KY - Kentucky', 'LA - Louisiana', 'ME - Maine', 'MD - Maryland', 
  'MA - Massachusetts', 'MI - Michigan', 'MN - Minnesota', 'MS - Mississippi', 'MO - Missouri', 
  'MT - Montana', 'NE - Nebraska', 'NV - Nevada', 'NH - New Hampshire', 'NJ - New Jersey', 
  'NM - New Mexico', 'NY - New York', 'NC - North Carolina', 'ND - North Dakota', 'OH - Ohio', 
  'OK - Oklahoma', 'OR - Oregon','PA - Pennsylvania', 'RI - Rhode Island', 'SC - South Carolina',
  'SD - South Dakota', 'TN - Tennessee', 'TX - Texas','UT - Utah', 'VT - Vermont',
  'VA - Virginia', 'WA - Washington', 'WV - West Virginia', 'WI - Wisconsin', 'WY - Wyoming',
]

export interface SigInfo {
  address: HexType;
  message: string;
  sig: string;
}

export function verifySig(info: SigInfo): boolean {

  if (!info.sig || info.address == AddrZero) return false;

  let recoveredAddr = verifyMessage(info.message, info.sig);

  if (recoveredAddr == info.address) {    
    return true;
  } else {
    return false;
  }

}

  // ==== Hash ====

export function hashData(data: Uint8Array): string {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

export function hashImage(data: string):string {
  const hash = crypto.createHash('sha256');
  const input = Buffer.from(data, 'base64');
  hash.update(input);
  return hash.digest('hex');
}

  // ==== Crypto ====

export type KeyIV = {
  key: string;
  iv: string;
}

export function prepareKeyIV(addr: HexType, gk: HexType): KeyIV {
  let addrStr = addr.toLowerCase();
  let gkStr = gk.toLowerCase();
  const res:KeyIV = {
    key : keccak256(Buffer.from(addrStr + process.env.NEXT_PUBLIC_SALT)).substring(2,18),
    iv: keccak256(Buffer.from(gkStr + process.env.NEXT_PUBLIC_SALT)).substring(2,18),
  }
  return res;
}

export function prepareCipher(addr: HexType, gk: HexType): crypto.Cipher {
  const algorithm = 'aes-128-cbc';
  const kv = prepareKeyIV(addr, gk);
  return crypto.createCipheriv(algorithm, kv.key, kv.iv);
}

export function encryptString(data:string, addr:HexType, gk:HexType):string {
  const cipher = prepareCipher(addr, gk);
  const encrypted = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
  return encrypted;
}

export function encryptImg(data:string, addr:HexType, gk:HexType):string {
  const cipher = prepareCipher(addr, gk);
  try {
    const encrypted = cipher.update(data, 'base64', 'base64') + cipher.final('base64');
    return encrypted;
  } catch (error:any) {
    return error.message;
  }
}

export function encryptData(data:Uint8Array, addr:HexType, gk:HexType):Uint8Array {
  const cipher = prepareCipher(addr, gk);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return new Uint8Array(encrypted);
}

export function prepareDecipher(addr: HexType, gk: HexType): crypto.Decipher {
  const algorithm = 'aes-128-cbc';
  const kv = prepareKeyIV(addr, gk);
  return crypto.createDecipheriv(algorithm, kv.key, kv.iv);
}

export function decryptString(data:string, addr:HexType, gk:HexType):string {
  const decipher = prepareDecipher(addr, gk);
  const decrypted = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
  return decrypted;
}

export function decryptImg(data:string, addr:HexType, gk:HexType):string {
  const decipher = prepareDecipher(addr, gk);
  try {
    const decrypted = decipher.update(data, 'base64', 'base64') + decipher.final('base64');
    return decrypted;
  }catch(error:any) {
    return error.message;
  }
}

export function decryptData(data:Uint8Array, addr:HexType, gk:HexType):Uint8Array {
  const decipher = prepareDecipher(addr, gk);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return new Uint8Array(decrypted);
}

// ==== Image ====

export type EncryptedImage = {
  imgData: string;
  imgHash: string;
}

export function encryptPicture(data:string, addr:HexType, gk:HexType):EncryptedImage {
  return {
    imgData: encryptImg(data, addr, gk),
    imgHash: hashImage(data),
  }
}

export function decryptPicture(pic:EncryptedImage, addr:HexType, gk:HexType):string | null {
  const decrypted = decryptImg(pic.imgData, addr, gk);
  const digest = hashImage(decrypted);
  if (pic.imgHash == digest) {
    return decrypted;
  } else {
    console.log('ImgHash not verified!');
    return null;
  }
}

// ==== File ====

export type EncryptedFile = {
  docData: Uint8Array;
  docHash: string;
}

export function encryptFile(file:Uint8Array, addr:HexType, gk:HexType): EncryptedFile {
  return {
    docData: encryptData(file, addr, gk),
    docHash: hashData(file),
  };
}

export function decryptFile(file:EncryptedFile, addr:HexType, gk:HexType): Uint8Array | null{

  const decrypted = decryptData(file.docData, addr, gk);
  const digest = hashData(decrypted);

  if (file.docHash == digest) {
    return decrypted;
  } else {
    console.log('DocHash not verified!');
    return null;
  }
}

// ==== UserInfo ====

export function encryptUserInfo(info: UserInfo): UserInfo {
  
  info.firstName = encryptString(info.firstName, info.address, info.gk);
  info.lastName = encryptString(info.lastName, info.address, info.gk);

  info.email = encryptString(info.email, info.address, info.gk);  
  info.documentType = encryptString(info.documentType, info.address, info.gk);
  info.issueCountry = encryptString(info.issueCountry, info.address, info.gk);
  info.issueState = encryptString(info.issueState, info.address, info.gk);
  info.dateOfBirth = encryptString(info.dateOfBirth, info.address, info.gk);
  info.dateOfExpiry = encryptString(info.dateOfExpiry, info.address, info.gk);
  info.documentNumber = encryptString(info.documentNumber, info.address, info.gk);

  return info;
}

export function decryptUserInfo(info: UserInfo): UserInfo {
    
  info.firstName = decryptString(info.firstName, info.address, info.gk);
  info.lastName = decryptString(info.lastName, info.address, info.gk);

  info.email = decryptString(info.email, info.address, info.gk);  
  info.documentType = decryptString(info.documentType, info.address, info.gk);
  info.issueCountry = decryptString(info.issueCountry, info.address, info.gk);
  info.issueState = decryptString(info.issueState, info.address, info.gk);
  info.dateOfBirth = decryptString(info.dateOfBirth, info.address, info.gk);
  info.dateOfExpiry = decryptString(info.dateOfExpiry, info.address, info.gk);
  info.documentNumber = decryptString(info.documentNumber, info.address, info.gk);

  return info;
}
