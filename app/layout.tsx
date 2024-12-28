// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientLayout from './ClientLayout'

const inter = Inter({ subsets: ['latin'] })

// Method 1: Use generateMetadata function
export function generateMetadata(): Metadata {
  return {
    title: 'Sentiment Analysis Dashboard',
    description: 'Analyze social sentiment and market conditions',
  }
}

// Method 2: Or directly export metadata object (both work)
// export const metadata = {
//   title: 'Sentiment Analysis Dashboard',
//   description: 'Analyze social sentiment and market conditions',
// }

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