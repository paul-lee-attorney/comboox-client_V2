import * as React from 'react';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import Link from 'next/link';

export default function Copyright() {
  return (
    <Stack direction='row' sx={{ justifyContent:'center', my:5 }} >

      <Typography variant="body2" color="primary" align="center" sx={{mt:20, mr: 10}}>
        <Link href={{pathname:'https://comboox.gitbook.io/whitepaper-en'}}>
          WhitePaper
        </Link>
      </Typography>

      <Typography variant="body2" color="primary" align="center" sx={{mt:20, mr: 10}}>
        <Link href={{pathname:'https://comboox.gitbook.io/whitepaper'}}>
          白皮书
        </Link>
      </Typography>

      <Typography variant="body2" color="primary" align="center" sx={{mt:20}}>
        <Link href={{pathname:'https://jingtian.com/Content/2020/03-11/1525064223.html'}}>
          Copyright (c) 2021-2024 Li Li
        </Link>
      </Typography>

      <Typography variant="body2" color="text.secondary" align="center" sx={{mt:20, ml:10}}>
        <Link href={{pathname:'/about/LICENSE'}}>
          License
        </Link>
      </Typography>

      <Typography variant="body2" color="text.secondary" align="center" sx={{mt:20, ml:10}}>
        <Link href="https://github.com/paul-lee-attorney/comboox">
          GitHub (Smart Contracts)
        </Link>
      </Typography>

      <Typography variant="body2" color="text.secondary" align="center" sx={{mt:20, ml:10}}>
        <Link href="https://github.com/paul-lee-attorney/comboox-client">
          GitHub (Dapp UI)
        </Link>
      </Typography>
    </Stack>
  );
}
