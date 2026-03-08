
import { AccountCircle } from '@mui/icons-material';
import { Alert, Button, Snackbar } from '@mui/material';
import copy from 'copy-to-clipboard';

import { ReactNode, useState } from "react";
import { userNoCodifier, userNoParser } from './toolsKit';

interface ToClipboardProps{
  icon: ReactNode;
  info: string;
}

export function ToClipboard({icon, info}:ToClipboardProps) {

  const [ flag, setFlag ] = useState<boolean>(false);

  const handleClick = ()=>{
    if (copy( info )) setFlag(true);
  }

  const handleClose = ()=>{
    setFlag(false);
  }

  let displayInfo = info.length > 10 
    ? info.startsWith('0x')
      ? info.substring(2, 7) + '...' + info.substring(info.length-5)
      : info.substring(0, 5) + '...' + info.substring(info.length-5)
    : info.length == 10
      ? userNoParser(info)
      : info;

  return(
    <>
      <Button 
        variant='outlined'
        size="small"
        color='inherit'
        sx={{
          m:1, height:40, width:188,
        }}
        startIcon={ icon }
        onClick={ ()=>{
          handleClick();
        }}
      >
        { displayInfo }
      </Button>

      <Snackbar open={flag} autoHideDuration={3000} onClose={handleClose} >
        <Alert severity='info' variant='filled' onClose={handleClose}>
          { displayInfo } Copied !
        </Alert>
      </Snackbar>

    </>
  );
}