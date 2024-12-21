import { useState } from 'react'

export default function EmailCollection() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Email is required')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format')
      return
    }
    setError('')
    // Here you would typically send the email to your backend
    console.log('Email submitted:', email)
    setEmail('')
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-grow px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        />
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Subscribe
        </button>
      </form>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </section>
  )
}

