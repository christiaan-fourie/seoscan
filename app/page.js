'use client'
import { useState } from 'react'
import ScanForm from './components/ScanForm'
import ScanResults from './components/ScanResults'
import ErrorDisplay from './components/ErrorDisplay'
import LoadingSpinner from './components/LoadingSpinner'

export default function Home() {
  const [scanResults, setScanResults] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState(null)

  const handleScan = async (domain) => {
    setIsScanning(true)
    setScanResults(null)
    setError(null)
    
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to scan website`)
      }
      
      const results = await response.json()
      
      if (!results || typeof results !== 'object') {
        throw new Error('Invalid response format from server')
      }
      
      setScanResults(results)
    } catch (error) {
      console.error('Scan failed:', error)
      
      // Categorize different types of errors
      let errorMessage = 'An unexpected error occurred while scanning the website.'
      let errorType = 'unknown'
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to the scanning service. Please check your internet connection.'
        errorType = 'network'
      } else if (error.message.includes('HTTP 404')) {
        errorMessage = 'Website not found. Please check the domain name and try again.'
        errorType = 'not_found'
      } else if (error.message.includes('HTTP 403')) {
        errorMessage = 'Access denied. The website may be blocking our scanner.'
        errorType = 'access_denied'
      } else if (error.message.includes('HTTP 500')) {
        errorMessage = 'Server error occurred while scanning. Please try again in a few moments.'
        errorType = 'server_error'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. The website may be taking too long to respond.'
        errorType = 'timeout'
      } else if (error.message) {
        errorMessage = error.message
        errorType = 'api_error'
      }
      
      setError({
        message: errorMessage,
        type: errorType,
        originalError: error.message,
        domain: domain,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleRetry = () => {
    if (error && error.domain) {
      handleScan(error.domain)
    }
  }

  const handleClearError = () => {
    setError(null)
  }

  const handleNewScan = () => {
    setScanResults(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SEO Scanner Pro
                </h1>
                <p className="text-sm text-gray-500">Professional SEO Analysis Tool</p>
              </div>
            </div>
            
            {scanResults && (
              <button
                onClick={handleNewScan}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Scan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          {!scanResults && !isScanning && (
            <div className="text-center mb-12">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Boost Your SEO 
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Performance</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Get comprehensive SEO analysis in seconds. Discover optimization opportunities, 
                fix technical issues, and improve your search engine rankings.
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">20+ SEO Checks</h3>
                  <p className="text-gray-600 text-sm">Comprehensive analysis covering technical SEO, content, and social media optimization.</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
                  <p className="text-gray-600 text-sm">Get detailed SEO insights and actionable recommendations in under 30 seconds.</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Expert Advice</h3>
                  <p className="text-gray-600 text-sm">Receive professional SEO recommendations to improve your search rankings.</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Scan Form */}
          <ScanForm onScan={handleScan} isScanning={isScanning} />
          
          {/* Loading State */}
          {isScanning && <LoadingSpinner />}
          
          {/* Error Display */}
          {error && (
            <ErrorDisplay 
              error={error} 
              onRetry={handleRetry} 
              onClear={handleClearError}
            />
          )}
          
          {/* Results */}
          {scanResults && <ScanResults results={scanResults} />}
          
          {/* Footer */}
          {!isScanning && (
            <div className="mt-16 text-center">
              <div className="bg-white rounded-xl p-8 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to improve your SEO?</h3>
                <p className="text-gray-600 mb-4">
                  Our comprehensive analysis covers everything from technical SEO to content optimization.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Free to use
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    No registration required
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Instant results
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
