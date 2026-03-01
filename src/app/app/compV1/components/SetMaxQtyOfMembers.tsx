import { useEffect, useState } from 'react';

import { TextField, Card, CardContent, Typography, Paper, Stack, Divider,
  Tooltip, IconButton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ArrowDownward, ArrowUpward, Update }  from '@mui/icons-material';

import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';

import { useRegisterOfMembersSetMaxQtyOfMembers } from '../../../../../generated-v1';

import { HexType, MaxSeqNo, booxMap } from '../../common';
import { FormResults, defFormResults, hasError, onlyInt, refreshAfterTx } from '../../common/toolsKit';
import { maxQtyOfMembers } from '../rom/rom';

import { InitCompProps } from './SetCompInfo';

export function SetMaxQtyOfMembers({nextStep}: InitCompProps) {

  const { boox, setErrMsg } = useComBooxContext();
  const [time, setTime] = useState<number>(0);
  const [max, setMax] = useState<string>('');
  const [inputMax, setInputMax] = useState<string>('50');
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const refresh = ()=>{
    setTime(Date.now());
    setLoading(false);
  }

  useEffect(()=>{
    if (boox) {
      maxQtyOfMembers(boox[booxMap.ROM]).then(
        res => setMax(res.toString())
      );
    }
  }, [boox, time]);

  const {
    isLoading: setMaxQtyLoading,
    write: setMaxQty, 
  } = useRegisterOfMembersSetMaxQtyOfMembers({
    address: boox ? boox[booxMap.ROM] : undefined,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash:HexType = data.hash;
      refreshAfterTx(hash, refresh);
    }
  });

  const handleClick = ()=>{
    setMaxQty({
      args:[BigInt(inputMax)],
    })
  }

  return (    
    <Paper elevation={3} sx={{m:1, p:1, width:'100%', alignItems:'center', justifyContent:'center' }} >

      <Stack direction='row' sx={{alignItems:'start', justifyContent:'start', alignContent:'start'}} >

        <Stack direction='column' sx={{ height:'100%' }} >
          <Tooltip title='Prev Step' placement='left' arrow >
            <IconButton
              size='large'
              color='primary'
              onClick={()=>nextStep(0)}
            >
              <ArrowUpward />
            </IconButton>
          </Tooltip>

          <Divider flexItem />

          <Tooltip title='Next Step' placement='left' arrow >

            <IconButton
              size='large'
              color='primary'
              onClick={()=>nextStep(2)}
            >
              <ArrowDownward />
            </IconButton>

          </Tooltip>

        </Stack>

        <Divider sx={{m:1}} orientation='vertical' flexItem />

        <Stack direction='column' sx={{m:1, alignItems:'start', justifyContent:'space-between'}} >

          <Typography variant="h5" component="div" sx={{ m:1, textDecoration:'underline' }} >
            <b>Max Qty of Members</b>
          </Typography>

          <Card sx={{ m:1, width:'100%', }} variant='outlined'>
              <CardContent>

                <Typography variant="body1" component="div" sx={{ m:1 }} >
                  MaxQty: {max}
                </Typography>

              </CardContent>        
          </Card>
        
          <Stack direction='row' >
            <TextField 
              sx={{ m: 1, minWidth: 120 }} 
              id="tfMaxQty" 
              label="MaxQtyOfMembers" 
              variant="outlined"
              error={ valid['MaxQty']?.error }
              helperText={ valid['MaxQty']?.helpTx ?? ' ' }
              onChange={(e) => {
                let input = e.target.value;
                onlyInt('MaxQty', input, MaxSeqNo, setValid);
                setInputMax(input);
              }}

              value = {inputMax}
              size='small'
            />

            <LoadingButton 
              disabled = {!setMaxQty || setMaxQtyLoading || hasError(valid)}
              loading= {loading}
              loadingPosition='end'
              sx={{ m: 1, minWidth: 120, height: 40 }} 
              variant="contained" 
              endIcon={<Update />}
              onClick={ handleClick }
              size='small'
            >
              Update
            </LoadingButton>

          </Stack>

        </Stack>

      </Stack>

    </Paper>
  )
}
