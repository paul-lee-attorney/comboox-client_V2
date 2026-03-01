import { useState } from "react"
import { bigIntToStrNum, } from "./toolsKit";
import { Alert, Collapse, IconButton, Stack, Tooltip } from "@mui/material";
import { Close, HelpOutline } from "@mui/icons-material";

interface ShowValueOfProps {
  value: bigint;
}

export function ShowValueOf({ value }:ShowValueOfProps ) {

  const [ open, setOpen ] = useState(false);

  const handleClick = () => {
    setOpen(true);
  }

  return (
    <Stack direction='row' sx={{ alignItems:'start' }} >
      <Tooltip title={"Check Value In ETH"} placement='right' arrow >
        <span>
          <IconButton
            disabled={value == 0n}
            color='primary'
            sx={{ mt:1 }}
            onClick={ handleClick }
            edge="end"
          >
            <HelpOutline />
          </IconButton>
        </span>
      </Tooltip>

      <Collapse in={open} sx={{ minWidth:218, m:1, mt:0.5}}>        
        <Alert 
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setOpen(false);
              }}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }

          variant='outlined' 
          severity='info'
          sx={{ height: 45,  m:1, mt:0}} 
        >
          { bigIntToStrNum((value / (10n**9n)), 9) + ' (ETH)'}
        </Alert>
      </Collapse>
    </Stack>
  )
}