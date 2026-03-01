import { Dispatch, SetStateAction } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";

import { Order } from "../loe";
import { baseToDollar, bigIntToStrNum, dateParser, longDataParser, longSnParser } from "../../../common/toolsKit";

interface BillOfOrderProps {
  order: Order;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function BillOfOrder({ order, open, setOpen}: BillOfOrderProps) {

  return (
    <Dialog
      maxWidth={false}
      open={open}
      onClose={()=>setOpen(false)}
      aria-labelledby="dialog-title" 
    >
      <Stack direction='row' sx={{ justifyContent:'space-between', alignItems:'center' }} >
        <DialogTitle id="dialog-title" sx={{ mx:2, textDecoration:'underline' }} >
          <b>Bill Of {order.node.isOffer ? 'Sale' : 'Buy'}</b> - ({ longSnParser(order.node.seq.toString())})
        </DialogTitle>

      </Stack>
      <DialogContent> 
        <table width={1180} >
          <thead />
          <tbody>

            <tr>
              <td>
                <TextField 
                  variant='outlined'
                  fullWidth
                  label='Issuer'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                  }}
                  value={ longSnParser(order.node.issuer.toString()) }
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
                  value={ baseToDollar(order.node.paid.toString()) }
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
                  value={ baseToDollar(order.node.price.toString()) }
                />
              </td>
              <td>
                <TextField 
                  variant='outlined'
                  fullWidth
                  label='ExpireDate'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                  }}
                  value={ dateParser(order.node.expireDate.toString()) }
                />
              </td>
            </tr>

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
                  value={ longSnParser(order.data.classOfShare.toString()) }
                />
              </td>
              <td>
                <TextField 
                  variant='outlined'
                  fullWidth
                  label='SeqOfCert'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                  }}
                  value={ longSnParser(order.data.seqOfShare.toString()) }
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
                  value={ longDataParser(order.data.votingWeight.toString()) }
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
                  value={ longDataParser(order.data.distrWeight.toString()) }
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
                  value={ longSnParser(order.data.groupRep.toString()) }
                />
              </td>

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
                    (order.node.paid * BigInt(order.node.price) / 10000n).toString()  
                  )}
                />
              </td>

              <td colSpan={2} >
                <TextField 
                  variant='outlined'
                  fullWidth
                  label='Margin (ETH)'
                  inputProps={{readOnly: true}}
                  size="small"
                  sx={{
                    m:1,
                  }}
                  value={ bigIntToStrNum(order.data.margin, 18)}
                />
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

