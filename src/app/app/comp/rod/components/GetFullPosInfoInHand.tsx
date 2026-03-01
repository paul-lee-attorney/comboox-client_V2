import { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";


import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";

import { longSnParser } from "../../../common/toolsKit";
import { booxMap } from "../../../common";

import { Position, getFullPosInfoInHand } from "../rod";
import { GetPosInHand } from "./GetPosInHand";

interface GetFullPosInfoInHandProps {
  userNo: number;
}

export function GetFullPosInfoInHand({userNo}:GetFullPosInfoInHandProps) {
  const { boox } = useComBooxContext();

  const [ posList, setPosList ] = useState<readonly Position[]>(); 

  const [ open, setOpen ] = useState<boolean>(false);

  useEffect(()=>{
    if (boox) {
      getFullPosInfoInHand(boox[booxMap.ROD], userNo).then(
        res => setPosList(res)
      );
    }
  }, [boox, userNo]);

  return (
    <>
      <Button
        variant="outlined"
        fullWidth={true}
        size='small'
        sx={{ m:1, height:40 }}
        onClick={()=>setOpen(true)}      
      >
        { longSnParser(userNo.toString()) }
      </Button>

      <Dialog
        maxWidth={false}
        open={open}
        onClose={()=>setOpen(false)}
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title" sx={{ textDecoration:'underline' }} >
          <b>Positions Inhand - UserNo: { longSnParser(userNo.toString()) }</b>
        </DialogTitle>

        <DialogContent>
          {posList && (
            <GetPosInHand list={posList} />
          )}
        </DialogContent>

        <DialogActions>
          <Button 
            sx={{m:1, ml:5, p:1, minWidth:128 }}
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