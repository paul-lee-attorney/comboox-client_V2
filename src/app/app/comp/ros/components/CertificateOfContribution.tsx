
import { Dispatch, SetStateAction } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";

import { baseToDollar, bigIntToStrNum, dateParser, longDataParser, longSnParser, } from "../../../common/toolsKit";
import { Share, codifyHeadOfShare } from "../ros";

import { ActionsOfCap } from "./ActionsOfCap";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";

export interface CertificateOfContributionProps{
  open: boolean;
  share: Share;
  setOpen: Dispatch<SetStateAction<boolean>>;
  refresh: ()=>void;
}

export function CertificateOfContribution({open, share, setOpen, refresh}: CertificateOfContributionProps) {

  const { onPar } = useComBooxContext();

  return (
    <Dialog
      maxWidth={false}
      open={open}
      onClose={()=>setOpen(false)}
      aria-labelledby="dialog-title" 
    >
      <DialogTitle id="dialog-title" sx={{ mx:2, textDecoration:'underline' }} >
        <b>Certificate Of Contribution - { longSnParser(share.head.seqOfShare.toString()) }</b>
      </DialogTitle>
      <DialogContent>
          <table width={1280} >
            <thead />
            <tbody>
              <tr>
                <td >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfSeqOfShare" 
                    label="SeqOfCert" 
                    variant="outlined"
                    value = { longSnParser(share.head.seqOfShare.toString()) }
                    size='small'
                  />
                </td>

                <td >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfPreSeq" 
                    label="PreSeq" 
                    variant="outlined"
                    value = { longSnParser(share.head.preSeq.toString()) }
                    size='small'
                  />
                </td>
                <td colSpan={2} >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1, backgroundColor:'lightskyblue' }} 
                    id="tfClass" 
                    label="Class" 
                    variant="outlined"
                    value = { longSnParser( share.head.class.toString() )}
                    size='small'
                  />
                </td>

              </tr>
              <tr>
                <td colSpan={2} >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfSn" 
                    label="SN" 
                    variant="outlined"
                    value = { codifyHeadOfShare(share.head) }
                    size='small'
                  />                                                  
                </td>

                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1, backgroundColor:'lightskyblue' }} 
                    id="tfVotingWeight" 
                    label="VotingWeight (%)" 
                    variant="outlined"
                    value = { longDataParser(share.head.votingWeight.toString()) }
                    size='small'
                  />                                                  
                </td>

                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1, backgroundColor:'lightskyblue' }} 
                    id="tfDistrWeight" 
                    label="DistributionWeight (%)" 
                    variant="outlined"
                    value = { longDataParser(share.body.distrWeight.toString()) }
                    size='small'
                  />
                </td>
                          
              </tr>

              <tr>
                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfIssueDate" 
                    label="IssueDate" 
                    variant="outlined"
                    value = { dateParser(share.head.issueDate.toString()) }
                    size='small'
                  />
                </td>

                <td >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfPayInDate" 
                    label="PayInDate" 
                    variant="outlined"
                    value = { dateParser(share.body.payInDeadline.toString()) }
                    size='small'
                  />                                
                </td>

                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1, backgroundColor:'lightskyblue' }} 
                    id="tfVotingPoints" 
                    label="VotingPoints" 
                    variant="outlined"
                    value = { longDataParser(
                      bigIntToStrNum((BigInt(share.head.votingWeight) * 
                        (onPar ? BigInt(share.body.par) : BigInt(share.body.paid)) / 100n), 4)
                    )}
                    size='small'
                  />                                                  
                </td>

                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1, backgroundColor:'lightskyblue' }} 
                    id="tfDistributionPoints" 
                    label="DistributionPoints" 
                    variant="outlined"
                    value = { longDataParser(
                      bigIntToStrNum((BigInt(share.body.distrWeight) * 
                        (onPar ? BigInt(share.body.par) : BigInt(share.body.paid)) / 100n), 4)
                    )}
                    size='small'
                  />                                                  
                </td>

              </tr>

              <tr>
                <td rowSpan={4}>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1, backgroundColor:'lightgoldenrodyellow'}} 
                    multiline
                    rows={6.5}
                    id="tfShareholder" 
                    label="Shareholder" 
                    variant="outlined"
                    value = { longSnParser(share.head.shareholder.toString()) }
                    size='small'
                  />
                </td>
                <td colSpan={3} />
              </tr>

              <tr>
                <td >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfPar" 
                    label="Par" 
                    variant="outlined"
                    value = { baseToDollar(share.body.par.toString()) }
                    size='small'
                  />                
                </td>

                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfPriceOfPar" 
                    label="PriceOfPar" 
                    variant="outlined"
                    value = { baseToDollar(share.head.priceOfPar.toString()) }
                    size='small'
                  />                
                </td>

                <td >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfValueOfParBalance" 
                    label="ValueOfParBalance" 
                    variant="outlined"
                    value = { baseToDollar(((share.body.par - share.body.paid)*BigInt(share.head.priceOfPar) / 10n ** 4n).toString()) }
                    size='small'
                  />                
                </td>

              </tr>

              <tr>
                <td >
                  <TextField
                    fullWidth={true} 
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfPaid" 
                    label="Paid" 
                    variant="outlined"
                    value = { baseToDollar(share.body.paid.toString()) }
                    size='small'
                  />                
                </td>

                <td>
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfPriceOfPaid" 
                    label="PriceOfPaid" 
                    variant="outlined"
                    value = { baseToDollar(share.head.priceOfPaid.toString()) }
                    size='small'
                  />                
                </td>

                <td >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfValueOfPaid" 
                    label="ValueOfPaid" 
                    variant="outlined"
                    value = { baseToDollar((BigInt(share.body.paid) * BigInt(share.head.priceOfPaid) / 10n ** 4n).toString()) }
                    size='small'
                  />                
                </td>

                <td/>
              </tr>

              <tr>
                <td colSpan={2} >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfCleanPaid" 
                    label="CleanPaid" 
                    variant="outlined"
                    value = { baseToDollar(share.body.cleanPaid.toString()) }
                    size='small'
                  />                                
                </td>

                <td >
                  <TextField 
                    fullWidth={true}
                    inputProps={{readOnly: true}}
                    sx={{ m: 1 }} 
                    id="tfValue" 
                    label="Value" 
                    variant="outlined"
                    value = { baseToDollar((BigInt(share.body.paid) * BigInt(share.head.priceOfPaid) / 10n ** 4n 
                      + BigInt(share.body.par - share.body.paid) * BigInt(share.head.priceOfPar) / 10n ** 4n).toString())
                    }
                    size='small'
                  />                                
                </td>
              </tr>

              <tr>
                <td colSpan={4}>

                  {share && (share.body.par != share.body.paid) && (
                    <ActionsOfCap share={share} setDialogOpen={setOpen} refresh={refresh} />
                  )}

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