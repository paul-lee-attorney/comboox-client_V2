// 'use client'

import { Metadata } from 'next';
import Copyright from './components/Copyright';
import Providers from './_providers/Providers';

export const metadata: Metadata = {
  title: 'ComBoox',
  description: 'A Blockchain Based Company Book-Entry Platform',
}

type RootLayoutProps= {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
    
  return (
    <html lang="en">
        <Providers>
          <body>
            <main>{ children }</main>
            <Copyright />
          </body>
        </Providers>
    </html>
  )
}