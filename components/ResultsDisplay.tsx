interface SentimentResult {
    sentiment: 'positive' | 'neutral' | 'negative'
    score: number
    interactions: number
  }
  
  export default function ResultsDisplay({ result }: { result: SentimentResult | null }) {
    if (!result) return null
  
    const sentimentColor = 
      result.sentiment === 'positive' ? 'text-green-500' :
      result.sentiment === 'negative' ? 'text-red-500' :
      'text-yellow-500'
  
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="mb-4">
            Sentiment: <span className={`font-bold ${sentimentColor}`}>{result.sentiment}</span>
          </p>
          <p className="mb-4">
            Score: <span className="font-bold">{result.score.toFixed(2)}</span>
          </p>
          <p>
            Interactions: <span className="font-bold">{result.interactions}</span>
          </p>
        </div>
      </section>
    )
  }
  
  