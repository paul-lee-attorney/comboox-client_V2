"use client"

import { useEffect, useState } from "react";

import { Box, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";

import { CopyLongStrTF } from "../../common/CopyLongStr";
import { AddrZero, booxMap, Bytes32Zero } from "../../common";

import { ActionsOfOrder } from "./components/ActionsOfOrder";
import { OrdersList } from "./components/OrdersList";
import { counterOfClasses } from "../ros/ros";
import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { DealsList } from "./components/DealsList";
import { usePublicClient } from "wagmi";
import { baseToDollar, longSnParser } from "../../common/toolsKit";
import { BillOfOrder } from "./components/BillOfOrder";
import { BillOfDeal } from "./components/BillOfDeal";
import { DealsChart } from "./components/DealsChart";
import { SetBookAddr } from "../../components/SetBookAddr";
import { Deal, defaultOrder, Order } from "../../compV1/loe/loe";
import { dealParser, DealProps, getOrders } from "./loo";
import { ArbiscanLog, autoUpdateLogs, decodeArbiscanLog, fetchArbiscanData, getAllLogs, getTopBlkOf, setLogs, setTopBlkOf, upsertMenuOfLogs } from "../../../api/firebase/arbiScanLogsTool";

import { Hex, keccak256, toHex } from "viem";

function UsdListOfOrders() {

  const {gk, boox } = useComBooxContext();

  const [addr, setAddr] = useState(boox ? boox[booxMap.LOO] : AddrZero );

  const [ classes, setClasses ] = useState<number[]>([]);
  const [ classOfShare, setClassOfShare ] = useState<number>(0);

  useEffect(()=>{
    if (boox) {
      counterOfClasses(boox[booxMap.ROS]).then(
        res => {
          let i = 1;
          let list: number[] = [1];
          while (i <= res) {
            i++;
            list.push(i);
          }
          
          setClasses(list);
        }
      )
    }
  }, [boox])

  const [ offers, setOffers ] = useState<readonly Order[]>([]);
  const [ bids, setBids ] = useState<readonly Order[]>([]);

  const client = usePublicClient();

  const updateDealClosedLogs = async ()=>{
    if (!gk || !addr) return;
    const blk = await client.getBlock();
    const toBlk = blk.number;
    let chainId = await client.getChainId();
    let loo = addr;

    let fromBlk = await getTopBlkOf(gk, loo);

    if (fromBlk == 1n || fromBlk >= toBlk) return false;
    else fromBlk++;

    let data = await fetchArbiscanData(chainId, loo, fromBlk, toBlk);
      
    if (data) {
      let logs = data.result;

      if (logs.length > 0) {
        let name = "DealClosed";
        let topic0 = keccak256(toHex("DealClosed(bytes32,bytes32,bytes32,uint256)"));
        
        let events = logs.filter((v) => {
          return v.topics[0]?.toLowerCase() == topic0.toLowerCase();
        });

        if (events.length > 0) {
            let flag = await setLogs(gk, 'LOO', loo, "DealClosed", events);   
            if (flag) console.log('appended', events.length, ' events of ', name);
            else return false;
        }
      }
    }

    let flag = await setTopBlkOf(gk, loo, toBlk);
    if (!flag) return false;
  }

  const [ time, setTime ] = useState<number>(0);

  const refresh = ()=>{
    updateDealClosedLogs();
    setTime(Date.now());
  }

  useEffect(()=>{
      getOrders(addr, classOfShare, true).then(
        res => setOffers(res)
      );

      getOrders(addr, classOfShare, false).then(
        res => setBids(res)
      );
  }, [addr, classOfShare, time]);

  const [ order, setOrder ] = useState<Order>(defaultOrder);
  const [ open, setOpen ] = useState(false);

  const [ deals, setDeals ] = useState<DealProps[]>([]);
  const [ qty, setQty ] = useState(0n);
  const [ amt, setAmt ] = useState(0n);

  useEffect(()=>{

    const getEvents = async () => {

      if (!gk || addr.toLowerCase() == AddrZero.toLowerCase()) return;

      let rawLogs = await getAllLogs(gk, 'LOO', addr, 'DealClosed');

      let abiStr = 'event DealClosed(bytes32 indexed fromSn, bytes32 indexed toSn, bytes32 qtySn, uint indexed consideration)';

      type TypeOfDealClosedLog = ArbiscanLog & {
        eventName: string, 
        args: {
          fromSn: Hex,
          toSn: Hex,
          qtySn: Hex,
          consideration:bigint,
        }
      }

      let dealLogs = rawLogs?.map(log => decodeArbiscanLog(log, abiStr) as TypeOfDealClosedLog) ?? [];

      let cnt = dealLogs.length;

      let qty:bigint = 0n;
      let amt:bigint = 0n;
      let arr:DealProps[] = [];
      let counter = 0;

      while (cnt > 0) {

        let log = dealLogs[cnt-1];
        let deal:Deal = dealParser(
          log.args.fromSn ?? Bytes32Zero, log.args.toSn ?? Bytes32Zero, log.args.qtySn ?? Bytes32Zero
        );

        let consideration: bigint = log.args.consideration ?? 0n;

        let classOfOrder = Number(deal.classOfShare);

        if (classOfShare != classOfOrder) {
          cnt--;
          continue;
        }

        let item:DealProps = {
          ...deal,

          blockNumber: BigInt(log.blockNumber),
          timestamp: BigInt(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,

          seqOfDeal: counter,          
          consideration: consideration,
          classOfShare: longSnParser(classOfShare.toString()),
          seqOfShare: longSnParser(deal.seqOfShare),
          buyer: longSnParser(deal.buyer),
          groupRep: longSnParser(deal.groupRep),
        }

        cnt--;

        qty += deal.paid;
        amt += deal.paid * deal.price;

        arr.push(item); 
        counter++;
      }

      setQty(qty);
      setAmt(amt);
      setDeals(arr);
    }

    getEvents();

  },[gk, addr, client, classOfShare, setQty, setAmt, time]);  

  const [ deal, setDeal ] = useState<DealProps | undefined>();
  const [ show, setShow ] = useState<boolean>(false);

  useEffect(()=>{

    const updateMenu = async ()=> {
      if (!gk || !addr) return;

      let items = [
        {
          title: 'LOO',
          address: addr,
          name: 'DealClosed',
          abiStr: 'DealClosed(bytes32,bytes32,bytes32,uint256)',
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
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:2, m:1, border:1, borderColor:'divider', width:'fit-content' }} >

      <Stack direction="row" sx={{alignItems:'center'}} >

          <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
            <b>LOO - List Of Orders</b>
          </Typography>

          <Box width='168'>
            <CopyLongStrTF title="Addr"  src={ addr.toLowerCase() }  />
          </Box>

          <Box width='168' sx={{ m:2 }}>
            <FormControl size="small" sx={{ minWidth: 168 }}>
              <InputLabel id="typeOfAction-label">ClassOfShare</InputLabel>
              <Select
                labelId="typeOfAction-label"
                id="typeOfAction-select"
                label="ClassOfShare"
                value={ classOfShare == 0 ? '' : classOfShare }
                onChange={(e) => setClassOfShare( parseInt( e.target.value.toString() ))}
              >
                {classes.map((v) => (
                  <MenuItem key={v} value={ v } > <b>{v}</b> </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <SetBookAddr setAddr={setAddr} />

      </Stack>
          
      <ActionsOfOrder classOfShare={classOfShare} seqOfOrder={order.node.seq} refresh={refresh} />
      <DealsChart classOfShare={classOfShare} time={time} refresh={refresh} />
      
      <OrdersList name={'Sell'} list={offers} setOrder={setOrder} setOpen={setOpen} refresh={refresh} />
      <OrdersList name={'Buy'} list={bids} setOrder={setOrder} setOpen={setOpen} refresh={refresh} />

      <DealsList list={deals} qty={baseToDollar(qty.toString())} amt={baseToDollar((amt/10000n).toString())} refresh={refresh} setDeal={setDeal} setShow={setShow} />
      
      <BillOfOrder order={order} open={open} setOpen={setOpen} />
      {deal && (
        <BillOfDeal deal={deal} open={show} setOpen={setShow} />
      )}

    </Paper>
  );
} 

export default UsdListOfOrders;