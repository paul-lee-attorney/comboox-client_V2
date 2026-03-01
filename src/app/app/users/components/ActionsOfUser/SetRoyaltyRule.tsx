
import { Paper, Stack, TextField } from '@mui/material';

import { 
  useRegCenterSetRoyaltyRule
} from '../../../../../../generated';

import { AddrOfRegCenter, HexType } from '../../../common';
import { BorderColor } from '@mui/icons-material';
import { useState } from 'react';
import { StrKey, codifyStrRoyaltyRule, defaultStrKey } from '../../../rc';
import { ActionsOfUserProps } from '../ActionsOfUser';
import { FormResults, defFormResults, hasError, onlyInt, onlyNum, refreshAfterTx } from '../../../common/toolsKit';
import { LoadingButton } from '@mui/lab';
import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';

export function SetRoyaltyRule({ refreshList, getUser }:ActionsOfUserProps) {

  const { setErrMsg } = useComBooxContext();

  const [ rule, setRule ] = useState<StrKey>(defaultStrKey);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    getUser();
    refreshList();
    setLoading(false);
  }

  const {
    isLoading: setRoyaltyRuleLoading,
    write: setRoyaltyRule
  } = useRegCenterSetRoyaltyRule({
    address: AddrOfRegCenter,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, refresh);
    }
  })

  const setRoyaltyRuleClick = () => {
    setRoyaltyRule({
      args: [codifyStrRoyaltyRule(rule)]
    });
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          size="small"
          variant='outlined'
          label='DiscountRate (%)'
          error={ valid['DiscountRate']?.error }
          helperText={ valid['DiscountRate']?.helpTx ?? ' ' }                        
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ rule.discount }
          onChange={e => {
            let input = e.target.value;
            onlyNum('DiscountRate', input, 10000n, 2, setValid);
            setRule(v => ({
              ...v,
              discount: input, 
            }));
          }}
        />

        <TextField 
          size="small"
          variant='outlined'
          label='GiftAmt (GLee)'
          error={ valid['GiftAmt']?.error }
          helperText={ valid['GiftAmt']?.helpTx ?? ' ' }                                  
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ rule.gift }
          onChange={e => {
            let input = e.target.value;
            onlyInt('GiftAmt', input, 0n, setValid);
            setRule(v => ({
              ...v,
              gift: input, 
            }));
          }}
        />

        <TextField 
          size="small"
          variant='outlined'
          label='CouponAmt (CBP)'
          error={ valid['CouponAmt']?.error }
          helperText={ valid['CouponAmt']?.helpTx ?? ' ' }                                            
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ rule.coupon }
          onChange={e => {
            let input = e.target.value;
            onlyInt('CouponAmt', input, 0n, setValid);
            setRule(v => ({
              ...v,
              coupon: input, 
            }));
          }}
        />

        <LoadingButton 
          disabled={ setRoyaltyRuleLoading || hasError(valid)} 
          loading={loading}
          loadingPosition='end'
          onClick={ setRoyaltyRuleClick }
          variant='contained'
          sx={{ m:1, ml:2, minWidth:128, height:40 }} 
          endIcon={<BorderColor />}
        >
          Set
        </LoadingButton>

      </Stack>
    </Paper>
  )
}
