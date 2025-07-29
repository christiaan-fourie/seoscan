'use client'
import { useState } from 'react'

export default function ScanForm({ onScan, isScanning }) {
  const [domain, setDomain] = useState('')
  const [error, setError] = useState('')

  const validateDomain = (domain) => {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    return domainRegex.test(domain)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    if (!validateDomain(domain)) {
      setError('Please enter a valid domain name (e.g., example.com)')
      return
    }

    onScan(domain)
  }

  const handleExampleClick = (exampleDomain) => {
    setDomain(exampleDomain)
    setError('')
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border p-8 mb-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Website URL</h2>
          <p className="text-gray-600">Get a comprehensive SEO analysis of any website</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com or https://example.com"
                className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:outline-none transition-colors ${
                  error 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-blue-500'
                }`}
                disabled={isScanning}
              />
            </div>
            {error && (
              <div className="mt-3 flex items-center text-red-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isScanning}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg flex items-center justify-center space-x-3"
          >
            {isScanning ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Analyzing Website...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Start SEO Analysis</span>
              </>
            )}
          </button>
        </form>

        {/* Example domains */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">Try with these examples:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['google.com', 'github.com', 'stackoverflow.com'].map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                disabled={isScanning}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}