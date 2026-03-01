import { useState } from "react";
import { useListOfProjectsSetCurrency } from "../../../../../../../../../generated";
import { FormControl, InputLabel, MenuItem, Paper, Select, Stack } from "@mui/material";
import { Update } from "@mui/icons-material";
import { HexType, currencies } from "../../../../../../common";
import { refreshAfterTx } from "../../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { ActionsOfOwnerProps } from "../ActionsOfOwner";
import { useComBooxContext } from "../../../../../../../_providers/ComBooxContextProvider";


export function SetCurrency({ addr, refresh }: ActionsOfOwnerProps ) {

  const { setErrMsg } = useComBooxContext();
  
  const [loading, setLoading] = useState(false);

  const updateInfo = ()=>{
    refresh();
    setLoading(false);
  }

  const [ newCurrency, setNewCurrency] = useState<number>(0);

  const {
    isLoading: setCurrencyLoading,
    write: setCurr,
  } = useListOfProjectsSetCurrency({
    address: addr,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash:HexType = data.hash;
      refreshAfterTx(hash, updateInfo);
    }
  });

  const handleClick = () => {
    setCurr({
      args: [ newCurrency ],
    });
  }

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction='row' sx={{ alignItems:'start' }} >

        <FormControl variant="outlined" size="small" sx={{ m: 1, minWidth: 218 }}>
          <InputLabel id="bookingCurrency-label">BookingCurrency</InputLabel>
          <Select
            labelId="bookingCurrency-label"
            id="bookingCurrency-select"
            label="BookingCurrency"
            value={ newCurrency.toString() }
            onChange={(e) => setNewCurrency(Number(e.target.value))}
          >
            {currencies.map((v, i) => (
              <MenuItem key={i} value={i.toString()}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <LoadingButton 
          disabled = { setCurrencyLoading }
          loading={loading}
          loadingPosition='end'
          sx={{ m: 1, minWidth: 120, height: 40 }} 
          variant="contained" 
          endIcon={<Update />}
          onClick={ handleClick }
          size='small'
        >
          Update
        </LoadingButton>

      </Stack>
    </Paper>
  );

}


