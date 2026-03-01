import { useEffect, useState } from 'react';

import {  Paper, Stack, Divider, Typography, Card,
  CardContent, Chip, Tooltip, IconButton,
} from '@mui/material';
import { ArrowDownward, ArrowUpward, Key }  from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';

import { HexType, booxMap } from '../../common';
import { getKeeper } from '../gk';
import { getDK } from '../common/draftControl';
import { refreshAfterTx } from '../../common/toolsKit';

import { InitCompProps } from './SetCompInfo';
import { useAccessControlSetDirectKeeper } from '../../../../../generated-v1';

export function TurnKey({ nextStep }:InitCompProps) {
  const { gk, boox, setErrMsg } = useComBooxContext();
  const [ time, setTime ] = useState(0);

  const [romKeeper, setRomKeeper] = useState<HexType>();

  useEffect(()=>{
    if (gk) {
      getKeeper(gk, booxMap.ROM).then(
        res => {
          setRomKeeper(res);
        }
      )
    }
  }, [gk, time]);

  const [ loadingRom, setLoadingRom ] = useState(false);
  const refreshRom = ()=>{
    setTime(Date.now());
    setLoadingRom(false);
  }

  const {
    isLoading: setRomDKLoading,
    write: setRomDK,
  } = useAccessControlSetDirectKeeper({
    address: boox ? boox[booxMap.ROM] : undefined,
    args: romKeeper ? [ romKeeper ] : undefined,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingRom(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshRom);
    }
  });

  const [dkOfRom, setDKOfRom] = useState<HexType>();

  useEffect(()=>{
    if (boox) {
      getDK(boox[booxMap.ROM]).then(
        res => {
          setDKOfRom(res);
        }
      )
    }
  }, [boox, time])

  const [ loadingRos, setLoadingRos ] = useState(false);
  const refreshRos = ()=>{
    setTime(Date.now());
    setLoadingRos(false);
  }

  const {
    isLoading: setRosDKLoading,
    write: setRosDK
  } = useAccessControlSetDirectKeeper({
    address: boox ? boox[booxMap.ROS] : undefined,
    args: romKeeper ? [ romKeeper ] : undefined,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingRos(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshRos);
    }
  });

  const [dkOfRos, setDKOfRos] = useState<HexType>();

  useEffect(()=>{
    if (boox) {
      getDK(boox[booxMap.ROS]).then(
        res => {
          setDKOfRos(res);
        }
      )
    }
  }, [boox, time]);

  return (

    <Paper elevation={3} sx={{m:1, p:1, width:'100%', alignItems:'center', justifyContent:'center' }} >

      <Stack direction='row' sx={{alignItems:'start', justifyContent:'start', alignContent:'start'}}>

        <Stack direction='column' sx={{ height:'100%' }} >

          <Tooltip title='Prev Step' placement='left' arrow >
            <IconButton
              size='large'
              color='primary'
              onClick={()=>nextStep(2)}
            >
              <ArrowUpward />
            </IconButton>
          </Tooltip>

          <Divider flexItem />

          <Tooltip title='Next Step' placement='left' arrow >

            <IconButton
              size='large'
              color='primary'
              onClick={()=>nextStep(4)}
            >
              <ArrowDownward />
            </IconButton>

          </Tooltip>

        </Stack>

        <Divider sx={{m:1}} orientation='vertical' flexItem />

        <Stack direction='column' sx={{m:1, p:1, alignItems:'start', justifyContent:'space-between'}} >

          <Typography variant="h5" component="div" sx={{ m:2, textDecoration:'underline' }} >
            <b>Turn Key</b>
          </Typography>

          <Card sx={{ width:'100%', }} variant='outlined'>
              <CardContent>

                <Stack direction='row' >
                  <Chip
                    variant='filled'
                    color='primary'
                    label='ROMKeeper'
                    sx={{width:120}}
                  />

                  <Typography variant="body1" sx={{ m:1, textDecoration:'underline' }} >
                    {romKeeper}
                  </Typography>
                </Stack>

                <Stack direction='row' >
                  <Chip
                    variant={ dkOfRom == romKeeper ? 'filled' : 'outlined' }
                    color={ dkOfRom == romKeeper ? 'primary' : 'default' }
                    label='KeeperOfROM'
                    sx={{width:120}}
                  />

                  <Typography variant="body1" sx={{ m:1, textDecoration:'underline' }} >
                    {dkOfRom}
                  </Typography>
                </Stack>

                <Divider />

                <Stack direction='row' >
                  <Chip
                    variant='filled'
                    color='success'
                    label='ROMKeeper'
                    sx={{width:120}}
                  />

                  <Typography variant="body1" sx={{ m:1, textDecoration:'underline' }} >
                    {romKeeper}
                  </Typography>
                </Stack>

                <Stack direction='row' >
                  <Chip
                    variant={ dkOfRos == romKeeper ? 'filled' : 'outlined' }
                    color={ dkOfRos == romKeeper ? 'success' : 'default' }
                    label='KeeperOfROS'
                    sx={{width:120}}
                  />

                  <Typography variant="body1" sx={{ m:1, textDecoration:'underline' }} >
                    {dkOfRos}
                  </Typography>
                </Stack>

              </CardContent>        
          </Card>
        
          <Stack direction='row' sx={{m:1, p:1}}>

            <LoadingButton 
              disabled = { !setRomDK || setRomDKLoading }
              loading={loadingRom}
              loadingPosition='start'
              sx={{ m: 1, mr: 5, minWidth: 120, height: 40 }} 
              variant="outlined" 
              color='primary'
              startIcon={<Key />}
              onClick={() => { 
                setRomDK?.(); 
              }}
              size='small'
            >
              Turn Key of ROM
            </LoadingButton>

            <LoadingButton 
              disabled = {!setRosDK || setRosDKLoading }
              loading={loadingRos}
              loadingPosition='start'
              sx={{ m: 1, ml:5, minWidth: 120, height: 40 }} 
              variant="outlined" 
              color='success'
              startIcon={<Key />}
              onClick={()=> {
                setRosDK?.();
              }}
              size='small'
            >
              Turn Key of ROS
            </LoadingButton>

          </Stack>


        </Stack>

      </Stack>
    </Paper>


  )
}
