import { Dispatch, SetStateAction } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";

import { DealProps } from "../lou";
import { baseToDollar, dateParser, longDataParser, longSnParser } from "../../../common/toolsKit";
import { CopyLongStrTF } from "../../../common/CopyLongStr";

interface BillOfDealProps {
  deal: DealProps;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function BillOfDeal({ deal, open, setOpen}: BillOfDealProps) {

  return (
    <Dialog
      maxWidth={false}
      open={open}
      onClose={()=>setOpen(false)}
      aria-labelledby="dialog-title" 
    >
      <Stack direction='row' sx={{ justifyContent:'space-between', alignItems:'center' }} >
        <DialogTitle id="dialog-title" sx={{ mx:2, textDecoration:'underline' }} >
          <b>Bill Of Deal</b>
        </DialogTitle>

        <Typography variant="body2" sx={{ mx:5, textDecoration:'underline'}}>
          {longSnParser(deal.blockNumber.toString())} / {dateParser(deal.timestamp.toString())}
        </Typography>
      </Stack>
      <DialogContent> 
        <table width={880} >
          <thead />
          <tbody>

            <tr>
              <td>
                <TextField 
                  variant='outlined'
                  fullWidth
                  label='ClassOfShare'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                  }}
                  value={ deal.classOfShare }
                />
              </td>
              <td>
                <TextField 
                  variant='outlined'
                  fullWidth
                  label='VotingWeight (%)'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                  }}
                  value={ longDataParser(deal.votingWeight.toString()) }
                />
              </td>
              <td>
                <TextField 
                  variant='outlined'
                  fullWidth
                  label='DistributionWeight (%)'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                  }}
                  value={ longDataParser(deal.distrWeight.toString()) }
                />
              </td>

            </tr>

            <tr>
              <td rowSpan={2}>
                <TextField 
                  variant='outlined'
                  fullWidth
                  label='SeqOfCert'
                  inputProps={{readOnly: true}}
                  size="small"
                  multiline
                  rows={4}
                  sx={{
                    m:1,
                  }}
                  value={ deal.seqOfShare }
                />
              </td>

              <td>
                <TextField 
                  variant='outlined'
                  fullWidth
                  label='Paid'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                  }}
                  value={ baseToDollar(deal.paid.toString()) }
                />
              </td>
              <td>
                <TextField 
                  variant='outlined'
                  fullWidth
                  label='PriceOfPaid'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                  }}
                  value={ baseToDollar(deal.price.toString()) }
                />
              </td>
            </tr>
            <tr>
              <td >
                <TextField 
                  variant='outlined'
                  fullWidth
                  label='TotalAmount'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                  }}
                  value={ baseToDollar(
                    (deal.paid * BigInt(deal.price) / 10000n).toString()  
                  )}
                />
              </td>
              <td >
                <TextField 
                  variant='outlined'
                  fullWidth
                  label='Consideration(USD)'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                  }}
                  value={ baseToDollar((deal.consideration / 10n ** 14n).toString())}
                />
              </td>

            </tr>

            <tr>
              <td>
                <TextField 
                  variant='outlined'
                  fullWidth
                  label='GroupOfBuyer'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                  }}
                  value={ longSnParser(deal.groupRep.toString()) }
                />
              </td>
              <td>
                <TextField 
                  variant='outlined'
                  fullWidth
                  label='Buyer'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                  }}
                  value={ longSnParser(deal.buyer.toString()) }
                />
              </td>
              <td>
                <CopyLongStrTF title="TransactionHash" src={deal.transactionHash} />
              </td>

            </tr>


          </tbody>
        </table>

      </DialogContent>

      <DialogActions>
        <Button variant='outlined' sx={{ m:1, mx:3 }} onClick={()=>setOpen(false)}>Close</Button>
      </DialogActions>

    </Dialog>
  );
}

