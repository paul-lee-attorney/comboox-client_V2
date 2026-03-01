
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

import { HexType } from '../../common';
import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';

import FileUploader, { CheckFilerFunc } from './FileUploader';

export interface AgreementUploaderProps {
  typeOfFile: string,
  addrOfFile: HexType,
  setDocHash: Dispatch< SetStateAction< HexType | undefined>>, 
  checkFiler: CheckFilerFunc, 
}

function AgreementUploader({typeOfFile, addrOfFile, setDocHash, checkFiler}: AgreementUploaderProps) {

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
    <FileUploader filePath={filePath} setDocHash={setDocHash} checkFiler={checkFiler} />
  );
}

export default AgreementUploader;