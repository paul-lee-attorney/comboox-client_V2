import { Alert, Box, Collapse, IconButton, Stack, Tooltip } from "@mui/material";
import { Close, HelpOutline, } from "@mui/icons-material";

import { useEffect, useState } from "react";



import { bigIntToStrNum, longSnParser } from "../../../../common/toolsKit";
import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";
import { booxMap } from "../../../../common";
import { depositOfMine } from "../../../cashier";
import { DepositOfMineProps } from "./DepositOfMine";

export function UsdDepositOfMine({time}:DepositOfMineProps) {
  
  const { boox, userNo } = useComBooxContext();

  const [ deposit, setDeposit ] = useState<bigint>(0n);

  useEffect(()=>{
    if (boox && userNo) {
      depositOfMine(boox[booxMap.ROI], BigInt(userNo)).then(
        res => setDeposit(res)
      );
    }
  }, [ boox, userNo, time ]);

  const [ open, setOpen ] = useState(false);

  const handleClick = () => {
    setOpen(true);
  }

  return(
    <Box sx={{ width:'300' }}>
      <Stack direction='row' sx={{ alignItems:'center' }} >

        <Tooltip 
          title='Get USDC Deposits' 
          placement='top-end' 
          arrow 
        >
          <span>
            <IconButton 
              sx={{mx:1, ml: 5}}
              size="large"
              onClick={handleClick}
              color="primary"
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
                color="primary"
                size="small"
                onClick={() => {
                  setOpen(false);
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            }
            variant="outlined" 
            severity='info' 
            sx={{ height: 45, p:0.5 }} 
          >
            Deposit of User ({longSnParser((userNo ?? 0).toString())}) : { bigIntToStrNum(deposit, 6) + ' (USDC)' }
          </Alert>          
        </Collapse>

      </Stack>

    </Box>
  );
}