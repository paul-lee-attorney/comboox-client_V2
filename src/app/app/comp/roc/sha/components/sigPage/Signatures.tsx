import { useEffect, useState } from "react";

import { Stack, Paper, Toolbar, Divider } from "@mui/material";

import { HexType } from "../../../../../common";

import { StrSig, getBuyers, getSellers, getSigsOfRole, } from "./sigPage";

import { AcceptSha } from "../actions/AcceptSha";

import { ParasOfPage } from "./ParasOfPage";
import { BlanksEditor } from "./BlanksEditor";
import { SigColumn } from "./SigsColumn";

export interface SigPageProps {
  addr: HexType,
  initPage: boolean,
  finalized: boolean,
  isSha: boolean,
}

export function Signatures({ addr, initPage, finalized, isSha }: SigPageProps) {

  const [time, setTime] = useState(0);

  const [ buyerSigs, setBuyerSigs ] = useState<StrSig[]>([]);
  const [ sellerSigs, setSellerSigs ] = useState<StrSig[]>([]);  

  useEffect(()=>{

    getBuyers(addr, initPage).then(
      buyers => {
        getSigsOfRole(addr, initPage, buyers).then(
          sigs => setBuyerSigs(sigs)
        );
      }
    );

    getSellers(addr, initPage).then(
      sellers => {
        getSigsOfRole(addr, initPage, sellers).then(
          sigs => setSellerSigs(sigs)
        );
      }
    );

  }, [ addr, initPage, time])

  return (
    <Stack direction="column" sx={{width:'100%'}} >

      <ParasOfPage  addr={addr} initPage={initPage} finalized={finalized} time={time} setTime={setTime}  isSha={isSha} />     

      <Paper elevation={3} sx={{ m:1, p:1, border:1, borderColor:'divider' }}>

        <Stack direction={'row'} sx={{ alignItems:'center', justifyContent:'space-between' }} >
          <Toolbar sx={{ textDecoration:'underline' }}>
            <h4>Signatures of Doc</h4>
          </Toolbar>

          {!initPage && finalized && isSha && (
            <AcceptSha setTime={ setTime } />
          )}

          {!finalized && initPage && (
            <BlanksEditor addr={addr} initPage={initPage} finalized={finalized} isSha={isSha} time={time} setTime={setTime}  />
          )}

        </Stack>

        <Divider sx={{ m:1 }} flexItem />

        <Stack direction="row" >

          <SigColumn isSha={isSha} isBuyer={false} sigs={sellerSigs} />
          <SigColumn isSha={isSha} isBuyer={true} sigs={buyerSigs} />

        </Stack>

      </Paper>
    </Stack>
  );
} 

