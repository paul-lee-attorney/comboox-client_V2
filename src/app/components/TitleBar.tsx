import { AutoStoriesOutlined, GitHub, MenuBook, TouchAppOutlined } from "@mui/icons-material";
import { AppBar, Box, CssBaseline, IconButton, Stack, Toolbar, Tooltip, Typography } from "@mui/material";
import Image from "next/image";
import Logo from '/public/assets/Symbol_white_xs.png';
import Link from "next/link";

export function TitleBar() {
  return(
    <AppBar>
      <Box sx={{ flexGrow: 1, width:'100%' }}>
          <CssBaseline />
          <Toolbar sx={{ justifyContent:'space-between' }} >
            <Stack direction='row' sx={{ alignItems:'center' }} >
              <Image src={Logo} alt='ComBoox Symbol' />

              <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml:2 }}>
                ComBoox
              </Typography>
            </Stack>

            <Stack direction='row' sx={{ justifyContent:'start', alignItems:'center' }} >

              <Tooltip title='White Paper' >
                <Link href={{pathname:'https://comboox.gitbook.io/whitepaper-en'}}>
                  <IconButton sx={{mx:2, color:'#fff'}}>
                    <MenuBook />
                  </IconButton>
                </Link>
              </Tooltip>

              <Tooltip title='白皮书' >
                <Link href={{pathname:'https://comboox.gitbook.io/whitepaper-cn'}}>
                  <IconButton sx={{mx:2, color:'#fff'}}>
                    <AutoStoriesOutlined />
                  </IconButton>
                </Link>
              </Tooltip>

              <Tooltip title='Smart Contracts' >
                <Link href="https://github.com/paul-lee-attorney/comboox">
                  <IconButton sx={{mx:2, color:'#fff'}}>
                    <GitHub /> 
                  </IconButton>                  
                </Link>
              </Tooltip>

              <Tooltip title='Launch App' >
                <Link href="/app">
                  <IconButton sx={{ml:2, mr:10, color:'#fff'}}>
                    <TouchAppOutlined /> 
                  </IconButton>                 
                </Link> 
              </Tooltip>

            </Stack>
          </Toolbar>
      </Box>
    </AppBar>

  );
}

