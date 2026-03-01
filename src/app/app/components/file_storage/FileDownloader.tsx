import { useEffect, useState } from "react";
import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { useWalletClient } from "wagmi";
import { verifySig } from "../../../api/firebase";
import { getMyUserNo } from "../../rc";
import { isMember } from "../../comp/rom/rom";
import { booxMap } from "../../common";
import { downloadAndDecryptFile, getFileDownloadURL } from "../../../api/firebase/fileDownloadTools";
import { Button, Dialog, DialogActions, DialogContent, IconButton, Tooltip } from "@mui/material";
import { CloudDownloadOutlined } from "@mui/icons-material";


export interface FileDownloaderProps {
  filePath: string | undefined,
}

function FileDownloader({filePath}: FileDownloaderProps) {
  
  const { gk, boox } = useComBooxContext();
  const [ url, setUrl] = useState<string | undefined>();

  const [ open, setOpen ] = useState(false);
  const [ downloadURL, setDownloadURL ] = useState('');

  const { data: signer } = useWalletClient();

  useEffect(()=>{
    const checkFile = async ()=> {
      if (filePath) {
        let uri = await getFileDownloadURL(filePath);
        if (uri) setUrl(uri);
        console.log('get uri: ', uri);        
      }
    }
    checkFile();
  });

  const handleDownload = async () => {
    if (!signer || !url || !boox || !gk) return;

    let sig = await signer.signMessage({message: url});
    let filerInfo = {
        address: signer.account.address,
        message: url,
        sig: sig,
    };
    
    if (!verifySig(filerInfo)) {
      console.log('Sig Not Verified.');
      return;
    }

    let myNo = await getMyUserNo(filerInfo.address);
    if (!myNo) {
      console.log('UserNo Not Obtained!');
      return;      
    };
    console.log('myNo: ', myNo);    

    let flag = await isMember(boox[booxMap.ROM], myNo);
    if (!flag) {
      console.log('Not Member.');
      return;
    }

    const decryptedURL = await downloadAndDecryptFile(filePath!, gk);
    if (decryptedURL.length > 0) {
      setDownloadURL(decryptedURL);
      setOpen(true);
    }

  }

  return (
    <>
      {url && (
        <Tooltip title='Download File' placement="top" arrow >
            <IconButton size="medium" sx={{m:1}} color="primary" onClick={handleDownload}>
              <CloudDownloadOutlined />
            </IconButton>
        </Tooltip>
      )}

      <Dialog
        maxWidth={false}
        PaperProps={{ style: { width: '95%', height: '95%', maxWidth: 'none' } }}
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title"
      >

        <DialogContent>
          <iframe src={downloadURL} width='100%' height='100%' />
        </DialogContent>

        <DialogActions>
          <Button variant='outlined' sx={{ m:1, mx:3 }} onClick={()=>setOpen(false)}>Close</Button>
        </DialogActions>

      </Dialog>

    </>
  );
}

export default FileDownloader;