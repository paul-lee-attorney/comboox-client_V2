import { Box, Button, Dialog, DialogActions, DialogContent, Divider, FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import Image from "next/image";
import { CopyLongStrTF } from "../../../../common/CopyLongStr";
import { DateTimeField } from "@mui/x-date-pickers";
import { countries, defaultUserInfo, idDocTypes, statesOfUS, UserInfo } from "../../../../../api/firebase";
import { useState } from "react";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { useWalletClient } from "wagmi";
import { getMyUserNo } from "../../../../rc";
import { getUserData } from "../../../../../api/firebase/userInfoTools";
import { longSnParser, stampToUtc } from "../../../../common/toolsKit";
import { downloadAndDecryptImg } from "../../../../../api/firebase/fileDownloadTools";
import { booxMap } from "../../../../common";
import { getSHA } from "../../../gk";
import { getRule } from "../../../roc/sha/sha";
import { hasTitle } from "../../../rod/rod";
import { BadgeOutlined } from "@mui/icons-material";

export interface CheckPIProps{
  userNo: string;
  seqOfLR: string;
}

export function CheckPI({userNo, seqOfLR}:CheckPIProps) {

  const { gk, boox } = useComBooxContext();

  const { data: signer } = useWalletClient();

  const [ photos, setPhotos ] = useState<string[]>([]);
  const [ userInfo, setUserInfo ] = useState<UserInfo>(defaultUserInfo);
  const [ open, setOpen ] = useState(false);

  const isQualified = async (): Promise<boolean> => {
    if (!gk || !signer || !boox) return false;

    const sha = await getSHA(gk);
    const rule = await getRule(sha, Number(seqOfLR));   
    // console.log('lisingRule: ', rule);
    
    const title = Number(`0x${rule.substring(22, 26)}`);
    // console.log('titleOfVerifier :', title);    

    const myNo = await getMyUserNo(signer.account.address);
    // console.log('myNo :', myNo);    

    const flag = hasTitle(boox[booxMap.ROD], myNo, title); 
    return flag;
  }

  const obtainPictures = async (): Promise<boolean>=>{

    setPhotos([]);

    if (!userInfo) {
      console.log('op: zero userInfo');
      return false;
    }
    if (!gk||!userNo) {
      console.log("GK not retrieaved.");
      return false;
    }
    
    let info = await getUserData(gk, longSnParser(userNo.toString()));
    if (info) {
      setUserInfo(info);
      let str = gk + '/investors/';
      str += longSnParser(userNo.toString()) + '/';

      let i=1;
      let photos:string[]=[];
      while (i<6) {
        let fileName = str + '000' + i.toString() + '.jpg';
        let img = await downloadAndDecryptImg(fileName, info!.address, info!.gk);
        photos.push(img);
        i++;
      }
      setPhotos(photos);
      setOpen(true);
    }

    return true;
  }

  const getPIofUser = async () => {

    if (!(await isQualified())) {
      console.log("Not Qualified!");
      return;
    }

    await obtainPictures();
  }

  return (
    <>
      <Button
        sx={{ m: 1, minWidth: 218, height: 40 }} 
        variant="contained" 
        color='success'
        endIcon={<BadgeOutlined />}
        onClick={ getPIofUser }
        size='small'
      >
        Get Info
      </Button>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={()=>setOpen(false) }
        aria-labelledby="dialog-title"
      >
        <DialogContent>

          <Paper elevation={3} sx={{ m:1, p:1, border:1, borderColor:'divider' }}>

            <Stack direction="row" sx={{ alignItems:'start'}} >

              <Box width={218} sx={{ mr:2 }}>        
                <CopyLongStrTF title="Address" src={userInfo.address} />
              </Box>

              <TextField 
                variant='outlined'
                size="small"
                label='First Name'
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                value={ userInfo.firstName } 
              />

              <TextField 
                variant='outlined'
                size="small"
                label='Last Name'
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                value={ userInfo.lastName } 
              />

              <DateTimeField
                label='dateOfBirth'
                size='small'
                helperText=' '
                sx={{
                  m:1,
                  minWidth: 218,
                }} 
                value={ stampToUtc(Number(userInfo.dateOfBirth))}
                format='YYYY-MM-DD HH:mm:ss'
              />

              <TextField 
                variant='outlined'
                size="small"
                label='Email'
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                value={ userInfo.email } 
              />

            </Stack>

            <Stack direction="row" sx={{ alignItems:'start'}} >

            <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
              <InputLabel id="idDocType-label">DocumentType</InputLabel>
              <Select
                labelId="idDocType-label"
                id="idDocType"
                label="IdDocType"
                value={ 
                  idDocTypes.indexOf(userInfo.documentType) != undefined
                        ? userInfo.documentType
                        : ''
                  }
              >
                {idDocTypes.map(v=>(<MenuItem key={v} value={v}>{v}</MenuItem>))}
              </Select>
              <FormHelperText>{' '}</FormHelperText>
            </FormControl>


            <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
              <InputLabel id="issueCountry-label">IssueCountry / Area</InputLabel>
              <Select
                labelId="issueCountry-label"
                id="issueCountry-select"
                label="IssueCountry"
                value={
                  countries.indexOf(userInfo.issueCountry) > 0
                      ? userInfo.issueCountry
                      : ''
                }
              >
                {countries.map(v=>(<MenuItem key={v} value={v}>{v}</MenuItem>))}
              </Select>
              <FormHelperText>{' '}</FormHelperText>
            </FormControl>

            <FormControl variant="outlined" size='small' sx={{ m: 1, minWidth: 218 }}>
              <InputLabel id="issueState-label">IssueState</InputLabel>
              <Select
                labelId="issueState-label"
                id="issueState-select"
                label="IssueState"
                disabled={userInfo.issueCountry != 'United States'}
                value={
                  statesOfUS.indexOf(userInfo.issueState) > 0
                    ? userInfo.issueState
                    : ''
                }
              >
                {statesOfUS.map(v=>(<MenuItem key={v} value={v}>{v}</MenuItem>))}
              </Select>
              <FormHelperText>{' '}</FormHelperText>
            </FormControl>

            <DateTimeField
              label='dateOfExpiry'
              size='small'
              helperText=' '
              sx={{
                m:1,
                minWidth: 218,
              }} 
              value={ stampToUtc(Number(userInfo.dateOfExpiry))}
              format='YYYY-MM-DD HH:mm:ss'
            />

            <TextField 
              variant='outlined'
              size="small"
              label='DocumentNumber'
              sx={{
                m:1,
                minWidth: 218,
              }}
              value={ userInfo.documentNumber } 
            />

            </Stack>

            <Divider orientation="horizontal" flexItem />

            <Box sx={{ width:'580', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography component="h1" variant="h3" align="center" gutterBottom sx={{ m:2, fontWeight:'bold' }}>
                Photo ID of {longSnParser(userNo)}
              </Typography>

              <Stack direction='column' sx={{ m:1, p:1, alignItems:'center'}}>

                <Stack direction="row" sx={{m:1, p:1}}>
                  <Image src={photos[0] || '/assets/photo-id.jpg'} alt='Photo ID' width={360} height={280} />
                </Stack>

                <Stack direction="row" sx={{m:1, p:1}}>
                  <Image src={photos[1] || '/assets/smile-face.jpg'} alt='Captured Img' width={180} height={140} />
                  <Image src={photos[2] || '/assets/smile-face.jpg'} alt='Captured Img' width={180} height={140} />
                  <Image src={photos[3] || '/assets/smile-face.jpg'} alt='Captured Img' width={180} height={140} />
                  <Image src={photos[4] || '/assets/smile-face.jpg'} alt='Captured Img' width={180} height={140} />
                </Stack>

              </Stack>
            </Box>

          </Paper>

        </DialogContent>

        <DialogActions>
          <Button variant="outlined" sx={{ m:1, mx:3 }} onClick={ ()=>setOpen(false) }>Close</Button>
        </DialogActions>

      </Dialog>

    </>
  );
}