
import { useState, useEffect } from 'react';
import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';
import { longSnParser } from '../../common/toolsKit';

import { useWalletClient } from 'wagmi';
import { getMyUserNo } from '../../rc';
import FileDownloader from './FileDownloader';
import { getTypeOfMotion, Motion } from '../../comp/gmm/meetingMinutes';

export interface MotionDownloaderProps {
  motion: Motion
}

function MotionDownloader({motion}: MotionDownloaderProps) {

  const { gk } = useComBooxContext();
  const { data: signer } = useWalletClient();

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
      str += longSnParser(motion.body.proposer.toString()) + '/';
      str += longSnParser(motion.head.seqOfMotion.toString()) + '/';
      str += motion.contents.toString(16).padStart(64, '0').substring(54).toLowerCase() + '.pdf'; 

      setFilePath(str);
    }

    updateFilePath();
  });

  return (
    <FileDownloader filePath={filePath} />
  );

}

export default MotionDownloader;