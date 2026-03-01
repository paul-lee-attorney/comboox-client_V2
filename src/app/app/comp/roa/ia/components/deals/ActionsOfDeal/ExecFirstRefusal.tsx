import { useEffect, useState } from "react";
import { Bytes32Zero, HexType, booxMap } from "../../../../../../common";
import { defaultDeal } from "../../../ia";
import { useCompKeeperExecFirstRefusal } from "../../../../../../../../../generated";
import { 
  Divider, 
  FormControl, 
  FormHelperText, 
  InputLabel, 
  MenuItem, 
  Paper, 
  Select, 
  Stack, 
  TextField 
} from "@mui/material";
import { EmojiPeopleOutlined } from "@mui/icons-material";
import { ActionsOfDealProps } from "../ActionsOfDeal";
import { getFirstRefusalRules } from "../../../../../roc/sha/sha";
import { FormResults, HexParser, defFormResults, hasError, longSnParser, onlyHex, refreshAfterTx } from "../../../../../../common/toolsKit";
import { getSha } from "../../../../../roc/roc";
import { FirstRefusalRule } from "../../../../../roc/sha/components/rules/FirstRefusalRules/SetFirstRefusalRule";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

export function ExecFirstRefusal({addr, deal, setOpen, setDeal, refresh}:ActionsOfDealProps) {

  const { gk, boox, setErrMsg } = useComBooxContext();

  const [ rules, setRules ] = useState<FirstRefusalRule[]>();
  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  useEffect(()=>{
    if (boox) {
      getSha(boox[booxMap.ROC]).then(
        sha => {
          getFirstRefusalRules(sha).then(
            list => setRules(list)
          );
        }
      )
    }
  }, [boox]);
  
  const [ seqOfRule, setSeqOfRule ] = useState<number>(512);
  const [ seqOfRightholder, setSeqOfRightholder ] = useState<number>(0);

  const [ sigHash, setSigHash ] = useState<HexType>(Bytes32Zero);

  const updateResults = ()=>{
    setDeal(defaultDeal);
    refresh();
    setLoading(false);
    setOpen(false);    
  }

  const {
    isLoading: execFirstRefusalLoading,
    write: execFirstRefusal,
  } = useCompKeeperExecFirstRefusal({
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
    execFirstRefusal({
      args:[ 
        BigInt(seqOfRule),
        BigInt(seqOfRightholder),
        addr, 
        BigInt(deal.head.seqOfDeal), 
        sigHash 
      ],
    });
  };

  const typesOfDeal = ['Capital Increase', 'Share Transfer (Ext)'];

  return (

    <Paper elevation={3} sx={{
      m:1, p:1, 
      border: 1, 
      borderColor:'divider' 
      }} 
    >
        <Stack direction={'row'} sx={{ alignItems:'center'}} >

          <Stack direction='column'>

            <Stack direction='row' sx={{ alignItems:'center' }} >

              <FormControl variant="outlined" size="small" sx={{ m: 1}}>
                <InputLabel id="seqOfRule-label">SeqOfRule</InputLabel>
                <Select
                  labelId="seqOfRule-label"
                  id="seqOfRule-select"
                  label="SeqOfRule"
                  sx={{ minWidth: 258 }} 
                  value={ (seqOfRule - 512).toString() }
                  onChange={(e) => setSeqOfRule(512 + Number(e.target.value))}
                >
                  {rules && rules.map((v, i) => (
                    <MenuItem key={i} value={i.toString()} > {v.seqOfRule} - {typesOfDeal[Number(v.typeOfDeal) - 1]} </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{' '}</FormHelperText>
              </FormControl>

              <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 218 }}>
                <InputLabel id="rightholder-label">Rightholder</InputLabel>
                <Select
                  labelId="rightholder-label"
                  id="rightholder-select"
                  label="Rightholder"
                  value={ seqOfRightholder.toString() }
                  onChange={(e) => setSeqOfRightholder( Number(e.target.value ?? '0') )}
                >
                  {rules && seqOfRule >= 512 && rules[ seqOfRule - 512 ].rightholders.map((v, i) => (
                    <MenuItem key={i} value={i.toString()} > {longSnParser(v.toString())} </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{' '}</FormHelperText>
              </FormControl>

            </Stack>

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
                let input = HexParser(e.target.value);
                onlyHex('SigHash', input, 64, setValid);
                setSigHash( input );
              }}
              value={ sigHash }
            />

          </Stack>
          
          <Divider orientation="vertical" flexItem />

          <LoadingButton 
            disabled = { execFirstRefusalLoading || hasError(valid) }
            loading={loading}
            loadingPosition="end"
            sx={{ m: 1, minWidth: 218, height: 40 }} 
            variant="contained" 
            endIcon={<EmojiPeopleOutlined />}
            onClick={ handleClick }
            size='small'
          >
            First Refusal
          </LoadingButton>

        </Stack>

    </Paper>

  );
  
}