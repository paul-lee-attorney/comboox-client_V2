"use client"

import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { captureImage, checkFaceAct, checkHeadNode, checkHeadTurn, checkMouthOpen, compareFaces, loadModels, startVideo, stopVideo } from '../../../../api/faceApi';
import Image from 'next/image';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';
import { useWalletClient } from 'wagmi';
import { getMyUserNo } from '../../../rc';
import { HexType } from '../../../common';
import { updateFileMetadata, uploadAndEncryptImg } from '../../../../api/firebase/fileUploadTools';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { longSnParser } from '../../../common/toolsKit';

export default function FaceRecognition() {

	const { gk } = useComBooxContext();
	const { data: signer } = useWalletClient();

	const [ filePath, setFilePath ] = useState('');

	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [modelsLoaded, setModelsLoaded] = useState(false);

	const [photoIdImage, setPhotoIdImage] = useState<string | null>(null);
	const [capturedImage, setCapturedImage] = useState<string[]>([]);

	const [ text, setText ] = useState<string>('Instruction for ID verification.');

  const [ videoStream, setVideoStream ] = useState<MediaStream | null>();

	useEffect(() => {

		const init = async () => {
				await loadModels();
				if (videoRef.current) {
          setVideoStream(await startVideo(videoRef.current));
        }
				setModelsLoaded(true);
		}

		init();
	}, [videoRef]);

	useEffect(()=>{
		const updateFilePath = async () => {				
			if (signer) {
				const myNo = await getMyUserNo(signer.account.address);

				let str = gk + '/investors/';					
				str += longSnParser(myNo.toString()) + '/';
				str = str.toLowerCase();

				console.log('filePath: ', str);

				setFilePath(str);
			}
		}
	
		updateFilePath();
	});    

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoIdImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

	const verifyFace = async(addr: HexType, gk:HexType, sn:number) =>{
		const capImg = captureImage(videoRef.current!, canvasRef.current!);
		if (capImg) {
			setCapturedImage(v => ([...v, capImg]));
			const flag = await compareFaces(capImg, photoIdImage!);
			switch (flag) {
				case 1:
          await uploadPic(capImg, addr, gk, sn);
					return true;
				case -1:
					setText('No face is detected!');
					return false;
				case 0:
					setText('Face not verified!');
					return false;
			}
		}
		return false;
	}

	const uploadPic = async(pic:string, addr:HexType, gk:HexType, sn:number):Promise<string | undefined> => {
		const path = filePath.toLowerCase() + '000' + sn + '.jpg';
		console.log('path of uploadPic: ', path);
		const metadata = await uploadAndEncryptImg(path, pic, addr, gk);
		if (metadata) {
			return metadata.customMetadata!.imgHash;
		}
	}

	const handleVerifyFace = async () => {

		if (gk && signer) {
			const addr = signer.account.address;
			// const myNo = await getMyUserNo(addr);
			// console.log('addrOfSigner: ', addr);

			if (photoIdImage) {			
				var digest = await uploadPic(photoIdImage, addr, gk, 1);
				// console.log('digest: ', digest);
			}

			if (digest) {
				// console.log('signer: ', signer);
				const sig = await signer.signMessage({message: digest});
				// console.log('sig: ', sig);
	
				const imgInfo = {
					customMetadata: {
						filer: addr,
						imgHash: digest!,
						sig: sig,
					}
				};	

				if (filePath.length > 0) {
					const photoIdPath = filePath + '0001.jpg';
					// console.log('photoIdPath: ', photoIdPath);
					await updateFileMetadata(photoIdPath, imgInfo);	
				}	
			}
	
	
			if (modelsLoaded && videoRef.current && canvasRef.current && photoIdImage) {

				setCapturedImage([]);
				
				let flag = await verifyFace(addr, gk, 2);
				if (!flag) return;
	
				setText('Pls turn your head left and right!');
				flag = await checkFaceAct(videoRef.current, checkHeadTurn);
				if (!flag) {
						setText('No head turn detected!');
						return;
				}
	
				flag = await verifyFace(addr, gk, 3);
				if (!flag) return;
	
				setText('Please nod your head!');
				flag = await checkFaceAct(videoRef.current, checkHeadNode);
				if (!flag) {
						setText('No head nod detected!');
						return;
				}
	
				flag = await verifyFace(addr, gk, 4);
				if (!flag) return;
	
				setText('Please open your mouth!');
				flag = await checkFaceAct(videoRef.current, checkMouthOpen);
				if (!flag) {
						setText('No mouth open detected!');
						return;
				}
	
				flag = await verifyFace(addr, gk, 5);
				if (!flag) return;
	
				setText('Identity Verified!');
			}
		}
	};

	
  const router = useRouter();

  const backToRoi = ()=>{
    if (videoStream) {
      stopVideo(videoStream);
      setVideoStream(null);
    }

    router.push('/app/comp/roi')
  }


	return (
    <Box sx={{ width:'580', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography component="h1" variant="h3" align="center" gutterBottom sx={{ m:2, fontWeight:'bold' }}>
        {text ?? ' '}
      </Typography>

      <Stack direction='column' sx={{ m:1, p:1, alignItems:'center'}}>
        <Stack direction='row' sx={{m:1, p:1}}>
          <div style={{ position: 'relative', width: '360', height: '280' }}>
              <video ref={videoRef} poster='/assets/smile-face.jpg' autoPlay playsInline width="360" height="280" style={{ borderRadius: '8px', transform: 'scaleX(-1)' }} />
              <canvas ref={canvasRef} width="360" height="280" style={{ display: 'none' }}></canvas>
              <div
                  style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '150px',
                  height: '200px',
                  border: '4px dashed #fff',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }}
              />
          </div>
          <Divider orientation='vertical' sx={{mx:1}} />
          <Image src={photoIdImage || '/assets/photo-id.jpg'} alt='Photo ID' width={360} height={280} />

        </Stack>

        <Stack direction='row' >
          <Button variant="contained" component="label" sx={{m:2, width:218}}>
            Upload Photo ID
            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
          </Button>

          <Button variant="contained" color="primary" onClick={handleVerifyFace} sx={{ m:2, width:218 }}>
            Verify Face
          </Button>

          <Button 
            variant='contained'
            color='success'
            endIcon={<ArrowBack />} 
            sx={{ m: 2, minWidth: 218, height: 40 }} 
            onClick={()=>backToRoi()}
          >
            Back To ROI
          </Button>

        </Stack>

        <Stack direction="row" sx={{m:1, p:1}}>
          {capturedImage && capturedImage.map((v, i) => (
            <Image key={i} src={v} alt='Captured Img' width={180} height={140} />
          ))}
          {capturedImage.length == 0 &&(
            <>
              <Image src='/assets/smile-face.jpg' alt='Captured Img' width={180} height={140} />
              <Image src='/assets/smile-face.jpg' alt='Captured Img' width={180} height={140} />
              <Image src='/assets/smile-face.jpg' alt='Captured Img' width={180} height={140} />
              <Image src='/assets/smile-face.jpg' alt='Captured Img' width={180} height={140} />
            </>
          )}
        </Stack>

      </Stack>
    </Box>
	);
};