"use client"

import { useEffect, useState } from "react";

import { Paper, Stepper, Step, StepLabel, StepContent } from "@mui/material";

import { useComBooxContext } from "../../_providers/ComBooxContextProvider";

import { AddrOfRegCenter, booxMap } from "../common";
import { getDK } from "./common/draftControl";
import { getKeeper } from "./gk";

import { SetMaxQtyOfMembers } from "./components/SetMaxQtyOfMembers";
import { InitBos } from "./components/InitBos";
import { TurnKey } from "./components/TurnKey";
import { GeneralInfo } from "./components/GeneralInfo";
import { SetCompInfo } from "./components/SetCompInfo";
import { autoUpdateLogs, upsertMenuOfLogs } from "../../api/firebase/arbiScanLogsTool";
import { usePublicClient } from "wagmi";

function HomePage() {

  const { gk, boox } = useComBooxContext();
  const [ activeStep, setActiveStep ] = useState<number>(4);

  useEffect(()=>{
    if (boox) {
      getDK(boox[booxMap.ROM]).then(
        dk => {
          if (gk) {
            getKeeper(gk, booxMap.ROM).then(
              romKeeper => {
                if (romKeeper != dk) setActiveStep(0);
    })}})}
  }, [boox, gk]);

  useEffect(()=>{

    const updateMenu = async ()=> {
      if (!gk || !boox) return;

      let items = [
        {
          title: 'GeneralKeeper',
          address: gk,
          name: 'ReceivedCash',
          abiStr: 'ReceivedCash(address,uint256)',
        },
        {
          title: 'GeneralKeeper',
          address: gk,
          name: 'RegKeeper',
          abiStr: 'RegKeeper(uint256,address,address)',
        },
        {
          title: 'GeneralKeeper',
          address: gk,
          name: 'RegBook',
          abiStr: 'RegBook(uint256,address,address)',
        },
        {
          title: 'Cashier',
          address: boox[booxMap.Cashier],
          name: 'ReceiveUsd',
          abiStr: 'ReceiveUsd(address,uint256,bytes32)',
        },
        {
          title: 'Cashier',
          address: boox[booxMap.Cashier],
          name: 'ForwardUsd',
          abiStr: 'ForwardUsd(address,address,uint256,bytes32)',
        },
        {
          title: 'Cashier',
          address: boox[booxMap.Cashier],
          name: 'CustodyUsd',
          abiStr: 'CustodyUsd(address,uint256,bytes32)',
        },
        {
          title: 'Cashier',
          address: boox[booxMap.Cashier],
          name: 'ReleaseUsd',
          abiStr: 'ReleaseUsd(address,address,uint256,bytes32)',
        },
        {
          title: 'Cashier',
          address: boox[booxMap.Cashier],
          name: 'TransferUsd',
          abiStr: 'TransferUsd(address,uint256,bytes32)',
        },
        {
          title: 'Cashier',
          address: boox[booxMap.Cashier],
          name: 'DepositUsd',
          abiStr: 'DepositUsd(uint256,uint256,bytes32)',
        },
        {
          title: 'Cashier',
          address: boox[booxMap.Cashier],
          name: 'PickupUsd',
          abiStr: 'PickupUsd(address,uint256,uint256)',
        },
      ]

      let len = items.length;
      
      while(len > 0) {
        let item = items[len-1];
        await upsertMenuOfLogs(gk, item.title, item.address, item.name, item.abiStr);      
        len--;
      }

    }

    updateMenu();
  });

  const client = usePublicClient();

  useEffect(()=>{
    const updateEvents = async ()=> {
      if (!gk) return;
      const blk = await client.getBlock();
      let chainId = await client.getChainId();
      await autoUpdateLogs(chainId, gk, blk.number);
    }

    updateEvents();
  });

  return (
    <Paper elevation={3} sx={{m:2, p:1, border:1, height:'100%', borderColor:'divider', width:'fit-content' }}>

      {activeStep != undefined && activeStep < 4 && (
        <Stepper sx={{ mt: 2, height: 1200, alignItems:'start' }} activeStep={ activeStep } orientation="vertical" >

          <Step index={0} >

            <StepLabel>
              <h3>Company ID</h3>
            </StepLabel>

            <StepContent sx={{ alignItems:'start', justifyContent:'start', justifyItems:'start'}} >

              <SetCompInfo nextStep={setActiveStep} />

            </StepContent>

          </Step>

          <Step index={1} >

            <StepLabel>
              <h3>Max Members</h3>
            </StepLabel>

            <StepContent sx={{ alignItems:'center', justifyContent:'center'}} >

              <SetMaxQtyOfMembers nextStep={setActiveStep} />

            </StepContent>

          </Step>

          <Step index={2} >

            <StepLabel>
              <h3>Register Of Shares</h3>
            </StepLabel>

            <StepContent sx={{ alignItems:'center', justifyContent:'center'}} >

              <InitBos nextStep={setActiveStep} />

            </StepContent>

          </Step>

          <Step index={3} >

            <StepLabel>
              <h3>Turn Key</h3>
            </StepLabel>

            <StepContent sx={{ alignItems:'center', justifyContent:'center'}} >

              <TurnKey nextStep={setActiveStep} />

            </StepContent>

          </Step>

        </Stepper>
      )}

      {activeStep != undefined && activeStep > 3 && (
        <GeneralInfo />
      )}

    </Paper>
  );
} 

export default HomePage;