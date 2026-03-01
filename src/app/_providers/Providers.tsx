'use client'

import React from 'react';
import WagmiProvider from './WagmiProvider';
import { ComBooxContextProvider } from './ComBooxContextProvider';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

type ProviderType = {
  children: React.ReactNode
}

const Providers = ({children}: ProviderType) => {
  return (
    <WagmiProvider>
      <ComBooxContextProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs} >
          {children}
        </LocalizationProvider>
      </ComBooxContextProvider>
    </WagmiProvider>
  )
}

export default Providers