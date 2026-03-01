
import { ref, getBlob, getBytes, getMetadata, getDownloadURL, FullMetadata } from "firebase/storage";
import { storage } from './firebase';
import { decryptFile, decryptPicture, EncryptedFile, EncryptedImage } from ".";
import { HexType } from "../../app/common";

export async function downloadFileAsBlob(filePath:string): Promise<Blob> {
  filePath = filePath.toLowerCase();
  const fileRef = ref(storage, filePath);

  try {
    const blob = await getBlob(fileRef);
    return blob;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

export async function downloadFileAsBytes(filePath:string): Promise<ArrayBuffer> {
  filePath = filePath.toLowerCase();
  const fileRef = ref(storage, filePath);

  try {
    const arrayBuffer = await getBytes(fileRef);
    return arrayBuffer;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

export async function downloadFileMetadata(filePath:string): Promise<FullMetadata> {
  filePath = filePath.toLowerCase();
  const fileRef = ref(storage, filePath);

  try {
    const metadata = await getMetadata(fileRef);
    return metadata;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

export async function getFileDownloadURL(filePath: string): Promise<string | undefined>{
  filePath = filePath.toLowerCase();

  try {
    const storageRef = ref(storage, filePath);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      // 文件不存在
      return undefined;
    } else {
      throw error;
    }
  }
}

export async function downloadAndDecryptFile(filePath:string, gk:HexType): Promise<string> {

  const encryptedFile: EncryptedFile = {
    docData: new Uint8Array(await downloadFileAsBytes(filePath)),
    docHash: (await downloadFileMetadata(filePath)).customMetadata!.docHash!,
  }

  const fileBuffer = decryptFile(encryptedFile, gk, gk);

  if (fileBuffer) {
    const blob = new Blob([fileBuffer], {type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    return url;
  }

  return '';
}

export async function downloadAndDecryptImg(filePath:string, addr:HexType, gk:HexType): Promise<string> {

  const encryptedPic:EncryptedImage  = {
    imgData: (Buffer.from(await downloadFileAsBytes(filePath))).toString('base64'),
    imgHash: (await downloadFileMetadata(filePath)).customMetadata!.imgHash!,
  }

  // console.log('before:', encryptedPic.imgData);

  const img = decryptPicture(encryptedPic, addr, gk);

  // console.log('after: ', img);

  if (img) {
    let decodeImg = img.replace('dataimage/jpegbase64', 'data:image/jpeg;base64,');
    return decodeImg;
  } else return '';
}
