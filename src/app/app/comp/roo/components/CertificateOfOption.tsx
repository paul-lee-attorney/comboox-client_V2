import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Stack, 
  TextField, 
  Typography
} from "@mui/material";

import { baseToDollar, bigIntToNum, bigIntToStrNum, dateParser, longDataParser, longSnParser, splitStrArr } from "../../../common/toolsKit";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { statesOfOpt } from "../../roc/sha/components/terms/Options/ContentOfOpt";
import { OraclesList } from "./OraclesList";
import { ActionsOfOption } from "./ActionsOfOption";
import { SwapsList } from "./SwapsList";
import { Swap, CheckPoint, OptWrap, comOps, logOps, typeOfOpts, getAllOraclesOfOption, getAllSwapsOfOption } from "../roo";
import { booxMap } from "../../../common";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";

export interface CertificateOfOptionProps{
  open: boolean;
  optWrap: OptWrap;
  setOpen: Dispatch<SetStateAction<boolean>>;
  refresh: ()=>void;
}

export function CertificateOfOption({open, optWrap, setOpen, refresh}: CertificateOfOptionProps) {

  const { boox } = useComBooxContext();

  const [ oracles, setOracles ] = useState<readonly CheckPoint[]>();
  const [ swaps, setSwaps ] = useState<readonly Swap[]>();

  useEffect(()=>{
    if (boox && optWrap.opt.head.seqOfOpt > 0) {
      getAllOraclesOfOption(boox[booxMap.ROO], optWrap.opt.head.seqOfOpt)
        .then(res => setOracles(res));
      getAllSwapsOfOption(boox[booxMap.ROO], optWrap.opt.head.seqOfOpt)
        .then(res => setSwaps(res));   
    }
  }, [boox, optWrap]);
  
  return (
    <Dialog
      maxWidth={false}
      open={open}
      onClose={()=>setOpen(false)}
      aria-labelledby="dialog-title" 
    >
      <Stack direction='row' sx={{ alignItems:'center', justifyContent:'space-between' }} >
        <DialogTitle id="dialog-title" sx={{ ml:1, textDecoration:'underline' }} >
          <b>Certificate Of Option</b>
        </DialogTitle>

        <Typography variant="body1" sx={{ textDecoration:'underline', mx:5 }}>
          <b>Seq. { longSnParser(optWrap.opt.head.seqOfOpt.toString())}</b>
        </Typography>

      </Stack>                
      <DialogContent>
        <table width={980} >
          <thead />
          <tbody>
            <tr>
              <td>
                <TextField 
                  fullWidth
                  inputProps={{readOnly: true}}
                  sx={{ m: 1 }} 
                  id="tfTypeOfOpt" 
                  label="TypeOfOpt" 
                  variant="outlined"
                  value = { typeOfOpts[optWrap.opt.head.typeOfOpt] }
                  size='small'
                />
              </td>
              <td>
                <TextField 
                  fullWidth
                  inputProps={{readOnly: true}}
                  sx={{ m: 1 }} 
                  id="tfClassOfShare" 
                  label="ClassOfShare" 
                  variant="outlined"
                  value = { optWrap.opt.head.classOfShare }
                  size='small'
                />
              </td>
              <td>
                <TextField 
                  fullWidth
                  inputProps={{readOnly: true}}
                  sx={{ m: 1 }} 
                  id="tfRateOfOpt" 
                  label="RateOfOpt" 
                  variant="outlined"
                  value = { baseToDollar(optWrap.opt.head.rate.toString()) }
                  size='small'
                />
              </td>
              <td>
                <TextField 
                  fullWidth
                  inputProps={{readOnly: true}}
                  size='small'
                  sx={{ m: 1 }} 
                  id="tfStateOfOpt" 
                  label="StateOfOpt" 
                  variant="outlined"
                  value = { statesOfOpt[optWrap.opt.body.state] }
                />
              </td>

            </tr>

            <tr>
              <td>
                <TextField 
                  fullWidth
                  inputProps={{readOnly: true}}
                  sx={{ m: 1 }} 
                  id="tfIssueDate" 
                  label="IssueDate" 
                  variant="outlined"
                  value = { dateParser(optWrap.opt.head.issueDate.toString()) }
                  size='small'
                />
              </td>
              <td>
                <TextField 
                  fullWidth
                  inputProps={{readOnly: true}}
                  sx={{ m: 1 }} 
                  id="tfTriggerDate" 
                  label="TriggerDate" 
                  variant="outlined"
                  value = { dateParser(optWrap.opt.head.triggerDate.toString()) }
                  size='small'
                />                  
              </td>
              <td>
                <TextField 
                  fullWidth
                  inputProps={{readOnly: true}}
                  sx={{ m: 1 }} 
                  id="tfExecDeadline" 
                  label="ExecDeadline" 
                  variant="outlined"
                  value = { dateParser((optWrap.opt.head.triggerDate + Number(optWrap.opt.head.execDays) * 86400).toString()) }
                  size='small'
                />                  
              </td>
              <td>
                <TextField 
                  fullWidth
                  inputProps={{readOnly: true}}
                  sx={{ m: 1,  }} 
                  id="tfClosingDeadline" 
                  label="ClosingDeadline" 
                  variant="outlined"
                  value = { dateParser(optWrap.opt.body.closingDeadline.toString()) }
                  size='small'
                />
              </td>
            </tr>

            <tr>
              <td>
                <TextField 
                  fullWidth
                  inputProps={{readOnly: true}}
                  sx={{ m: 1,  }} 
                  id="tfPaid" 
                  label="Paid" 
                  variant="outlined"
                  value = { bigIntToStrNum(optWrap.opt.body.paid, 4) }
                  size='small'
                />
              </td>
              <td>
                <TextField 
                  fullWidth
                  inputProps={{readOnly: true}}
                  sx={{ m: 1,  }} 
                  id="tfPar" 
                  label="Par" 
                  variant="outlined"
                  value = { bigIntToStrNum(optWrap.opt.body.par, 4) }
                  size='small'
                />
              </td>
              <td>
                <TextField 
                  fullWidth
                  inputProps={{readOnly: true}}
                  sx={{ m: 1,  }} 
                  id="tfRightholder" 
                  label="Rightholder" 
                  variant="outlined"
                  value = { longSnParser(optWrap.opt.body.rightholder.toString()) }
                  size='small'
                />
              </td>
              <td>
                <TextField 
                  variant='outlined'
                  label='Obligors'
                  fullWidth
                  inputProps={{readOnly: true}}
                  size='small'
                  sx={{ m:1 }}
                  multiline
                  rows={1}
                  value={ splitStrArr(optWrap.obligors.map(v => longSnParser(v.toString()))) }
                />
              </td>
            </tr>

            {optWrap.opt.head.typeOfOpt > 3 && (
              <tr>
                <td >
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfSeqOfCond" 
                    label="SeqOfCond" 
                    variant="outlined"
                    value = { longSnParser(optWrap.opt.cond.seqOfCond.toString()) }
                    size='small'
                  />                
                </td>
                <td >
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfLogicOpr" 
                    label="LogicOperator" 
                    variant="outlined"
                    value = { logOps[optWrap.opt.cond.logicOpr] }
                    size='small'
                  />                
                </td>
                <td >
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfCompOpr1" 
                    label="CompareOperator_1" 
                    variant="outlined"
                    value = { comOps[optWrap.opt.cond.compOpr1] }
                    size='small'
                  />
                </td>
                <td >
                  <TextField 
                    fullWidth
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfPara1" 
                    label="Parameter_1" 
                    variant="outlined"
                    value = { bigIntToStrNum(optWrap.opt.cond.para1, 4) }
                    size='small'
                  />
                </td>
              </tr>
            )}

            <tr>
              {optWrap.opt.cond.logicOpr > 0 && (
                <>
                  <td >
                    <TextField 
                      fullWidth
                      inputProps={{readOnly: true}}
                      sx={{ m: 1 }} 
                      id="tfCompOpr2" 
                      label="CompareOperator_2" 
                      variant="outlined"
                      value = { comOps[optWrap.opt.cond.compOpr2] }
                      size='small'
                    />                
                  </td>
                  <td >
                    <TextField 
                      fullWidth
                      inputProps={{readOnly: true}}
                      sx={{ m: 1 }} 
                      id="tfPara1" 
                      label="Parameter_2" 
                      variant="outlined"
                      value = { bigIntToStrNum(optWrap.opt.cond.para2, 4) }
                      size='small'
                    />                
                  </td>
                </>                
              )}
              {optWrap.opt.cond.logicOpr > 4 && (
                <>
                  <td >
                      <TextField 
                        fullWidth
                        inputProps={{readOnly: true}}
                        sx={{ m: 1 }} 
                        id="tfCompOpr3" 
                        label="CompareOperator_3" 
                        variant="outlined"
                        value = { comOps[optWrap.opt.cond.compOpr3] }
                        size='small'
                      />                
                  </td>
                  <td >
                    <TextField 
                      fullWidth
                      inputProps={{readOnly: true}}
                      sx={{ m: 1 }} 
                      id="tfPara1" 
                      label="Parameter_3" 
                      variant="outlined"
                      value = { bigIntToStrNum(optWrap.opt.cond.para3, 4) }
                      size='small'
                    />                
                  </td>
                </>
              )}                
            </tr>

            <tr>

              <td colSpan={2}>
                {swaps && swaps.length > 0 && (
                  <SwapsList list={ swaps } seqOfOpt={optWrap.opt.head.seqOfOpt} refresh={refresh} />
                )}
              </td>
              
              <td colSpan={2}>
                {oracles && oracles.length > 0 && (
                  <OraclesList list={ oracles }  seqOfOpt={optWrap.opt.head.seqOfOpt}  />
                )}
              </td>

            </tr>

            <tr>
              <td colSpan={4}>
                <ActionsOfOption 
                  seqOfOpt={optWrap.opt.head.seqOfOpt} 
                  setOpen={setOpen} 
                  refresh = { refresh } 
                />
              </td>
            </tr>

          </tbody>
        </table>

      </DialogContent>
      <DialogActions>
        <Button variant="outlined" sx={{ m:1, mx:3 }} onClick={()=>setOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>

  )
}