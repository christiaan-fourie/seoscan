export default function SeoMetrics({ metrics }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'fail': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return '✓'
      case 'warning': return '⚠'
      case 'fail': return '✗'
      default: return '?'
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">SEO Metrics</h3>
      
      {metrics.map((metric, index) => (
        <div key={index} className="border border-gray-200 rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{metric.name}</h4>
            <span className={`font-bold ${getStatusColor(metric.status)}`}>
              {getStatusIcon(metric.status)} {metric.score}/100
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{metric.description}</p>
          
          {metric.issues && metric.issues.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-red-600 mb-1">Issues:</p>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {metric.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          {metric.recommendations && metric.recommendations.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-blue-600 mb-1">Recommendations:</p>
              <ul className="text-sm text-blue-600 list-disc list-inside">
                {metric.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}