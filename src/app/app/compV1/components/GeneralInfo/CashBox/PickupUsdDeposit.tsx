
import { useState } from "react";

import { IconButton, Tooltip } from "@mui/material";
import { SavingsOutlined } from "@mui/icons-material";

import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

import { booxMap, HexType } from "../../../../common";
import { refreshAfterTx } from "../../../../common/toolsKit";

import { useCashierPickupUsd } from "../../../../../../../generated-v1";

interface PickupDepositProps{
  refresh: ()=>void;
}

export function PickupUsdDeposit({ refresh }:PickupDepositProps) {
  
  const { boox, setErrMsg } = useComBooxContext();
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: pickupDepositLoading,
    write: pickupDeposit,
  } = useCashierPickupUsd({
    address: boox && boox[booxMap.ROI],
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  return(
    <Tooltip 
      title='Pickup USDC Deposits' 
      placement='top-start' 
      arrow 
    >
      <span>
        <IconButton 
          sx={{mx:1, ml:6}}
          size="large"
          disabled={ pickupDepositLoading || loading}
          onClick={()=>pickupDeposit?.()}
          color="primary"
        >
          <SavingsOutlined />
        </IconButton>
      </span>
    </Tooltip>
  );
}