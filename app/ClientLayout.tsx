// app/ClientLayout.tsx (Client Component)
'use client'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen">{children}</div>
}