import { useState } from 'react'

export default function HashtagInput({ onAnalyze }: { onAnalyze: (hashtag: string) => void }) {
  const [hashtag, setHashtag] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (hashtag.trim()) {
      onAnalyze(hashtag.trim())
    }
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Analyze Sentiment</h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={hashtag}
          onChange={(e) => setHashtag(e.target.value)}
          placeholder="Enter a hashtag"
          className="flex-grow px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500"
        />
        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
          Analyze
        </button>
      </form>
    </section>
  )
}

