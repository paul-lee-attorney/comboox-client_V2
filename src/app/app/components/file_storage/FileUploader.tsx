
import React, { useState, ChangeEvent, Dispatch, SetStateAction } from 'react';

import { styled } from '@mui/material/styles';
import { Box, Button, LinearProgress, LinearProgressProps, Stack, Typography,  } from '@mui/material';
import { CloudUpload, } from '@mui/icons-material';
import { HexType } from '../../common';
import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';
import { useWalletClient } from 'wagmi';
import { GetWalletClientResult } from '@wagmi/core';
import { encryptFile } from '../../../api/firebase';
import { updateFileMetadata, uploadFileAsBytesResumable } from '../../../api/firebase/fileUploadTools';
import FileDownloader from './FileDownloader';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {`${Math.round(props.value,)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

export interface CheckFilerFunc {
  (filer:GetWalletClientResult):Promise<boolean>;
}

export interface FileUploaderProps {
  filePath: string | undefined,
  setDocHash: Dispatch< SetStateAction< HexType | undefined>>, 
  checkFiler: CheckFilerFunc, 
}

function FileUploader({filePath, setDocHash, checkFiler}: FileUploaderProps) {

  const { gk } = useComBooxContext();
  const { data: signer } = useWalletClient();

  const [ progress, setProgress ] = useState<number>(0);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    let file = e.target.files[0];    
    console.log('file: ', file.name);

    const fileBuffer = await file.arrayBuffer();
    const fileUint8Buffer = new Uint8Array(fileBuffer);

    if (!gk) {
      console.log('General Keeper Not Retrieved');
      return;
    }

    const fileEncrypted = encryptFile(fileUint8Buffer, gk, gk);
    
    setDocHash(`0x${fileEncrypted.docHash}`);

    if (!signer) {
      console.log('No Signer Detected!');
      return;
    }
    let sig = await signer.signMessage({message: fileEncrypted.docHash});
    let filerInfo = {
      customMetadata: {
        filer: signer.account.address,
        docHash: fileEncrypted.docHash,
        sig: sig,
      }
    };

    if (!await checkFiler(signer)) {
      console.log('Filer Not Qualified!');      
      return;
    }

    const uploadTask = uploadFileAsBytesResumable(filePath!, fileEncrypted.docData);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error("Upload failed", error);
      },
      () => {
        updateFileMetadata(filePath!, filerInfo).then((metadata) => {
          console.log('metadata: ', metadata);
        });
      }
    );
  }

  return (

    <Box sx={{width:318, mb:2 }}>

      <Stack direction='column' >

        <Stack direction='row' >      

          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUpload />}
            sx={{
              m:1,
              height:40,
              width:218
            }}
            color='success'
            disabled={!filePath}
          >
            Upload File
            <VisuallyHiddenInput type="file" onChange={handleFileChange} />
          </Button>
          
          {progress == 100 && (
            <FileDownloader filePath={filePath} />
          )}

        </Stack>

        <LinearProgressWithLabel value={progress}  />

      </Stack>
      
    </Box>
  );

}

export default FileUploader;