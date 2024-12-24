import Image from 'next/image'

export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <Image src="../logo.svg" alt="Sentiment Analysis Logo" width={40} height={40} />
      <span className="text-2xl font-bold text-blue-500">SentiMeter</span>
    </div>
  )
}

