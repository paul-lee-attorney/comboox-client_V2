
import { FullMetadata, ref, SettableMetadata, StringFormat, updateMetadata, uploadBytes, uploadBytesResumable, UploadResult, uploadString, UploadTask } from "firebase/storage";
import { storage } from './firebase';
import { encryptPicture } from ".";
import { HexType } from "../../app/common";

export async function uploadFileAsBytes(filePath:string, data:Blob | Uint8Array | ArrayBuffer): Promise<UploadResult> {
  filePath = filePath.toLowerCase();
  const fileRef = ref(storage, filePath);

  try {
    const uploadResult = await uploadBytes(fileRef, data);
    return uploadResult;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export async function uploadFileAsString(filePath:string, data:string, format?:StringFormat): Promise<UploadResult> {
  filePath = filePath.toLowerCase()
  const fileRef = ref(storage, filePath);

  try {
    const uploadResult = await uploadString(fileRef, data, format);
    return uploadResult;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export function uploadFileAsBytesResumable(filePath:string, data:Blob | Uint8Array | ArrayBuffer): UploadTask {

  filePath = filePath.toLowerCase();
  const fileRef = ref(storage, filePath);

  try {
    const uploadTask = uploadBytesResumable(fileRef, data);
    return uploadTask;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export async function updateFileMetadata(filePath:string, metadata:SettableMetadata): Promise<FullMetadata> {

  filePath = filePath.toLowerCase();
  const fileRef = ref(storage, filePath);

  try {
    const fullMetadata = await updateMetadata(fileRef, metadata);
    return fullMetadata;
  } catch (error) {
    console.error("Error update metadata:", error);
    throw error;
  }
};

export async function uploadAndEncryptImg(filePath:string, img:string, addr:HexType, gk:HexType): Promise<FullMetadata | undefined>{

  const encryptedImg = encryptPicture(img, addr, gk);
  const imgInfo = {
    customMetadata: {
      filer: addr,
      imgHash: encryptedImg.imgHash,
    }
  };

  try {
    await uploadFileAsString(filePath, encryptedImg.imgData, 'base64');
  } catch(error:any) {
    console.log('upload error:', error.message);
  }

  try {
    const metadata = await updateFileMetadata(filePath, imgInfo);
    return metadata;
  } catch(error:any) {
    console.log('updateMetadata error:', error.message);
  }

}


