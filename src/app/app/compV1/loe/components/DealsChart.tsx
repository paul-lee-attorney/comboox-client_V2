import { IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";

import { dateParser } from "../../../common/toolsKit";
import { Brief, briefParser, } from "../loe";
import { AllSeriesType, axisClasses, BarPlot, ChartsAxisHighlight, ChartsTooltip, ChartsXAxis, ChartsYAxis, LineHighlightPlot, LinePlot, ResponsiveChartContainer } from "@mui/x-charts";
import { useEffect, useState } from "react";
import { useComBooxContext } from "../../../../_providers/ComBooxContextProvider";
import { AddrZero, booxMap } from "../../../common";
import { usePublicClient } from "wagmi";
import { Refresh } from "@mui/icons-material";
import { ArbiscanLog, decodeArbiscanLog, getAllLogs } from "../../../../api/firebase/arbiScanLogsTool";
import { Hex } from "viem";

interface DealChartProps {
  classOfShare: number;
  time: number;
  refresh: ()=>void;
}

interface ChartItem {
  timestamp: bigint;
  high: bigint;
  low: bigint;
  volumn: bigint;
}

export function DealsChart({classOfShare, time, refresh}: DealChartProps) {

  const { gk, boox } = useComBooxContext();
  const client = usePublicClient();
  const [line, setLine] = useState<ChartItem[]>([]);

useEffect(()=>{

  const getEvents = async () => {

    if (!gk || !boox || boox[booxMap.LOO] == AddrZero) return;

    const addr = boox[booxMap.LOO];

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

    dealLogs = dealLogs.sort((a, b)=> {
      if (BigInt(a.blockNumber) > BigInt(b.blockNumber)) return 1;
      if (BigInt(a.blockNumber) < BigInt(b.blockNumber)) return -1;
      return Number(a.logIndex) - Number(b.logIndex);
    });

    let cnt = dealLogs.length;
    let arr:ChartItem[] = [];
    let i = cnt > 1800 ? cnt - 1800 : 0;
    let len = 0;
 
    while ( i < cnt ) {

      let log = dealLogs[i];
      let deal:Brief = briefParser(log.args.deal ?? '0x00');

      if (classOfShare != Number(deal.classOfShare)) {
        i++;
        continue;
      }

      let item:ChartItem = {
        timestamp: BigInt(log.timeStamp),
        volumn: deal.paid,
        high: deal.price,
        low: deal.price,
      }

      if (len > 0) {

        let lastItem = arr[len-1];

        if (lastItem.timestamp == item.timestamp) {
          if (item.high > lastItem.high) arr[len-1].high = item.high;
          if (item.low < lastItem.low) arr[len-1].low = item.low;
          arr[len-1].volumn += item.volumn;
        } else {
          arr.push(item);
          len++;
        }

      } else {
        arr.push(item);
        len++;
      }

      i++;

    }
    setLine(arr);
  }

  getEvents();

},[gk, boox, client, classOfShare, time, setLine]);

  const series = [
    {
      type: 'bar',
      yAxisId: 'volume',
      label: 'Volume',
      color: 'lightgray',
      data: line.map((item) => Number(item.volumn)/10000),
      highlightScope: { highlight: 'item' },
    },
    {
      type: 'line',
      yAxisId: 'price',
      color: 'green',
      label: 'Low',
      data: line.map((item) => Number(item.low)/10000),
      highlightScope: { highlight: 'item' },
    },
    {
      type: 'line',
      yAxisId: 'price',
      color: 'red',
      label: 'High',
      data: line.map((item) => Number(item.high)/10000),
    },
  ] as AllSeriesType[];
  
  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:1, m:1, border:1, borderColor:'divider' }} >

      <Stack direction={'row'} sx={{ alignItems:'center' }} >
        <Typography variant='h5' sx={{ m:2, textDecoration:'underline'  }}  >
          <b>Deals Chart</b>  
        </Typography>

        <Tooltip 
          title='Refresh List' 
          placement='right' 
          arrow 
        >
          <IconButton
            size='small'
            sx={{ mx:5 }}
            onClick={()=>refresh()}
            color="primary"
          >
            <Refresh />
          </IconButton>
        </Tooltip>

      </Stack>

        <ResponsiveChartContainer
          series={series}
          height={400}
          margin={{ top: 10, left: 80, right: 80 }}
          xAxis={[
            {
              id: 'date',
              data: line.map((item) => Number(item.timestamp)),
              scaleType: 'band',
              valueFormatter: (value) => dateParser(value.toString()),
            },
          ]}
          yAxis={[
            {
              id: 'price',
              scaleType: 'linear',
            },
            {
              id: 'volume',
              scaleType: 'linear',
              valueFormatter: (value) => `${(value).toLocaleString()}`,
            },
          ]}
        >
          <ChartsAxisHighlight x="line" />
          <BarPlot />
          <LinePlot />

          <LineHighlightPlot />
          <ChartsXAxis
            label="Timestamp"
            position="bottom"
            axisId="date"
            tickInterval={(value, index) => {
              return index % 5 == 0;
            }}
            tickLabelStyle={{
              fontSize: 10,
            }}
          />
          <ChartsYAxis
            label="Price"
            position="left"
            axisId="price"
            tickLabelStyle={{ fontSize: 10 }}
            sx={{
              [`& .${axisClasses.label}`]: {
                transform: 'translateX(-30px)',
              },
            }}
          />
          <ChartsYAxis
            label="Volume"
            position="right"
            axisId="volume"
            tickLabelStyle={{ fontSize: 10 }}
            sx={{
              [`& .${axisClasses.label}`]: {
                transform: 'translateX(30px)',
              },
            }}
          />
          <ChartsTooltip />
        </ResponsiveChartContainer>

    </Paper>
  );
} 