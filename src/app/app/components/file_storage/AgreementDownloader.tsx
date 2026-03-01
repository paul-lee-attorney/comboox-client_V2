
import { useState, useEffect } from 'react';

import { HexType } from '../../common';
import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';

import FileDownloader from './FileDownloader';

export interface AgreementDownloaderProps {
  typeOfFile: string,
  addrOfFile: HexType,
}


function AgreementDownloader({typeOfFile, addrOfFile}: AgreementDownloaderProps) {

  const { gk } = useComBooxContext();
  const [ filePath, setFilePath ] = useState<string | undefined>();

  useEffect(()=>{

    const updateFilePath = async () => {
      if (!gk) return;

      let str = gk + '/';      
      str += typeOfFile + '/';
      str += addrOfFile.substring(2,7).toLowerCase() + addrOfFile.substring(37).toLowerCase() + '.pdf';
      
      setFilePath(str);
    }

    updateFilePath();
  });

  return (
    <FileDownloader filePath={filePath} />
  );
}

export default AgreementDownloader;