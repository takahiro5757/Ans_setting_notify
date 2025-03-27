'use client';

import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { Box, ThemeProvider, CssBaseline } from '@mui/material'
import theme from '@/theme'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ flex: 1 }}>
              {children}
            </Box>
          </Box>
        </ThemeProvider>
      </body>
    </html>
  )
} 