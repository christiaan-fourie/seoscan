export default function ErrorDisplay({ error, onRetry, onClear }) {
  const getErrorIcon = (type) => {
    switch (type) {
      case 'network': return '🌐'
      case 'not_found': return '🔍'
      case 'access_denied': return '🚫'
      case 'server_error': return '⚠️'
      case 'timeout': return '⏰'
      default: return '❌'
    }
  }

  const getErrorColor = (type) => {
    switch (type) {
      case 'network': return 'border-blue-200 bg-blue-50'
      case 'not_found': return 'border-yellow-200 bg-yellow-50'
      case 'access_denied': return 'border-orange-200 bg-orange-50'
      case 'server_error': return 'border-red-200 bg-red-50'
      case 'timeout': return 'border-purple-200 bg-purple-50'
      default: return 'border-red-200 bg-red-50'
    }
  }

  const getSuggestions = (type) => {
    switch (type) {
      case 'network':
        return [
          'Check your internet connection',
          'Try again in a few moments',
          'Disable any VPN or proxy temporarily'
        ]
      case 'not_found':
        return [
          'Verify the domain name is correct',
          'Make sure the website is online',
          'Try with or without "www" prefix'
        ]
      case 'access_denied':
        return [
          'The website may be blocking automated requests',
          'Try again later',
          'Some websites restrict access to scanners'
        ]
      case 'server_error':
        return [
          'Our scanning service encountered an issue',
          'Please try again in a few minutes',
          'Contact support if the problem persists'
        ]
      case 'timeout':
        return [
          'The website is taking too long to respond',
          'Try again with a faster website',
          'Some websites may be slow or overloaded'
        ]
      default:
        return [
          'Please try again',
          'Contact support if the problem continues'
        ]
    }
  }

  return (
    <div className={`rounded-lg border-2 p-6 mb-8 ${getErrorColor(error.type)}`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{getErrorIcon(error.type)}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Scan Failed
          </h3>
          <p className="text-gray-700 mb-4">
            {error.message}
          </p>
          
          {error.domain && (
            <p className="text-sm text-gray-600 mb-4">
              <strong>Domain:</strong> {error.domain}
            </p>
          )}

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Suggestions:</h4>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              {getSuggestions(error.type).map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Try Again
            </button>
            <button
              onClick={onClear}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Dismiss
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                Technical Details (Development Only)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-600 font-mono">
                <p><strong>Error Type:</strong> {error.type}</p>
                <p><strong>Original Error:</strong> {error.originalError}</p>
                <p><strong>Timestamp:</strong> {error.timestamp}</p>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}