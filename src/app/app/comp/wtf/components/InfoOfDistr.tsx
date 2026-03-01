

import { Paper, Stack, Typography } from "@mui/material";

import { baseToDollar, dateParser, longSnParser,  } from "../../../common/toolsKit";

import { DropInfo } from "../wtf";

export interface InfoOfDistrProps{
  info: DropInfo;
}

export function InfoOfDistr({info}: InfoOfDistrProps) {

  return (
    <Paper elevation={3} sx={{alignContent:'center', justifyContent:'center', p:2, m:1, border:1, borderColor:'divider' }} >

        <Typography variant='h5' sx={{ m:2, textDecoration:'underline' }}  >
          <b> {info.name} </b>
        </Typography>

      <Stack direction="row" sx={{alignItems:'center'}} >

        {/* <Typography variant='h5' sx={{ m:2, }}  >
          <b> {titles[1]} {titles[1].length > 0 && info.seqOfDistr.toString() }</b>
        </Typography> */}

        {/* <Typography variant='h5' sx={{ m:2, }}  >
          <b>{ titles[2] }  { titles[2].length > 0 && ': ' + longSnParser(info.member.toString()) }</b>
        </Typography> */}

        {/* <Typography variant='h5' sx={{ m:2, }}  >
          <b>{ titles[3] && ': ' + longSnParser(info.class.toString()) }</b>
        </Typography> */}

        <Typography variant='h5' sx={{ mx:4, }}  >
          <b>Date: {dateParser(info.distrDate.toString() ?? '0')}</b>
        </Typography>

        <Typography variant='h5' sx={{ mx:4, }}  >
          <b>Principal: {baseToDollar ((info.principal / 100n).toString() ?? '0')}</b>
        </Typography>

        <Typography variant='h5' sx={{ mx:4, }}  >
          <b>Income: {baseToDollar ((info.income / 100n).toString() ?? '0')}</b>
        </Typography>

      </Stack>

    </Paper>

  )
}