import { useState, useEffect } from 'react';

import { TextField, Paper, Stack, Divider, Typography,
  Tooltip, IconButton
} from '@mui/material';
import { AddCircle, ArrowDownward, ArrowUpward, RemoveCircle }  from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import { useRegisterOfSharesIssueShare, useRegisterOfSharesDecreaseCapital } from '../../../../../generated-v1';

import { HexType, MaxData, MaxPrice, MaxSeqNo, MaxUserNo, booxMap } from '../../common';
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, stampToUtc, strNumToBigInt, utcToStamp } from '../../common/toolsKit';

import { DateTimeField } from '@mui/x-date-pickers';

import { SharesList } from '../ros/components/SharesList';

import { StrShare, Share, defStrShare, getSharesList, codifyHeadOfStrShare, } from '../ros/ros';

import { InitCompProps } from './SetCompInfo';

import { useComBooxContext } from '../../../_providers/ComBooxContextProvider';

export function InitBos({nextStep}: InitCompProps) {
  const { boox, setErrMsg } = useComBooxContext();

  const [sharesList, setSharesList] = useState<readonly Share[]>();
  const [share, setShare] = useState<StrShare>(defStrShare);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [time, setTime] = useState(0);

  const [ loadingAdd, setLoadingAdd ] = useState<boolean>(false);

  const refreshAdd = () => {
    setTime(Date.now());
    setLoadingAdd(false);
  }

  const {
    isLoading: issueShareLoading,
    write: issueShare,
  } = useRegisterOfSharesIssueShare({
    address: boox ? boox[booxMap.ROS] : undefined,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingAdd(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshAdd);
    }    
  });

  const issueShareClick = ()=>{
    issueShare({
      args: [ 
        codifyHeadOfStrShare(share.head),
        BigInt((share.body.payInDeadline ?? 0)),
        strNumToBigInt(share.body.paid, 4),
        strNumToBigInt(share.body.par, 4),
        BigInt(share.body.distrWeight)
      ],
    });
  };

  const [ loadingRemove, setLoadingRemove ] = useState<boolean>(false);
  const refreshRemove = () => {
    setTime(Date.now());
    setLoadingRemove(false);
  }

  const {
    isLoading: delShareLoading,
    write: delShare
  } = useRegisterOfSharesDecreaseCapital({
    address: boox ? boox[booxMap.ROS] : undefined,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoadingRemove(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refreshRemove);
    }
  });

  const delShareClick = ()=> {
    delShare({
      args: [ 
        BigInt(share.head.seqOfShare ?? 0), 
        strNumToBigInt(share.body.paid, 4),
        strNumToBigInt(share.body.par, 4)
      ],
    });
  };

  useEffect(()=>{
    if (boox) {
      getSharesList(boox[booxMap.ROS]).then(
          ls => setSharesList(ls)
      )
    }
  }, [boox, time]);

  return (

    <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider', width:'100%' }} >

      <Stack direction='row' sx={{alignItems:'start', justifyContent:'start', alignContent:'start'}}>

        <Stack direction='column' sx={{ height:'100%' }} >

          <Tooltip title='Prev Step' placement='left' arrow >
            <IconButton
              size='large'
              color='primary'
              onClick={()=>nextStep(1)}
            >
              <ArrowUpward />
            </IconButton>
          </Tooltip>

          <Divider flexItem />

          <Tooltip title='Next Step' placement='left' arrow >

            <IconButton
              size='large'
              color='primary'
              onClick={()=>nextStep(3)}
            >
              <ArrowDownward />
            </IconButton>

          </Tooltip>

        </Stack>

        <Divider sx={{m:1}} orientation='vertical' flexItem />

        <Stack direction='column' sx={{m:1, alignItems:'start', justifyItems:'start'}} >    

          <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }} >
            <b>Register Of Shares</b>
          </Typography>
          
          <Stack direction={'row'} sx={{ alignItems:'center' }} >

            <LoadingButton
              sx={{m:1, mx:3, px:3, py:1}}
              variant='contained'
              startIcon={<AddCircle />}
              loading={loadingAdd}
              loadingPosition='start'
              disabled={ issueShareLoading || hasError(valid) }
              onClick={ issueShareClick }
              size="small"
            >
              Add
            </LoadingButton>

            <Divider orientation='vertical' sx={{m:2}} flexItem />

            <Stack direction={'column'} sx={{m:1, p:1, justifyContent:'center'}}>

              <Stack direction={'row'} sx={{alignItems:'center' }}>

                <TextField 
                  sx={{ m: 1, width: 188 }} 
                  id="tfClass" 
                  label="ClassOfShare" 
                  variant="outlined"
                  error={ valid['ClassOfShare']?.error }
                  helperText={ valid['ClassOfShare']?.helpTx ?? ' ' }
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('ClassOfShare', input, MaxSeqNo, setValid);
                    setShare(v => ({
                      head: {
                        ...v.head,
                        class: input,
                      },
                      body: v.body,
                    }));
                  }}
                  value = {share.head.class}
                  size='small'
                />

                <TextField 
                  sx={{ m: 1, width: 188 }} 
                  id="tfShareholder" 
                  label="Shareholder" 
                  variant="outlined"
                  error={ valid['Shareholder']?.error }
                  helperText={ valid['Shareholder']?.helpTx ?? ' ' }
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('Shareholder', input, MaxUserNo, setValid);
                    setShare(v => ({
                      head: {
                        ...v.head,
                        shareholder: input, 
                      },
                      body: v.body,
                    }));
                  }}
                  value = {share.head.shareholder}
                  size='small'
                />

                <TextField 
                  sx={{ m: 1, width: 188 }} 
                  id="tfPriceOfPar" 
                  label="PriceOfPar" 
                  variant="outlined"
                  error={ valid['PriceOfPar']?.error }
                  helperText={ valid['PriceOfPar']?.helpTx ?? ' ' }
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('PriceOfPar', input, MaxPrice, 4, setValid);
                    setShare(v => ({
                      head: {
                        ...v.head,
                        priceOfPar: input,
                      },
                      body: v.body,
                    }));
                  }}
                  value = {share.head.priceOfPar }
                  size='small'
                />

                <TextField 
                  sx={{ m: 1, width: 188 }} 
                  id="tfPriceOfPaid" 
                  label="PriceOfPaid" 
                  variant="outlined"
                  error={ valid['PriceOfPaid']?.error }
                  helperText={ valid['PriceOfPaid']?.helpTx ?? ' ' }
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('PriceOfPaid', input, MaxPrice, 4, setValid);
                    setShare(v => ({
                      head: {
                        ...v.head,
                        priceOfPaid: input,
                      },
                      body: v.body,
                    }));
                  }}
                  value = {share.head.priceOfPaid }
                  size='small'
                />

                <TextField 
                  sx={{ m: 1, width: 188 }} 
                  id="tfDistrWeight" 
                  label="DistributionWeight(%)" 
                  variant="outlined"
                  error={ valid['DistributionWeight']?.error }
                  helperText={ valid['DistributionWeight']?.helpTx ?? ' ' }
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('DistributionWeight', input, MaxSeqNo, setValid);
                    setShare(v => ({
                      head: v.head,
                      body: {
                        ... v.body,
                        distrWeight: input,
                      },
                    }));
                  }}
                  value = {share.body.distrWeight }
                  size='small'
                />

              </Stack>

              <Stack direction={'row'} sx={{alignItems:'center' }}>

                <DateTimeField
                  label='IssueDate'
                  helperText=' '
                  sx={{m:1, width:188 }}
                  value={ stampToUtc(share.head.issueDate) }
                  onChange={(date) => setShare((v) => ({
                    head: {
                      ...v.head,
                      issueDate: utcToStamp(date),
                    },
                    body: v.body,
                  }))}
                  format='YYYY-MM-DD HH:mm:ss'
                  size='small'
                />

                <DateTimeField
                  label='PayInDeadline'
                  helperText=' '
                  sx={{m:1, width:188 }}
                  value={ stampToUtc(share.body.payInDeadline) }
                  onChange={(date) => setShare((v) => ({
                    head: v.head,
                    body: {
                      ...v.body,
                      payInDeadline: utcToStamp(date),
                    },
                  }))}
                  format='YYYY-MM-DD HH:mm:ss'
                  size='small'
                />

                <TextField 
                  sx={{ m: 1, width: 188 }} 
                  id="tfPar" 
                  label="Par" 
                  variant="outlined"
                  color='warning'
                  error={ valid['Par']?.error }
                  helperText={ valid['Par']?.helpTx ?? ' ' }
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('Par', input, MaxData, 4, setValid);
                    setShare(v => ({
                      head: v.head,
                      body: {
                        ...v.body,
                        par: input,
                      },
                    }));
                  }}
                  value = {share.body.par}
                  size='small'
                />

                <TextField 
                  sx={{ m: 1, width: 188 }} 
                  id="tfPaid" 
                  label="Paid" 
                  variant="outlined"
                  color='warning'
                  error={ valid['Paid']?.error }
                  helperText={ valid['Paid']?.helpTx ?? ' ' }
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyNum('Paid', input, MaxData, 4, setValid);
                    setShare(v => ({
                      head: v.head,
                      body: {
                        ...v.body,
                        paid: input,
                      },
                    }));
                  }}
                  value = {share.body.paid}
                  size='small'
                />

                <TextField 
                  sx={{ m: 1, width: 188 }} 
                  id="tfVotingWeight" 
                  label="VotingWeight (%)" 
                  variant="outlined"
                  error={ valid['VotingWeight']?.error }
                  helperText={ valid['VotingWeight']?.helpTx ?? ' ' }
                  onChange={(e) => {
                    let input = e.target.value;
                    onlyInt('VotingWeight', input, MaxSeqNo, setValid);
                    setShare(v => ({
                      head: {
                        ...v.head,
                        votingWeight: input,
                      },
                      body: v.body,
                    }));
                  }}
                  value = {share.head.votingWeight}
                  size='small'
                />

              </Stack>

            </Stack>

            <Divider orientation='vertical' sx={{m:2}} flexItem />

            <Stack direction='row' sx={{m:1, p:1, alignItems:'start'}}>

              <TextField
                variant="outlined"
                label="SeqOfCert"
                color='warning'
                error={ valid['SeqOfShare']?.error }
                helperText={ valid['SeqOfShare']?.helpTx ?? ' ' }
                sx={{
                  m:1,
                  width: 188
                }}
                onChange={(e)=>{
                  let input = e.target.value;
                  onlyInt('SeqOfShare', input, MaxPrice, setValid);
                  setShare(v => ({
                    ...v,
                    head: {
                      ...v.head,
                      seqOfShare: input,
                    }
                  }));
                }}
                value={ share.head.seqOfShare }
                size='small'
              />

              <LoadingButton
                sx={{m:1, p:1}}
                variant='contained'
                loading={ loadingRemove }
                loadingPosition='end'
                endIcon={<RemoveCircle />}
                disabled={ delShareLoading || hasError(valid) }
                onClick={ delShareClick }
                size="small"
              >
                Remove
              </LoadingButton>

            </Stack>

          </Stack>
          
          <Divider sx={{m:1, width:'100%'}} />

          {sharesList && (
            <SharesList list={sharesList} setShare={()=>{}} setOpen={(flag: boolean)=>{}} />
          )}

        </Stack>

      </Stack>

    </Paper>

  )
}
