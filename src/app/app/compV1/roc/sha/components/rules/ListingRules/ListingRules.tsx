import { useEffect, useState } from "react";
import { 
  Stack,
  IconButton,
  Paper,
  Toolbar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import {
  AddCircle,
  ListAlt,
  RemoveCircle,
} from "@mui/icons-material"
import {
  useShareholdersAgreementRemoveRule 
} from "../../../../../../../../../generated-v1";
import { SetListingRule } from "./SetListingRule";
import { GroupRulesSettingProps } from "../VotingRules/VotingRules";
import { HexType } from "../../../../../../common";
import { refreshAfterTx } from "../../../../../../common/toolsKit";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";

export function ListingRules({sha, initSeqList, isFinalized, time, refresh}: GroupRulesSettingProps) {

  const { setErrMsg } = useComBooxContext();

  const mandatoryRule: number[] = isFinalized ? [] : [1024];
  const [ cp, setCp ] = useState(mandatoryRule);
  const [open, setOpen] = useState(false);

  useEffect(()=>{
    if (initSeqList && initSeqList.length > 0) {
      setCp(v => {
        let setRules = new Set([...v]);
        initSeqList.forEach(k => {
          setRules.add(k)
        });
        let arrRules = Array.from(setRules).sort(
          (a, b) => (a-b)
        );
        return arrRules;
      })
    }
  }, [initSeqList]);

  const addCp = () => {
    setCp(v => {
      let arr = [...v];
      arr.push(v[v.length - 1]+1);
      return arr;
    })
  }

  const [ loading, setLoading ] = useState(false);

  const udpateResults = ()=> {
    if (cp.length > 1) {
      setCp(v => {
        let arr = [...v];
        arr.pop();
        return arr;
      });
    }
    setLoading(false);
    setOpen(false);
  }

  const {
    isLoading: removeRuleLoading,
    write: removeRule,
  } = useShareholdersAgreementRemoveRule({
    address: sha,
    args: cp && cp.length > 0 ? [BigInt(cp[cp.length - 1])] : undefined,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, udpateResults);
    }
  });

  return (
    <>
      <Button
        variant={ initSeqList && (initSeqList.length > 0) ? "contained" : "outlined" }
        startIcon={<ListAlt />}
        sx={{ m:0.5, minWidth: 248, justifyContent:'start' }}
        onClick={()=>setOpen(true)} 
      >
        Listing Rules 
      </Button>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={ ()=>setOpen(false) }
        aria-labelledby="dialog-title"
      >
        <DialogContent>

          <Paper elevation={3} sx={{ m:1, p:1, border:1, borderColor:'divider' }}>
            <Box sx={{ width:1180 }}>

              <Stack direction={'row'} sx={{ alignItems:'center' }}>
                <Toolbar sx={{ textDecoration:'underline' }}>
                  <h4>Listing Rules</h4>
                </Toolbar>

                {!isFinalized && cp && (
                  <>
                    <IconButton 
                      sx={{width: 20, height: 20, m: 1, p: 1}} 
                      onClick={ addCp }
                      color="primary"
                    >
                      <AddCircle/>
                    </IconButton>
                    <IconButton 
                      disabled={ cp.length < 1 || removeRuleLoading || !removeRule || loading }
                      sx={{width: 20, height: 20, m: 1, p: 1, }} 
                      onClick={()=>removeRule?.() }
                      color="primary"
                    >
                      <RemoveCircle/>
                    </IconButton>
                  </>
                )}

              </Stack>

              <Grid container spacing={0.5} >

                {cp.map(v=> (
                  <Grid key={ v } item xs={3} >
                    <SetListingRule  sha={ sha } seq={ v } isFinalized={ isFinalized } time={ time } refresh={refresh} />
                  </Grid>
                ))}

              </Grid>

            </Box>
          </Paper>

        </DialogContent>

        <DialogActions>
            <Button variant="outlined" sx={{ m:1, mx:3 }} onClick={ ()=>setOpen(false) }>Close</Button>
        </DialogActions>

      </Dialog>
    
    </>
  );
} 

