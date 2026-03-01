'use client'

import { Box, Paper, Stack, Typography, } from "@mui/material"

import { TitleBar } from "./components/TitleBar";

import Logo from "/public/assets/ComBoox_FullSlogan.png";
import Image from "next/image";

function FrontPage() {

  return (
    <Stack direction={'column'} sx={{alignItems:'center', width:'100%' }} >
      <TitleBar />

      <Stack direction='column' sx={{mt:10, mb:1}} >
        <Image src={Logo} alt='ComBoox Logo' />

        <Typography variant="h5" component="div" sx={{ flexGrow: 1, m:2, color:'GrayText' }}>
          <b>---- A Company Book-Entry Platform On Blockchain</b>
        </Typography>
      </Stack>

      <Box sx={{ mt:2, width:1180 }}>
        <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider'}}>

          <Typography variant="h5" component="div" sx={{ flexGrow: 1, m:2, textDecoration:'underline' }}>
            <b>System Overview</b>
          </Typography>


          <Typography variant="h6" component="div" sx={{ flexGrow: 1, m:2 }} color='text.secondary'>
            <p><b>ComBoox</b> is a blockchain-based company book-entry platform designed for registering <b>equity shares</b> and keeping corporate <b>statutory books</b>, which is aimed to assist users to quickly establish a legal, secure, transparent and reliable smart contracts system, so as to enable investors, shareholders, executive officers, business partners to conduct legal acts around equity rights in a <b>self-service</b> mode, including share subscription, share transfer, share pledge, paying consideration, signing contracts, proposing, voting, nominating, inauguration and resignation etc.</p>

            <p><b>Unlike</b> pure share certificates tokenization, ComBoox does <b>NOT</b> rely on legal documents to restrict off-chain behavior. Instead, it uses smart contracts to fully control <b>ALL</b> activities of share transactions and corporate governance, so as to completely eliminate the possibilities of default or violation.</p>
            
            <p>Therefore, <b>ComBoox</b> provides a brand new concept and solution to solve the problems of <b>Insiders Control</b> or <b>Misleading Statements</b> that have plagued the capital markets for many years, and may completely realize:</p>
            
            <ol>
              <li>right holders may <b>directly</b> exercise rights;</li>
              <li>obligors have <b>no chance</b> to default;</li>
              <li><b>real-time</b> information disclosure; and </li>
              <li><b>tokenization</b> of equity shares in a <b>complete</b> sense. </li>
            </ol>

            <p>By booking equity shares on-chain, investors may use <b>crypto currencies</b> to pay equitys consideration, which means effectively connecting the company’s equity shares to the trillion-dollar crypto markets, so that the companies may have a potential opportunity to have their equity value reevaluated and reconfirmed with the robust support of the huge liquidity.</p>
          </Typography>

        </Paper>
      </Box>

      <Box sx={{ mt:2, width:1180}}>
        <Paper elevation={3} sx={{m:1, p:1, border:1, borderColor:'divider'}}>
          <iframe width="100%" height="688" src="https://www.youtube.com/embed/FCEKZAFHKxU?si=yUHugdLv60IGlnsv" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ></iframe>
        </Paper>
      </Box>


    </Stack>
  )
}

export default FrontPage
