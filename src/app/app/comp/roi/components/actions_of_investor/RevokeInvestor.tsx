import { Paper, Stack, TextField, } from "@mui/material";

import { PersonRemoveOutlined } from "@mui/icons-material";
import { useState } from "react";
import { useCompKeeperRevokeInvestor } from "../../../../../../../generated";
import { ActionsOfInvestorProps } from "../ActionsOfInvestor";
import { HexType, MaxSeqNo, MaxUserNo } from "../../../../common";
import { FormResults, defFormResults, hasError, onlyInt, refreshAfterTx } from "../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";


export function RevokeInvestor({ acct, refresh }: ActionsOfInvestorProps) {
  const { gk, setErrMsg } = useComBooxContext();

  const [ userNo, setUserNo ] = useState<string>(acct);
  const [ seqOfLR, setSeqOfLR ] = useState<string>('1024');
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: revokeInvestorLoading,
    write:revokeInvestor,
  } = useCompKeeperRevokeInvestor({
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
    revokeInvestor({
      args: [ 
        BigInt(userNo), 
        BigInt(seqOfLR)
      ],
    });
  };
      
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
            label='UserNo'
            error={ valid['UserNo']?.error }
            helperText={ valid['UserNo']?.helpTx ?? ' ' }
            sx={{
              m:1,
              minWidth: 218,
            }}
            onChange={ e => {
              let input = e.target.value;
              onlyInt('UserNo', input, MaxUserNo, setValid);
              setUserNo(input); 
            }}
            value={ userNo } 
          />

          <TextField 
            variant='outlined'
            size="small"
            label='SeqOfListingRule'
            error={ valid['SeqOfLR']?.error }
            helperText={ valid['SeqOfLR']?.helpTx ?? ' ' }
            sx={{
              m:1,
              minWidth: 218,
            }}
            onChange={ e => {
              let input = e.target.value;
              onlyInt('SeqOfLR', input, MaxSeqNo, setValid);
              setSeqOfLR( input );
            }}
            value={ seqOfLR } 
          />

          <LoadingButton 
            disabled = { revokeInvestorLoading || hasError(valid)}
            loading={loading}
            loadingPosition="end"
            sx={{ m: 1, minWidth: 218, height: 40 }} 
            variant="contained" 
            endIcon={<PersonRemoveOutlined />}
            onClick={ handleClick }
            size='small'
          >
            Revoke
          </LoadingButton>

        </Stack>

    </Paper>

  );  

}