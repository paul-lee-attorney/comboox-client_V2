import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, } from "@mui/material";

import { useEffect, useState } from "react";
import { Swap } from "../../../../roo/roo";
import { ListAltOutlined } from "@mui/icons-material";
import { Deal, getAllSwaps } from "../../ia";
import { HexType } from "../../../../../common";
import { ActionsOfSwap } from "./ActionsOfSwap";
import { ShowSwapsList } from "../../../../roo/components/ShowSwapsList";

export interface SwapsListProps {
  addr: HexType;
  deal: Deal;
  refresh: ()=>void;
}

export function SwapsList({ addr, deal, refresh }: SwapsListProps) {

  const [ list, setList ] = useState<readonly Swap[]>([]);

  useEffect(()=>{
    getAllSwaps(addr, deal.head.seqOfDeal).then(
      res => setList(res)
    );
  })

  const [ show, setShow ] = useState(false);

  const handleClick = async () => {
    setShow(true);
  }

  const [ seqOfSwap, setSeqOfSwap ] = useState<number>(0);

  return (
    <>
      <Button 
        variant="outlined" 
        fullWidth 
        startIcon={<ListAltOutlined />}
        onClick={ handleClick } 
        sx={{
          m:1,
          height: 40
        }}
      >
        Swaps List ({list?.length})
      </Button>

      <Dialog
        maxWidth="xl"
        fullWidth
        open={ show }
        onClose={()=>setShow(false)}
        aria-labelledby="dialog-title"
        sx={{m:1, p:1}}
      >
        <DialogTitle id="dialog-title" sx={{ textDecoration:'underline' }} >
          <b>Swaps List</b>
        </DialogTitle>


        <DialogContent>

          <Stack direction='column' sx={{m:1, p:1}} >

            <ShowSwapsList list={list}  setSeqOfSwap={setSeqOfSwap} />
            <ActionsOfSwap ia={addr} seqOfDeal={deal.head.seqOfDeal} seqOfSwap={seqOfSwap} setOpen={setShow} refresh={refresh} />

          </Stack>

        </DialogContent>

        <DialogActions>
          <Button variant="outlined" sx={{ m:1, mx:3, }} onClick={()=>setShow(false)}>Close</Button>
        </DialogActions>

      </Dialog>

    </>
  )

}