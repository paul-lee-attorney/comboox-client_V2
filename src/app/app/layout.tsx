"use client"

import React, { useState, useEffect } from 'react';

import Providers from '../_providers/Providers';
import { ComBooxAppBar } from './components/app_bar/ComBooxAppBar';

type AppLayoutProps = {
  children: React.ReactNode
}

export default function AppLayout({children}: AppLayoutProps) {

  const [mounted, setMounted] = useState(false)
  useEffect(()=>{
    setMounted(true);
  }, []);

  return (
    <>
      {mounted && (
        // <Providers>
          <ComBooxAppBar>
            { children }
          </ComBooxAppBar>
        // </Providers>
      )}
    </>
  )
}