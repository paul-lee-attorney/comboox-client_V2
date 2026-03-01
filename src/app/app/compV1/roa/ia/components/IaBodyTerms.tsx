import { useEffect, useState } from "react";

import { Paper } from "@mui/material";

import { HexType } from "../../../../common";

import { Deal, defaultDeal, getSeqList, obtainDealsList } from "../ia";

import { CreateDeal } from "./deals/CreateDeal";

import { DealsList } from "./deals/DealsList";
import { OrderOfDeal } from "./deals/OrderOfDeal";

export interface BodyTermsProps {
  addr: HexType;
  isFinalized: boolean;
}

function IaBodyTerms({addr, isFinalized}: BodyTermsProps) {

  const [ dealsList, setDealsList ] = useState<Deal[]>();
  const [ time, setTime ] = useState<number>(0);

  const refresh = ()=> {
    setTime(Date.now());
  }

  useEffect(()=>{
    getSeqList(addr).then(
      res => {
        obtainDealsList(addr, res).then(
          ls => setDealsList(ls)
        );
      }
    );
  }, [addr, time]);

  const [ deal, setDeal ] = useState<Deal>(defaultDeal);
  const [ open, setOpen ] = useState<boolean>(false);

  return (
    <Paper elevation={3} sx={{p:1, m:1, border:1, borderColor:'divider' }} >
      {!isFinalized && (
        <CreateDeal addr={addr} refresh={refresh} />
      )}
      
      {dealsList && (
        <DealsList list={dealsList} setDeal={ setDeal } setOpen={ setOpen } />
      )}

      {open && (
        <OrderOfDeal addr={addr} isFinalized={isFinalized} open={ open } deal={ deal } setOpen={ setOpen } setDeal={ setDeal } refresh={ refresh } />
      )}

    </Paper>
  );
} 

export default IaBodyTerms;