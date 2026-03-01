import { ChangeEvent, useState } from "react";

import { HexType, MaxData, MaxPrice, MaxSeqNo, MaxUserNo, booxMap } from "../../../../../common";

import { useInvestmentAgreementAddDeal } from "../../../../../../../../generated";

import { Divider, FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography} from "@mui/material";

import { AddCircle } from "@mui/icons-material";

import { DateTimeField } from "@mui/x-date-pickers";
import { StrBody, StrHead, TypeOfDeal, codifyHeadOfDeal, defaultStrBody, defaultStrHead } from "../../ia";
import { getShare } from "../../../../ros/ros";

import { FormResults, bigIntToStrNum, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, stampToUtc, strNumToBigInt, utcToStamp } from "../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";

import { useComBooxContext } from "../../../../../../_providers/ComBooxContextProvider";

export interface CreateDealProps{
  addr: HexType;
  refresh: ()=>void;
}

export function CreateDeal({addr, refresh}: CreateDealProps) {

  const { boox, setErrMsg } = useComBooxContext();

  const [ head, setHead ] = useState<StrHead>(defaultStrHead);
  const [ body, setBody ] = useState<StrBody>(defaultStrBody);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=> {
    refresh();
    setLoading(false);
  }

  const {
    isLoading: addDealLoading,
    write: addDeal,
  } = useInvestmentAgreementAddDeal({
    address: addr,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  const handleClick = ()=>{
    addDeal({
      args: [ 
          codifyHeadOfDeal(head),
          BigInt(body.buyer),
          BigInt(body.groupOfBuyer),
          strNumToBigInt(body.paid, 4),
          strNumToBigInt(body.par, 4),
          BigInt(body.distrWeight)
      ],
    });
  };

  const handleSeqChanged = (e:ChangeEvent<HTMLInputElement>)=> {

    let input = e.target.value;
    onlyInt('SeqOfShare', input, MaxPrice, setValid);

    let seq = input;

    if (parseInt(seq) > 0 && boox) {
      getShare(boox[booxMap.ROS], seq).then(
        res => {
          if (res)
            setHead(v => ({
              ...v,
              priceOfPaid: bigIntToStrNum(BigInt(res.head.priceOfPaid), 4),
              priceOfPar: bigIntToStrNum(BigInt(res.head.priceOfPar), 4),
              classOfShare: res.head.class.toString(),
              seqOfShare: seq,
              seller: res.head.shareholder.toString(),
              votingWeight: res.head.votingWeight.toString(),
            }));
        }
      )
    } else {
      setHead(v => ({
        ...v,
        priceOfPaid: '0',
        priceOfPar: '0',
        classOfShare: '0',
        seqOfShare: '0',
        seller: '0',
        votingWeight: '100',
      }));
    }
  }

  return (
    <Paper elevation={3} sx={{p:1, m:1, border: 1, borderColor:'divider' }} >
      <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
        <b>Create Deal</b>
      </Typography>

      <Stack direction='row' sx={{ alignItems:'center' }} >

        <Stack direction='column' >

          <Stack direction={'row'} sx={{ alignItems: 'center' }} >

            <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 218 }}>
              <InputLabel id="typeOfDeal-label">TypeOfDeal</InputLabel>
              <Select
                labelId="typeOfDeal-label"
                id="typeOfDeal-select"
                label="TypeOfDeal"
                value={ head.typeOfDeal }
                onChange={(e) => setHead((v) => ({
                  ...v,
                  seqOfShare: '0',
                  seller: '0',
                  typeOfDeal: e.target.value,
                }))}
              >
                {TypeOfDeal.slice(0,3).map((v,i) => (
                  <MenuItem key={v} value={i+1}>{v}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{' '}</FormHelperText>
            </FormControl>

            <TextField  
              variant='outlined'
              size="small"
              label='SeqOfCert'
              error={ valid['SeqOfShare']?.error }
              helperText={ valid['SeqOfShare']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 218,
              }}
              onChange={ handleSeqChanged }
              value={ head.seqOfShare } 
            />

            <TextField 
              variant='outlined'
              size="small"
              label='ClassOfShare'
              error={ valid['ClassOfShare']?.error }
              helperText={ valid['ClassOfShare']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 218,
              }}
              onChange={(e) => {
                let input = e.target.value;
                onlyInt('ClassOfShare', input, MaxSeqNo, setValid);
                setHead((v) => ({
                  ...v,
                  classOfShare: input,
                }));
              }}
              value={ head.classOfShare }
            />

            <TextField 
              variant='outlined'
              size="small"
              label='PriceOfPar'
              error={ valid['PriceOfPar']?.error }
              helperText={ valid['PriceOfPar']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 218,
              }}
              onChange={(e) => {
                let input = e.target.value;
                onlyNum('PriceOfPar', input, MaxPrice, 4, setValid);
                setHead((v) => ({
                  ...v,
                  priceOfPar: input,
                }));
              }}
              value={ head.priceOfPar }
            />

            <TextField 
              variant='outlined'
              size="small"
              label='PriceOfPaid'
              error={ valid['PriceOfPaid']?.error }
              helperText={ valid['PriceOfPaid']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 218,
              }}
              onChange={(e) => {
                let input = e.target.value;
                onlyNum('PriceOfPaid', input, MaxPrice, 4, setValid);
                setHead((v) => ({
                  ...v,
                  priceOfPaid: input,
                }));
              }}
              value={ head.priceOfPaid }
            />

            {head.typeOfDeal == '1' && (
              <TextField 
                variant='outlined'
                size="small"
                label='VotingWeight (%)'
                error={ valid['VotingWeight']?.error }
                helperText={ valid['VotingWeight']?.helpTx ?? ' ' }
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                onChange={(e) => {
                  let input = e.target.value;
                  onlyInt('VotingWeight', input, MaxSeqNo, setValid);
                  setHead((v) => ({
                    ...v,
                    votingWeight: input,
                  }));
                }}
                value={ head.votingWeight }
              />
            )}

          </Stack>

          <Stack direction={'row'} sx={{ alignItems: 'center' }} >

            <DateTimeField
              label='ClosingDeadline'
              size="small"
              sx={{
                m:1,
                minWidth: 218,
              }}
              helperText=' '
              value={ stampToUtc(head.closingDeadline) }
              onChange={(date) => setHead((v) => ({
                ...v,
                closingDeadline: utcToStamp(date),
              }))}
              format='YYYY-MM-DD HH:mm:ss'
            />

            <TextField 
              variant='outlined'
              size="small"
              label='Buyer'
              error={ valid['Buyer']?.error }
              helperText={ valid['Buyer']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 218,
              }}
              onChange={(e) => {
                let input = e.target.value;
                onlyInt('Buyer', input, MaxUserNo, setValid);
                setBody((v) => ({
                ...v,
                buyer: input,
                }));
              }}
              value={ body.buyer }
            />

            <TextField 
              variant='outlined'
              size="small"
              label='GroupOfBuyer'
              error={ valid['GroupOfBuyer']?.error }
              helperText={ valid['GroupOfBuyer']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 218,
              }}
              onChange={(e) => {
                let input = e.target.value;
                onlyInt('GroupOfBuyer', input, MaxUserNo, setValid);
                setBody((v) => ({
                ...v,
                groupOfBuyer: input,
                }));
              }}
              value={ body.groupOfBuyer }
            />

            <TextField 
              variant='outlined'
              size="small"
              label='Par'
              error={ valid['Par']?.error }
              helperText={ valid['Par']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 218,
              }}
              onChange={(e) => {
                let input = e.target.value;
                onlyNum('Par', input, MaxData, 4, setValid);
                setBody((v) => ({
                  ...v,
                  par: input,
                }))
              }}
              value={ body.par }
            />

            <TextField 
              variant='outlined'
              size="small"
              label='Paid'
              error={ valid['Paid']?.error }
              helperText={ valid['Paid']?.helpTx ?? ' ' }
              sx={{
                m:1,
                minWidth: 218,
              }}
              onChange={(e) => {
                let input = e.target.value;
                onlyNum('Paid', input, MaxData, 4, setValid);
                setBody((v) => ({
                  ...v,
                  paid: input,
                }));
              }}
              value={ body.paid }
            />

            {head.typeOfDeal == '1' && (
              <TextField 
                variant='outlined'
                size="small"
                label='DistributionWeight (%)'
                error={ valid['DistributionWeight']?.error }
                helperText={ valid['DistributionWeight']?.helpTx ?? ' ' }
                sx={{
                  m:1,
                  minWidth: 218,
                }}
                onChange={(e) => {
                  let input = e.target.value;
                  onlyInt('DistributionWeight', input, MaxSeqNo, setValid);
                  setBody((v) => ({
                    ...v,
                    distrWeight: input,
                  }));
                }}
                value={ body.distrWeight }
              />
            )}

          </Stack>

        </Stack>

        <Divider orientation="vertical" sx={{ m:1 }} flexItem />

        <LoadingButton 
          disabled = { addDealLoading || hasError(valid)}
          loading={loading}
          loadingPosition="end"
          sx={{ m:1, mr:5, p:1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<AddCircle />}
          onClick={ handleClick }
          size='small'
        >
          Add Deal
        </LoadingButton>

      </Stack>

    </Paper>
  );
}



