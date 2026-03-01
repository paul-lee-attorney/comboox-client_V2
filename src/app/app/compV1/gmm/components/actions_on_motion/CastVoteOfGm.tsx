import { useState } from "react";

import { useGeneralKeeperCastVoteOfGm } from "../../../../../../../generated-v1";

import { Box, Collapse, FormControl, FormHelperText, InputLabel, MenuItem, 
  Paper, Select, Stack, Switch, TextField, Toolbar, Typography 
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { HowToVote, } from "@mui/icons-material";

import { Bytes32Zero, HexType, booxMap } from "../../../../common";
import { FormResults, HexParser, defFormResults, 
  hasError, onlyHex, refreshAfterTx 
} from "../../../../common/toolsKit";

import { EntrustDelegaterForGeneralMeeting } from "./EntrustDelegaterForGeneralMeeting";

import { VoteResult } from "../VoteResult";

import { ActionsOnMotionProps } from "../ActionsOnMotion";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export function CastVoteOfGm({ motion, setOpen, refresh }: ActionsOnMotionProps) {

  const { gk, boox, setErrMsg } = useComBooxContext();

  const [ valid, setValid ] = useState<FormResults>(defFormResults);
  const [ loading, setLoading ] = useState(false);

  const [ attitude, setAttitude ] = useState<string>('1');
  const [ sigHash, setSigHash ] = useState<HexType>(Bytes32Zero);

  const updateResults = ()=>{
    refresh();
    setOpen(false);
  };

  const {
    isLoading: castVoteLoading,
    write: castVote,
  } = useGeneralKeeperCastVoteOfGm({
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
    castVote({
      args: [
        motion.head.seqOfMotion, 
        BigInt(attitude), 
        sigHash
      ],
    });
  }

  const [ appear, setAppear ] = useState(false);

  return (
    <Paper elevation={3} sx={{m:1, p:1, color:'divider', border:1 }} >
      <Stack direction={'row'} sx={{ alignItems:'center', color:'black' }} >

        <Box sx={{ minWidth:200 }} >
          <Toolbar >
            <h4>Cast Vote: </h4>
          </Toolbar>
        </Box>

        <Typography>
          Vote Directly
        </Typography>

        <Switch 
          color="primary" 
          onChange={(e) => setAppear( e.target.checked )} 
          checked={ appear } 
        />

        <Typography>
          Entrust Delegate
        </Typography>

      </Stack>

      <Collapse in={ !appear } >

        <Stack direction="row" sx={{ alignItems:'start' }} >

          <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="attitude-lable">Attitude</InputLabel>
            <Select
              labelId="attitude-lable"
              id="attitude-select"
              value={ attitude }
              onChange={(e) => setAttitude(e.target.value)}
              size="small"
              label="Attitude"
            >
              <MenuItem value={'1'}>Support</MenuItem>
              <MenuItem value={'2'}>Against</MenuItem>
              <MenuItem value={'3'}>Abstain</MenuItem>
            </Select>
            <FormHelperText>{' '}</FormHelperText>
          </FormControl>

          <TextField 
            sx={{ m: 1, minWidth: 650 }} 
            id="tfHashOfAction" 
            label="SigHash / CID in IPFS" 
            variant="outlined"
            error={ valid['SigHash']?.error }
            helperText={ valid['SigHash']?.helpTx ?? ' ' }
            onChange={e => {
              let input = HexParser( e.target.value );
              onlyHex('SigHash', input, 64, setValid); 
              setSigHash(input);
            }}
            value = { sigHash }
            size='small'
          />                                            

          <LoadingButton
            disabled={ castVoteLoading || hasError(valid)}
            loading={loading}
            loadingPosition="end"
            variant="contained"
            endIcon={<HowToVote />}
            sx={{ m:1, height:40, minWidth:128 }}
            onClick={ handleClick }
          >
            Vote
          </LoadingButton>
        </Stack>

          {boox && (
            <VoteResult addr={boox[booxMap.GMM]} seqOfMotion={motion.head.seqOfMotion} />
          )}

      </Collapse>

      <Collapse in={ appear } >
        <EntrustDelegaterForGeneralMeeting motion={motion} setOpen={setOpen} refresh={refresh} />
      </Collapse>

    </Paper>
  );
}



