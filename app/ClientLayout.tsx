// app/ClientLayout.tsx
'use client'

type ClientLayoutProps = {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return <>{children}</>
}