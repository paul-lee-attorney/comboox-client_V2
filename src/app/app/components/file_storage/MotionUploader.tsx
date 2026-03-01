
import { useState, useEffect } from 'react';
import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';
import { longSnParser } from '../../common/toolsKit';

import { useWalletClient } from 'wagmi';
import { getMyUserNo } from '../../rc';
import FileUploader, { CheckFilerFunc } from './FileUploader';
import { HexType } from '../../common';
import { getTypeOfMotion, Motion } from '../../comp/gmm/meetingMinutes';

export interface MotionUploaderProps {
  motion: Motion,
  checkProposer: CheckFilerFunc, 
}

function MotionUploader({motion, checkProposer}: MotionUploaderProps) {

  const { gk } = useComBooxContext();
  const { data: signer } = useWalletClient();

  const [ docHash, setDocHash ] = useState<HexType | undefined>();

  const [ filePath, setFilePath ] = useState('');

  useEffect(()=>{

    const updateFilePath = async ()=> {
      if (!signer || !gk || !motion.head.seqOfMotion || !motion.head.typeOfMotion || !motion.contents) return;

      let myNo = await getMyUserNo(signer.account.address);
      if (!myNo) {
        console.log('UserNo Not Detected!');
        return;
      }

      let str = '';
    
      str += gk + '/';
      str += getTypeOfMotion(motion) + '/';
      str += longSnParser(myNo.toString()) + '/';
      str += longSnParser(motion.head.seqOfMotion.toString()) + '/';
      str += motion.contents.toString(16).padStart(64, '0').substring(54).toLowerCase() + '.pdf'; 

      setFilePath(str);
    }

    updateFilePath();
  });

  return (
    <FileUploader filePath={filePath} setDocHash={setDocHash} checkFiler={checkProposer} />
  );

}

export default MotionUploader;