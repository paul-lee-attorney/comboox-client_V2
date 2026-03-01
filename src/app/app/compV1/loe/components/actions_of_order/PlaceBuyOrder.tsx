
import { useState } from "react";

import { Alert, Collapse, IconButton, Paper, Stack, TextField, Tooltip } from "@mui/material";

import {  Close, HelpOutline, ShoppingCartOutlined } from "@mui/icons-material";
import { useGeneralKeeperPlaceBuyOrder } from "../../../../../../../generated-v1";
import { ActionsOfOrderProps } from "../ActionsOfOrder";
import { InitOffer, defaultOffer } from "../../loe";
import { FormResults, bigIntToStrNum, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx, removeKiloSymbol, strNumToBigInt } from "../../../../common/toolsKit";
import { getCentPrice } from "../../../gk";
import { HexType, MaxData, MaxPrice, MaxSeqNo } from "../../../../common";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function PlaceBuyOrder({ classOfShare, refresh }: ActionsOfOrderProps) {
  const { gk, setErrMsg } = useComBooxContext();

  const [ order, setOrder ] = useState<InitOffer>(defaultOffer);
  const [ value, setValue ] = useState<string>('0');

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: placeBuyOrderLoading,
    write:placeBuyOrder,
  } = useGeneralKeeperPlaceBuyOrder({
    address: gk,
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
    placeBuyOrder({
      args: [ 
        BigInt(classOfShare),
        strNumToBigInt(order.paid, 4),
        strNumToBigInt(order.price, 4),
        strNumToBigInt(order.execHours, 0)
      ],
      value: strNumToBigInt(value, 9) * (10n ** 9n),
    });
  };

  const [ valueOfOrder, setValueOfOrder ] = useState<bigint>(0n);
  const [ open, setOpen ] = useState<boolean>(false);
  const getValueOfOrder = async () => {
    if ( gk ) {
      let centPrice = await getCentPrice( gk );
      let output = strNumToBigInt(order.paid, 4) * strNumToBigInt(order.price, 4) 
        / 10n ** 4n * centPrice / 100n;
      setValueOfOrder(output);
      setOpen(true);
    }
  }

  return (

    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >

      <Stack direction={'row'} sx={{ alignItems:'start'}} >

        <TextField 
          variant='outlined'
          size="small"
          label='ExecHours'
          error={ valid['ExecHours']?.error }
          helperText={ valid['ExecHours']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyInt('ExecHours', input, MaxSeqNo, setValid);
            setOrder( v => ({
              ...v,
              execHours: input,
            }));
          }}
          value={ order.execHours.toString() } 
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
          onChange={ e => {
            let input = e.target.value;
            onlyNum('Paid', input, MaxData, 4, setValid);
            setOrder( v => ({
              ...v,
              paid: input,
            }));
          }}

          value={ order.paid.toString() } 
        />

        <TextField 
          variant='outlined'
          size="small"
          label='Price'
          error={ valid['Price']?.error }
          helperText={ valid['Price']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 218,
          }}
          onChange={ e => {
            let input = e.target.value;
            onlyNum('Price', input, MaxPrice, 4, setValid);
            setOrder( v => ({
              ...v,
              price: input,
            }));
          }}

          value={ order.price.toString() } 
        />

        <TextField 
          variant='outlined'
          label='Consideration (ETH)'
          size="small"
          error={ valid['Consideration']?.error }
          helperText={ valid['Consideration']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 288,
          }}
          value={ value }
          onChange={(e)=>{
            let input = removeKiloSymbol(e.target.value);
            onlyNum('Consideration', input, 0n, 9, setValid);
            setValue(input);
          }}
        />

        <LoadingButton 
          disabled = { placeBuyOrderLoading || hasError(valid) }
          loading={loading}
          loadingPosition="end"
          sx={{ m: 1, minWidth: 218, height: 40 }} 
          variant="contained" 
          endIcon={<ShoppingCartOutlined />}
          onClick={ handleClick }
          size='small'
        >
          Buy
        </LoadingButton>

        <Tooltip
          title='ValueInGwei'
          placement="top"
          arrow
        >
          <IconButton 
            disabled = { gk == undefined }
            onClick={getValueOfOrder}
            size='small'
          >
            <HelpOutline />
          </IconButton>
        </Tooltip>

        <Collapse in={open} sx={{width:"20%"}}>        
          <Alert 
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setOpen(false);
                }}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }

            variant='outlined' 
            severity='info'
            sx={{ height: 50,  m: 1, }} 
          >
            { bigIntToStrNum((valueOfOrder / (10n**9n)), 9) + ' (ETH)'}
          </Alert>
        </Collapse>



      </Stack>
      
    </Paper>

  );  

}