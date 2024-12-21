import Head from 'next/head'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Sentiment Analysis</title>
        <meta name="description" content="Sentiment Analysis Tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

