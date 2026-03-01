
import { NoteAltOutlined } from '@mui/icons-material';
import { Alert, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Snackbar, Stack, Tooltip, Typography } from '@mui/material';
import copy from 'copy-to-clipboard';

import { useState } from "react";
import { HexParser } from './toolsKit';



interface CopyLongStrProps{
  title: string;
  src: string;
}

export function CopyLongStrTF({title, src}:CopyLongStrProps) {

  const [ flag, setFlag ] = useState<boolean>(false);

  const handleClick = ()=>{
    if (copy( HexParser(src) )) 
      setFlag(true);
  }

  const handleClose = ()=>{
    setFlag(false);
  }

  return(
    <>
      <FormControl size='small' sx={{ m: 1, width: '100%' }} variant="outlined">
        <InputLabel size='small' htmlFor="CopyLongStr-input">{title}</InputLabel>
        <OutlinedInput
          size='small'
          id="CopyLongStr-input"
          label={title}
          endAdornment={
            <InputAdornment position="end">
              <Tooltip title={"Copy To Clipboard"} placement='right' arrow >
                <IconButton
                  color='inherit'
                  onClick={ handleClick }
                  edge="end"
                >
                  <NoteAltOutlined />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          }
          sx={{
            height: 40,
          }}
          value={ src.substring(0, 7) + '...' + src.substring(src.length-5) }
        
          inputProps={{ readOnly: true }}
        />
      </FormControl>

      <Snackbar open={flag} autoHideDuration={3000} onClose={handleClose} >
        <Alert severity='info' variant='filled' onClose={handleClose}>
          Contents Copied !
        </Alert>
      </Snackbar>

    </>
  );
}


export function CopyLongStrSpan({title, src}:CopyLongStrProps) {

  const [ flag, setFlag ] = useState<boolean>(false);

  const handleClick = ()=>{
    if (copy( HexParser(src) )) 
      setFlag(true);
  }

  const handleClose = ()=>{
    setFlag(false);
  }

  return(
    <Stack direction='row' sx={{ alignItems:'center', justifyContent:'center' }} >

      <Typography >
        { '( ' + title + ': ' + src.substring(0, 7) + '...' + src.substring(src.length-5) + ' )' }
      </Typography>

      <Tooltip title={"Copy To Clipboard"} placement='right' arrow >
        <IconButton
          color='inherit'
          onClick={ handleClick }
          edge="end"
        >
          <NoteAltOutlined />
        </IconButton>
      </Tooltip>
        
      <Snackbar open={flag} autoHideDuration={3000} onClose={handleClose} >
        <Alert severity='info' variant='filled' onClose={handleClose}>
          Contents Copied!
        </Alert>
      </Snackbar>

    </Stack>    
  );
}