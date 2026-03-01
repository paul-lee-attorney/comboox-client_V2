"use client"

import { useEffect, useState } from "react";

import { Box, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";

import { CopyLongStrTF } from "../../common/CopyLongStr";
import { AddrZero, booxMap, Bytes32Zero } from "../../common";

import { ActionsOfRequest } from "./components/ActionsOfRequest";
import { useComBooxContext } from "../../../_providers/ComBooxContextProvider";
import { baseToDollar, } from "../../common/toolsKit";
import { SetBookAddr } from "../../components/SetBookAddr";

import { getClassesList, getInfoOfClass, RequestProps, Request, getAllRequests, requestParser } from "./ror";
import { RequestsList } from "./components/RequestsList";
import { usePublicClient } from "wagmi";
import { ArbiscanLog, autoUpdateLogs, decodeArbiscanLog, fetchArbiscanData, getAllLogs, getTopBlkOf, setLogs, setTopBlkOf, upsertMenuOfLogs } from "../../../api/firebase/arbiScanLogsTool";
import { Hex, keccak256, toHex } from "viem";

function RegisterOfRedemptions() {

  const {gk, boox} = useComBooxContext();

  const [addr, setAddr] = useState(boox ? boox[booxMap.ROR] : AddrZero);

  const [ time, setTime ] = useState<number>(0);

  const client = usePublicClient();

  const updateRedeemedLogs = async ()=>{
    if (!gk || !addr) return;
    const blk = await client.getBlock();
    const toBlk = blk.number;
    let chainId = await client.getChainId();
    let ror = addr;

    let fromBlk = await getTopBlkOf(gk, ror);

    if (fromBlk == 1n || fromBlk >= toBlk) return false;
    else fromBlk++;

    let data = await fetchArbiscanData(chainId, ror, fromBlk, toBlk);
      
    if (data) {
      let logs = data.result;

      if (logs.length > 0) {

        // ---- Redeemed Pack ----

        let name = "RedeemedPack";
        let topic0 = keccak256(toHex("RedeemedPack(bytes32)"));
        
        let events = logs.filter((v) => {
          return v.topics[0]?.toLowerCase() == topic0.toLowerCase();
        });

        if (events.length > 0) {
            let flag = await setLogs(gk, 'ROR', ror, "RedeemedPack", events);   
            if (flag) console.log('appended', events.length, ' events of ', name);
            else return false;
        }

        // ---- Redeemed Share ----

        name = "RedeemedShare";
        topic0 = keccak256(toHex("RedeemedShare(bytes32)"));
        
        events = logs.filter((v) => {
          return v.topics[0]?.toLowerCase() == topic0.toLowerCase();
        });

        if (events.length > 0) {
            let flag = await setLogs(gk, 'ROR', ror, "RedeemedShare", events);   
            if (flag) console.log('appended', events.length, ' events of ', name);
            else return false;
        }

      }
    }

    let flag = await setTopBlkOf(gk, ror, toBlk);
    if (!flag) return false;
  }

  const refresh = ()=>{
    updateRedeemedLogs();
    setTime(Date.now());
  }

  const [ classes, setClasses ] = useState<number[]>([]);
  const [ classOfShare, setClassOfShare ] = useState<number>(0);

  useEffect(()=>{
    if (addr) {
      getClassesList(addr).
        then(res => (setClasses(res)));
    }
  }, [addr, time])

  const [info, setInfo] = useState<Request>();

  useEffect(()=>{
    if (classOfShare > 0 && addr != AddrZero) {
      getInfoOfClass(addr, classOfShare).then(
        res => setInfo(res)
      );
    }
  }, [classOfShare, addr, time]);

  const [ list, setList ] = useState<RequestProps[]>([]);

  useEffect(()=>{
    if (addr != AddrZero && classOfShare != 0) {
      getAllRequests(addr, classOfShare).then(
        res => setList(res.map((v,i)=>({...v, 
          seqNum: i+1,
          blockNumber: 0n,
          timestamp: 0n,
          transactionHash: Bytes32Zero,
        })))
      );
    }
  }, [addr, classOfShare, time]);

  const [ redPacks, setRedPacks ] = useState<RequestProps[]>([]);

  useEffect(()=>{

    const getEvents = async () => {

      if (!gk || addr.toLowerCase() == AddrZero.toLowerCase()) return;

      let rawLogs = await getAllLogs(gk, 'ROR', addr, 'RedeemedPack');

      let abiStr = 'event RedeemedPack(bytes32 indexed sn)';

      type TypeOfRedeemedPackLog = ArbiscanLog & {
        eventName: string, 
        args: {sn: Hex}
      }

      let dealLogs = rawLogs?.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRedeemedPackLog) ?? [];

      let cnt = dealLogs.length;

      let arr:RequestProps[] = [];
      let counter = 1;

      while (cnt > 0) {

        let log = dealLogs[cnt-1];
        let pack:Request = requestParser(log.args.sn ?? Bytes32Zero);

        if (classOfShare != pack.class) {
          cnt--;
          continue;
        }

        let item:RequestProps = {
          ...pack,

          seqNum: counter,

          blockNumber: BigInt(log.blockNumber),
          timestamp: BigInt(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
        }

        cnt--;

        arr.push(item); 
        counter++;
      }

      setRedPacks(arr);
    }

    getEvents();

  },[gk, addr, client, classOfShare, time]);  

  const [ redShares, setRedShares ] = useState<RequestProps[]>([]);

  useEffect(()=>{

    const getEvents = async () => {

      if (!gk || addr.toLowerCase() == AddrZero.toLowerCase()) return;

      let rawLogs = await getAllLogs(gk, 'ROR', addr, 'RedeemedShare');

      let abiStr = 'event RedeemedShare(bytes32 indexed sn)';

      type TypeOfRedeemedShareLog = ArbiscanLog & {
        eventName: string, 
        args: {sn: Hex}
      }

      let dealLogs = rawLogs?.map(log => decodeArbiscanLog(log, abiStr) as TypeOfRedeemedShareLog) ?? [];

      let cnt = dealLogs.length;

      let arr:RequestProps[] = [];
      let counter = 1;

      while (cnt > 0) {

        let log = dealLogs[cnt-1];
        let share:Request = requestParser(log.args.sn ?? Bytes32Zero);

        if (classOfShare != share.class) {
          cnt--;
          continue;
        }

        let item:RequestProps = {
          ...share,

          seqNum: counter,

          blockNumber: BigInt(log.blockNumber),
          timestamp: BigInt(log.timeStamp),
          transactionHash: log.transactionHash ?? Bytes32Zero,
        }

        cnt--;

        arr.push(item); 
        counter++;
      }

      setRedPacks(arr);
    }

    getEvents();
  },[gk, addr, client, classOfShare, time]);  

  useEffect(()=>{

    const updateMenu = async ()=> {
      if (!gk || !addr) return;

      let items = [
        {
          title: 'ROR',
          address: addr,
          name: 'RedeemedPack',
          abiStr: 'RedeemedPack(bytes32)',
        },
        {
          title: 'ROR',
          address: addr,
          name: 'RedeemedShare',
          abiStr: 'RedeemedShare(bytes32)',
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
            <b>ROR - Register of Redemptions</b>
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

      <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:2, m:1, border:1, borderColor:'divider' }} >

        <Stack direction="row" sx={{alignItems:'center'}} >

          <Typography variant='h5' sx={{ m:2, }}  >
            <b>Class: { classOfShare.toString() }</b>
          </Typography>

          <Typography variant='h5' sx={{ mx:4, }}  >
            <b>NAV Price: { baseToDollar(info?.navPrice.toString() ?? '0')}</b>
          </Typography>

          <Typography variant='h5' sx={{ mx:4, }}  >
            <b>Requested Paid: { baseToDollar(info?.paid.toString() ?? '0')}</b>
          </Typography>

          <Typography variant='h5' sx={{ mx:4, }}  >
            <b>Requested Value: { baseToDollar(info?.value.toString() ?? '0')}</b>
          </Typography>

        </Stack>

      </Paper>

      <ActionsOfRequest classOfShare={classOfShare} refresh={refresh} />

      {list.length > 0 && (
        <RequestsList titleOfList={'Requests List'} paid={list.reduce((a,c) => a + c.paid, 0n)} value={list.reduce((a,c)=>a+c.value,0n)} list={list} refresh={refresh} />
      )}

      {redPacks.length > 0 && (
        <RequestsList titleOfList={'Redeemed Packs'} paid={redPacks.reduce((a,c) => a + c.paid, 0n)} value={redPacks.reduce((a,c)=>a+c.value,0n)} list={redPacks} refresh={refresh} />
      )}

      {redShares.length > 0 && (
        <RequestsList titleOfList={'Redeemed Shares'} paid={redShares.reduce((a,c) => a + c.paid, 0n)} value={redShares.reduce((a,c)=>a+c.value,0n)} list={redShares} refresh={refresh} />
      )}

    </Paper>
  );
} 

export default RegisterOfRedemptions;