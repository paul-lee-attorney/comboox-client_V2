
import { useState } from 'react';


import { Paper, Stack, TextField } from '@mui/material';
import { BorderColor } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import { 
  useRegCenterSetPlatformRule,
} from '../../../../../../generated';

import { useComBooxContext } from '../../../../_providers/ComBooxContextProvider';

import { AddrOfRegCenter, HexType, MaxUserNo } from '../../../common';
import { FormResults, defFormResults, hasError, onlyNum, refreshAfterTx } from '../../../common/toolsKit';
import { StrRule, codifyPlatformStrRule, defaultStrRule } from '../../../rc';

import { ActionsOfOwnerProps } from '../ActionsOfOwner';

export function SetPlatformRule({ refresh }:ActionsOfOwnerProps) {

  const { setErrMsg } = useComBooxContext();

  const [ rule, setRule ] = useState<StrRule>(defaultStrRule);
  const [ valid, setValid ] = useState<FormResults>(defFormResults);

  const [loading, setLoading] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: setPlatformRuleLoading,
    write: setPlatformRule
  } = useRegCenterSetPlatformRule({
    address: AddrOfRegCenter,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  })

  const setPlatformRuleClick = ()=>{
    setPlatformRule({args:[
      codifyPlatformStrRule(rule)
    ]})
  }

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }}  >
      <Stack direction='row' sx={{ alignItems:'start' }} >

        <TextField 
          size="small"
          variant='outlined'
          label='EOA_Rewards(CBP)'
          error = { valid['EOA_Rewards']?.error }
          helperText = { valid['EOA_Rewards']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ rule.eoaRewards }
          onChange={e => {
            let input = e.target.value;
            onlyNum('EOA_Rewards', input, MaxUserNo, 9, setValid);
            setRule(v => ({
              ...v,
              eoaRewards: input, 
            }));
          }}
        />

        <TextField 
          size="small"
          variant='outlined'
          label='COA_Rewards(CBP)'
          error = { valid['COA_Rewards']?.error }
          helperText = { valid['COA_Rewards']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ rule.coaRewards }
          onChange={e => {
            let input = e.target.value;
            onlyNum('COA_Rewards', input, MaxUserNo, 9, setValid);            
            setRule(v => ({
              ...v,
              coaRewards: input, 
            }));
        }}
        />

        <TextField 
          size="small"
          variant='outlined'
          label='FloorOfRoyalty(CBP)'
          error = { valid['FloorOfRoyalty']?.error }
          helperText = { valid['FloorOfRoyalty']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ rule.floor }
          onChange={e => {
            let input = e.target.value;
            onlyNum('FloorOfRoyalty', input, MaxUserNo, 9, setValid);
            setRule(v => ({
              ...v,
              floor: input, 
            }));
          }}
        />

        <TextField 
          size="small"
          variant='outlined'
          label='OffRateOnCommission (%)'
          error = { valid['OffRate']?.error }
          helperText = { valid['OffRate']?.helpTx ?? ' ' }
          sx={{
            m:1,
            minWidth: 128,
          }}
          value={ rule.rate }
          onChange={e => {
            let input = e.target.value;
            onlyNum('OffRate', input, 2000n, 2, setValid);
            setRule(v =>({
                ...v,
                rate: input, 
            }));
          }}
        />

        <LoadingButton 
          disabled={ setPlatformRuleLoading || hasError(valid)} 
          loading={loading}
          loadingPosition='end'
          onClick={ setPlatformRuleClick }
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
