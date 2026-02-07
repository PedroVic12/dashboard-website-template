import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'

import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

export const metadata: Metadata = {
  title: 'ONS Dashboard | Sistema Interligado Nacional',
  description: 'Dashboard de monitoramento do Sistema Elétrico Brasileiro - ONS',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#00b4d8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased bg-[#0a0f1c] min-h-screen">{children}</body>
    </html>
  )
}
