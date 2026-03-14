import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, Typography } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { showUSD, weiToEth9Dec } from "../FinStatement";

export type BtnProps = {
  simbol: string;
  title: string; 
  amt: bigint;
  amtInUsd: bigint;
  show: ()=>void;
}

export type SGNAProps = {
  inETH: boolean;
  items: BtnProps[]; 
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function SGNA ({inETH, items, open, setOpen}:SGNAProps ) {
        
  return(

    <Dialog
      maxWidth={false}
      open={open}
      onClose={()=>setOpen(false)}
    >

      <DialogTitle id="dialog-title" sx={{ mx:2, textDecoration:'underline' }} >
        <b>{items.length> 0 && items[0].title}</b> ({ items.length > 0 && (inETH ? weiToEth9Dec(items[0].amt) : showUSD(items[0].amtInUsd)) })
      </DialogTitle>

      <DialogContent>

        <Paper elevation={3} 
          sx={{
            m:1, p:1, border:1, 
            borderColor:'divider',
            width: '100%' 
          }} 
        >

          <Box width={680} >

            {items.map((v,i) => {
              if (i == 0) return;
              return (
              <Stack key={i} direction='row' width='100%' >
                <Typography variant="h6" textAlign='center' width='10%'>
                  {v.simbol}
                </Typography>
                <Button variant="outlined" sx={{width: '90%', m:0.5, justifyContent:'start'}} onClick={v.show} >
                  <b> {v.title} : ({ inETH
                    ? weiToEth9Dec(v.amt)
                    : showUSD(v.amtInUsd)}) </b>
                </Button>
              </Stack> 
            )})}

            <Divider orientation="horizontal"  sx={{ my:2, color:'blue' }} flexItem  />

            {items.length > 0 && (
              <Stack direction='row' width='100%' >
                <Typography variant="h6" textAlign='center' width='20%'>
                  &nbsp;
                </Typography>
                <Button variant="outlined" sx={{width: '80%', m:0.5, justifyContent:'start'}} >
                  <b>{items[0].title}: ({ inETH
                    ? weiToEth9Dec(items[0].amt)
                    : showUSD(items[0].amtInUsd) }) </b>
                </Button>
              </Stack>
            )}

          </Box>
        </Paper>

      </DialogContent>

      <DialogActions>
        <Button variant="outlined" sx={{ m:1, mx:3 }} onClick={()=>setOpen(false)}>Close</Button>
      </DialogActions>

    </Dialog>

  )
}




