import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";

import { longSnParser } from "../../../common/toolsKit";
import { useState } from "react";
import { Swap } from "../roo";
import { ActionsOfSwap } from "./ActionsOfSwap";
import { ShowSwapsList } from "./ShowSwapsList";

const statesOfSwap = [
  'Pending', 'Issued', 'Closed', 'Terminated'
]

interface SwapsListProps{
  list: readonly Swap[];
  seqOfOpt: number;
  refresh: ()=>void;
}

export function SwapsList({ list, seqOfOpt, refresh }: SwapsListProps) {

  const [ open, setOpen ] = useState(false);
  const handleClick = async () => {
    setOpen(true);
  }

  const [seqOfSwap, setSeqOfSwap ] = useState(0);

  return (
    <>
      <Button 
        variant="outlined" 
        fullWidth 
        onClick={ handleClick } 
        sx={{
          m:1,
          height: 40
        }}
      >

        <Typography
          variant="body2"
          fontWeight="xl"
          color="primary"
        >
          Swaps List ({list.length})
        </Typography>            

      </Button>

      <Dialog
        maxWidth="xl"
        fullWidth
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title"
        sx={{m:1, p:1}}
      >
        <DialogTitle id="dialog-title">
          Swaps List of Option (NO. { longSnParser( seqOfOpt.toString() )})
        </DialogTitle>

        <DialogContent>

          <Stack direction='column' sx={{m:1, p:1}} >
            <ShowSwapsList list={list} setSeqOfSwap={setSeqOfSwap} />
            <ActionsOfSwap seqOfOpt={seqOfOpt} seqOfSwap={seqOfSwap} setOpen={setOpen} refresh={refresh} />
          </Stack>

        </DialogContent>

        <DialogActions>
          <Button variant="outlined" sx={{ m:1, mx:3, }} onClick={()=>setOpen(false)}>Close</Button>
        </DialogActions>

      </Dialog>

    </>
  )

}