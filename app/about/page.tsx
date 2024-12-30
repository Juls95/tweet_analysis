import Image from 'next/image'
import Link from 'next/link'
import { Github, Twitter } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-300 hover:text-blue-100">
            SentiMeter
          </Link>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/debug" className="text-blue-300 hover:text-blue-100">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-blue-300 hover:text-blue-100">
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4 text-blue-300">About SentiMeter</h1>
              <p className="text-lg text-gray-300 mb-6">
                SenTIAl helps you understand market trends and social sentiment through AI-powered analytics. We&apos;re focused on delivering high quality
                analytics and allow everyone to understand DeFi and ThenaFi sentiment based on actual tweets and the historic information
                stored in our servers.
              </p>
            </div>
            <div className="flex-1">
              <Image
                src="/about-hero.svg"
                alt="About SentiMeter"
                width={400}
                height={300}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-white/10 rounded-lg p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6 text-blue-200">Our Mission</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-100">Understanding Markets</h3>
                <p className="text-gray-300">
                  We provide real-time sentiment analysis of market trends and social media discussions to help you make informed decisions.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-100">AI-Powered Insights</h3>
                <p className="text-gray-300">
                  Using advanced machine learning algorithms, we analyze thousands of data points to provide accurate sentiment analysis.
                </p>
              </div>
            </div>
          </div>

          {/* Social Networks */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-8 text-blue-200">Connect With Us</h2>
            <div className="flex justify-center gap-6">
              <a 
                href="https://github.com/Juls95" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <Github className="w-6 h-6" />
                <span className="sr-only">GitHub</span>
              </a>
              <a 
                href="https://x.com/julsr_mx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <Twitter className="w-6 h-6" />
                <span className="sr-only">Twitter</span>
              </a>
            
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

