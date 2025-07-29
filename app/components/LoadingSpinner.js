export default function LoadingSpinner() {
  const scanningSteps = [
    { text: "Fetching website content...", icon: "🌐" },
    { text: "Analyzing HTML structure...", icon: "📄" },
    { text: "Checking meta tags...", icon: "🏷️" },
    { text: "Scanning for SEO issues...", icon: "🔍" },
    { text: "Generating recommendations...", icon: "💡" },
    { text: "Finalizing report...", icon: "📊" }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg border p-8 mb-8 absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Scanner Icon */}
        <div className="relative mb-6">
          <div className="w-16 h-16 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Website</h3>
        <p className="text-gray-600 mb-8">Please wait while we perform a comprehensive SEO audit...</p>

        {/* Progress Steps */}
        <div className="space-y-3">
          {scanningSteps.map((step, index) => (
            <div key={index} className="flex items-center justify-center space-x-3 text-gray-600">
              <span className="text-lg">{step.icon}</span>
              <span className="text-sm font-medium">{step.text}</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full animate-pulse" style={{
              width: '75%',
              animation: 'progress 3s ease-in-out infinite'
            }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">This usually takes 15-30 seconds</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0% }
          50% { width: 75% }
          100% { width: 100% }
        }
      `}</style>
    </div>
  )
}