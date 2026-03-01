
'use client'

import { Stack, Typography } from "@mui/material"

import Image from "next/image"
import Logo from '/public/assets/ComBoox_FullSlogan.png';
import { CreateComp } from "./components/CreateComp";
import { GetComp } from "./components/GetComp";

function FrontPage() {

  return (
    <Stack direction={'column'} sx={{ alignItems:'center', width:'100%' }} >

      <br/>

      <Image src={ Logo } alt='ComBoox Logo' />

      <Typography variant='h4' sx={{mt:5, mb:9}} >
        <b>A Company Book-Entry Platform On Blockchain</b>
      </Typography>

      <CreateComp />

      <GetComp />

    </Stack>
  )
}

export default FrontPage
