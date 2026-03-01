import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";


export function ErrMsg() {

  const { errMsg, setErrMsg } = useComBooxContext();

  let start = errMsg?.indexOf('reason:');
  let end = errMsg?.indexOf('Contract Call');
  let msg = (start && start > 0) && (end && end > 0)
          ? errMsg?.substring((start + 7), end)
          : undefined;

  const handleClick = ()=>{
    setErrMsg(undefined);
  }

  return(
    <Dialog open={msg != undefined} >
      <DialogTitle>
        <Typography variant="h5" sx={{ textDecoration:'underline' }}>
          <b>Error Message</b>
        </Typography>
      </DialogTitle>

      <DialogContent sx={{minHeight: 88, minWidth: 618}}>
        { msg }
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          sx={{m:1}}
          onClick={handleClick}
        >
          Close
        </Button>
      </DialogActions>

    </Dialog>
  )
}