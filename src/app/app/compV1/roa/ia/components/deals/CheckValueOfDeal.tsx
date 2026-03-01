import { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Typography } from "@mui/material";
import { HelpOutline } from "@mui/icons-material";
import { longDataParser, weiToEth } from "../../../../../common/toolsKit";
import { checkValueOfDeal } from "../../ia";
import { SwapsListProps } from "./SwapsList";

export function CheckValueOfDeal({addr, deal}: SwapsListProps) {

  const [ value, setValue ] = useState<bigint>(0n);

  useEffect(()=>{
    checkValueOfDeal(addr, deal.head.seqOfDeal).then(
      res => setValue(res)
    );
  }, [addr, deal.head.seqOfDeal]);

  const [ open, setOpen ] = useState<boolean>(false);

  const handleClick = () => {
    setOpen(true);
  }

  return (
    <>
      <Button
        variant="outlined"
        fullWidth
        startIcon={<HelpOutline />}
        sx={{ m:1, height: 40 }}
        onClick={ handleClick }
      >
        Value: {weiToEth(value.toString()) + ' (ETH)'}
      </Button>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title"
      >

        <DialogTitle id="dialog-title" sx={{ textDecoration:'underline' }} >
          <b>Value Of Deal - {deal.head.seqOfDeal}</b>
        </DialogTitle>

        <DialogContent>

          <Paper elevation={3} sx={{ m:1, p:3, border:1, borderColor:'divider' }} >

            <Typography variant="h6">
              {'ETH: ' +  longDataParser(weiToEth(value.toString())) }
            </Typography>

          </Paper>

        </DialogContent>

        <DialogActions>
          <Button 
            sx={{m:1, mr:3, p:1, minWidth:128 }}
            variant="outlined"
            onClick={()=>setOpen(false)}
          >
            Close
          </Button>
        </DialogActions>
      
      </Dialog>
    </>
  );
}