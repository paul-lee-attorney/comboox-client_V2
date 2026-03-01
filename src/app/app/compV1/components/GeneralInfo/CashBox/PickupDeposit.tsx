
import { useState } from "react";

import { IconButton, Tooltip } from "@mui/material";
import { SavingsOutlined } from "@mui/icons-material";

import { useComBooxContext } from "../../../../../_providers/ComBooxContextProvider";

import { HexType } from "../../../../common";
import { refreshAfterTx } from "../../../../common/toolsKit";

import { useGeneralKeeperPickupDeposit } from "../../../../../../../generated-v1";

interface PickupDepositProps{
  refresh: ()=>void;
}

export function PickupDeposit({ refresh }:PickupDepositProps) {
  
  const { gk, setErrMsg } = useComBooxContext();
  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    refresh();
    setLoading(false);
  }

  const {
    isLoading: pickupDepositLoading,
    write: pickupDeposit,
  } = useGeneralKeeperPickupDeposit({
    address: gk,
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
      title='Pickup ETH Deposits' 
      placement='top-start' 
      arrow 
    >
      <span>
        <IconButton 
          sx={{mx:1, ml:5}}
          size="large"
          disabled={ pickupDepositLoading || loading}
          onClick={()=>pickupDeposit?.()}
          color="success"
        >
          <SavingsOutlined />
        </IconButton>
      </span>
    </Tooltip>
  );
}