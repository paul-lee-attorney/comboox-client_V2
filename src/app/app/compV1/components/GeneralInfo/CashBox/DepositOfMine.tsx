import { Alert, Box, Collapse, IconButton, Stack, Tooltip } from "@mui/material";
import { Close, HelpOutline, } from "@mui/icons-material";

import { useEffect, useState } from "react";


import { depositOfMine } from "../../../gk";
import { bigIntToStrNum, longSnParser } from "../../../../common/toolsKit";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

export interface DepositOfMineProps {
  time: number;
}


export function DepositOfMine({time}:DepositOfMineProps) {
  
  const { gk, userNo } = useComBooxContext();

  const [ deposit, setDeposit ] = useState<bigint>(0n);

  useEffect(()=>{
    if (gk && userNo) {
      depositOfMine(gk, userNo).then(
        res => setDeposit(res)
      );
    }
  }, [ gk, userNo, time ]);

  const [ open, setOpen ] = useState(false);

  const handleClick = () => {
    setOpen(true);
  }

  return(
    <Box sx={{ width:'300' }}>
      <Stack direction='row' sx={{ alignItems:'center' }} >

        <Tooltip 
          title='Get ETH Deposits' 
          placement='top-end'
          arrow 
        >
          <span>
            <IconButton 
              sx={{mx:1, ml: 5}}
              size="large"
              onClick={handleClick}
              color="success"
            >
              <HelpOutline />
            </IconButton>
          </span>
        </Tooltip>

        <Collapse in={ open } sx={{ m:1 }} >
          <Alert 
            action={
              <IconButton
                aria-label="close"
                color="success"
                size="small"
                onClick={() => {
                  setOpen(false);
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            }
            variant="outlined" 
            severity='success' 
            sx={{ height: 45, p:0.5 }} 
          >
            Deposit of User ({longSnParser((userNo ?? 0).toString())}) : { bigIntToStrNum(deposit, 18) + ' (ETH)' }
          </Alert>          
        </Collapse>

      </Stack>

    </Box>
  );
}