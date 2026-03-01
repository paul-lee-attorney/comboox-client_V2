import { Dispatch, SetStateAction, useState } from "react";
import { Deal, defaultDeal } from "../../ia";
import { useInvestmentAgreementDelDeal } from "../../../../../../../../generated-v1";
import { HexType } from "../../../../../common";
import { Delete } from "@mui/icons-material";
import { refreshAfterTx } from "../../../../../common/toolsKit";
import { LoadingButton } from "@mui/lab";
import { useComBooxContext } from "../../../../../../_providers/ComBooxContextProvider";


interface DeleteDealProps {
  addr: HexType;
  seqOfDeal: number;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setDeal: Dispatch<SetStateAction<Deal>>;
  refresh: ()=>void;
}

export function DeleteDeal({addr, seqOfDeal, setOpen, setDeal, refresh}:DeleteDealProps) {

  const { setErrMsg } = useComBooxContext();

  const [ loading, setLoading ] = useState(false);

  const updateResults = ()=>{
    setDeal(defaultDeal);
    refresh();
    setLoading(false);
    setOpen(false);
  }

  const {
    write: deleteDeal
  } = useInvestmentAgreementDelDeal({
    address: addr,
    onError(err) {
      setErrMsg(err.message);
    },
    onSuccess(data) {
      setLoading(true);
      let hash: HexType = data.hash;
      refreshAfterTx(hash, updateResults);
    }
  });

  const handleClick = ()=>{
    deleteDeal({
      args: [ BigInt(seqOfDeal) ],
    })
  }

  return (
    <LoadingButton
      variant="contained" 
      loading={loading}
      loadingPosition="end"
      endIcon={<Delete/>} 
      sx={{ mr:5 }}
      onClick={ handleClick } 
    >
      Delete
    </LoadingButton>
  );  
}