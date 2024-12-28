// app/layout.tsx
// NO 'use client' directive here!
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientLayout from './ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sentiment Analysis Dashboard',
  description: 'Analyze social sentiment and market conditions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}