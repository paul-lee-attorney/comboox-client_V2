import { QueryBuilderOutlined } from "@mui/icons-material";
import { IconButton, Snackbar, Stack, Tooltip } from "@mui/material";
import { useState } from "react";
import { usePublicClient } from "wagmi";
import { dateParser } from "../../../common/toolsKit";

export function GetTimestamp() {

  const provider = usePublicClient();

  const [ timestamp, setTimestamp ] = useState<bigint>();
  const [ open, setOpen ] = useState<boolean>(false);
  
  const getTimestamp = async ()=>{
    let block = await provider.getBlock();
    setTimestamp( block.timestamp );
    setOpen(true);
  }

  return (

    <Stack direction="row"  sx={{ m:1, p:1 }} >

      <Tooltip title={'Date & Time'} placement='bottom' arrow >

        <IconButton
          color="inherit"
          size="small"
          onClick={getTimestamp}
        >
          <QueryBuilderOutlined />
        </IconButton>

      </Tooltip>

      {timestamp != undefined && (
        <Snackbar
          open={open}
          anchorOrigin={{ vertical:'top', horizontal:'center' }}
          autoHideDuration={3000}
          onClose={()=>setOpen(false)}
          message={ dateParser( timestamp.toString() ) }
        />
      )}

    </Stack>
  );

}