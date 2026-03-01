"use client"

import { useEffect, useState } from "react";

import { Box, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Tooltip, Typography } from "@mui/material";

import { CopyLongStrTF } from "../../common/CopyLongStr";
import { AddrZero, booxMap, Bytes32Zero } from "../../common";

import { ActionsOfOrder } from "./components/ActionsOfOrder";
import { Order, defaultOrder, getOrders, briefParser, Brief, BriefProps } from "./loe";
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
import { AutoStoriesOutlined, MenuBook, VideoCameraBack, VideoCameraBackOutlined, VideoCameraFront } from "@mui/icons-material";
import { blue } from "@mui/material/colors";

import { ArbiscanLog, decodeArbiscanLog, fetchArbiscanData, getAllLogs, getTopBlkOf, setLogs, setTopBlkOf } from "../../../api/firebase/arbiScanLogsTool";
import { Hex, keccak256, toHex } from "viem";

function ListOfOrders() {

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


  const provider = usePublicClient();

  const updateDealClosedLogs = async ()=>{
    if (!gk || !boox) return;
    const blk = await provider.getBlock();
    const toBlk = blk.number;
    let chainId = await provider.getChainId();
    let loo = boox[booxMap.LOO];

    let fromBlk = await getTopBlkOf(gk, loo);

    if (fromBlk == 1n || fromBlk >= toBlk) return false;
    else fromBlk++;

    let data = await fetchArbiscanData(chainId, loo, fromBlk, toBlk);
      
    if (data) {
      let logs = data.result;

      if (logs.length > 0) {
        let name = "DealClosed";
        let topic0 = keccak256(toHex("DealClosed(bytes32,uint256)"));
        
        let events = logs.filter((v) => {
          return v.topics[0]?.toLowerCase() == topic0.toLowerCase();
        });

        if (events.length > 0) {
            let flag = await setLogs(gk, 'LOE', loo, "DealClosed", events);   
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

  const client = usePublicClient();

  const [ deals, setDeals ] = useState<BriefProps[]>([]);
  const [ qty, setQty ] = useState(0n);
  const [ amt, setAmt ] = useState(0n);

  useEffect(()=>{

    const getEvents = async () => {

      if (!gk || addr.toLowerCase() == AddrZero.toLowerCase()) return;

      let rawLogs = await getAllLogs(gk, 'LOE', addr, 'DealClosed');

      let abiStr = 'event DealClosed(bytes32 indexed deal, uint indexed consideration)';

      type TypeOfDealClosedLog = ArbiscanLog & {
        eventName: string, 
        args: {
          deal: Hex,
          consideration:bigint,
        }
      }

      let dealLogs = rawLogs?.map(log => decodeArbiscanLog(log, abiStr) as TypeOfDealClosedLog) ?? [];

      let cnt = dealLogs.length;

      let qty:bigint = 0n;
      let amt:bigint = 0n;
      let arr:BriefProps[] = [];
      let counter = 0;

      while (cnt > 0) {

        let log = dealLogs[cnt-1];

        let deal:Brief = briefParser(log.args.deal ?? '0x00');
        let consideration: bigint = log.args.consideration;

        let classOfOrder = Number(deal.classOfShare);

        if (classOfShare != classOfOrder) {
          cnt--;
          continue;
        }

        let item:BriefProps = {
          blockNumber: BigInt(log.blockNumber),
          timestamp: BigInt(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
          seqOfDeal: counter,
          classOfShare: longSnParser(classOfShare.toString()),
          seqOfShare: longSnParser(deal.seqOfShare),
          buyer: longSnParser(deal.buyer),
          seller: longSnParser(deal.seller),
          paid: deal.paid,
          price: deal.price,
          votingWeight: deal.votingWeight,
          distrWeight: deal.distrWeight,
          consideration: consideration,
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

  const [ deal, setDeal ] = useState<BriefProps | undefined>();
  const [ show, setShow ] = useState<boolean>(false);

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:2, m:1, border:1, borderColor:'divider', width:'fit-content' }} >

      <Stack direction="row" sx={{alignItems:'center'}} >

          <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
            <b>LOE - List Of ETH Orders</b>
          </Typography>

          <Box width='168' sx={{ m:2}} >
            <CopyLongStrTF title="Addr"  src={ addr.toLowerCase() }  />
          </Box>

          <Box width='168' sx={{ m:2}} >
            <FormControl  size="small" sx={{ minWidth: 168 }}>
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

          {/* <Tooltip title='Video Tutorials' >
            <Link href='https://youtu.be/Ds4ndJiSzIM' passHref>
              <IconButton 
                component="a"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ml:8, mr:2}} color="primary"
              >
                <VideoCameraFront />
              </IconButton>
            </Link>
          </Tooltip>

          <Tooltip title='视频教程' >
            <Link href='https://youtu.be/Ds4ndJiSzIM' passHref>
              <IconButton
                component="a"
                target="_blank"
                rel="noopener noreferrer"
                sx={{mx:2}} color="primary"
              >
                <VideoCameraBackOutlined />
              </IconButton>
            </Link>
          </Tooltip> */}

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

export default ListOfOrders;