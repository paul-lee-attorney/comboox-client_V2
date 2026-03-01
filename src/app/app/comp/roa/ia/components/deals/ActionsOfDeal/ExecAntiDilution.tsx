import { useState } from "react";
import { Bytes32Zero, HexType, MaxPrice } from "../../../../../../common";
import { defaultDeal } from "../../../ia";
import { useCompKeeperExecAntiDilution } from "../../../../../../../../../generated";
import { Paper, Stack, TextField } from "@mui/material";
import { LocalDrinkOutlined } from "@mui/icons-material";

import { ActionsOfDealProps } from "../ActionsOfDeal";

import { FormResults, HexParser, defFormResults, hasError, onlyHex, onlyInt, refreshAfterTx } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

export function ExecAntiDilution({addr, deal, setOpen, setDeal, refresh}:ActionsOfDealProps) {

  const { gk, setErrMsg } = useComBooxContext();

  const [ seqOfShare, setSeqOfShare ] = useState<string>('0');
  const [ sigHash, setSigHash ] = useState<HexType>(Bytes32Zero);

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    setDeal(defaultDeal);
    refresh();
    setLoading(false);
    setOpen(false);    
  }

  const {
    isLoading: execAntiDilutionLoading,
    write: execAntiDilution,
  } = useCompKeeperExecAntiDilution({
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
     
  const handleClick = ()=> {
    execAntiDilution({
      args: [ 
          addr, 
          BigInt(deal.head.seqOfDeal), 
          BigInt(seqOfShare),
          sigHash
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
            label='SeqOfTargetShare'
            size="small"
            error={ valid['SeqOfTarget']?.error }
            helperText={ valid['SeqOfTarget']?.helpTx ?? ' ' }
            sx={{
              m:1,
              minWidth: 218,
            }}
            onChange={(e) => {
              let input = e.target.value;
              onlyInt('SeqOfTarget', input, MaxPrice, setValid);
              setSeqOfShare(input);
            }}
            value={ seqOfShare }
          />

          <TextField 
            variant='outlined'
            label='SigHash'
            size="small"
            error={ valid['SigHash']?.error }
            helperText={ valid['SigHash']?.helpTx ?? ' ' }
            sx={{
              m:1,
              minWidth: 685,
            }}
            onChange={(e) => {
              let input = HexParser( e.target.value );
              onlyHex('SigHash', input, 64, setValid);
              setSigHash(input);
            }}
            value={ sigHash }
          />

          <LoadingButton 
            disabled = {execAntiDilutionLoading || deal.body.state > 1 || hasError(valid)}
            loading = {loading}
            loadingPosition="end"
            sx={{ m: 1, minWidth: 128, height: 40 }} 
            variant="contained" 
            endIcon={<LocalDrinkOutlined />}
            onClick={ handleClick }
            size='small'
          >
            Anti Dilution
          </LoadingButton>

        </Stack>

    </Paper>



  );
  
}