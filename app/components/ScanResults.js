import SeoMetrics from './SeoMetrics'

export default function ScanResults({ results }) {
  if (!results) return null

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">SEO Analysis Results</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Domain: {results.domain}</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Overall Score:</span>
          <span className={`text-2xl font-bold ${
            results.overallScore >= 80 ? 'text-green-600' : 
            results.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {results.overallScore}/100
          </span>
        </div>
      </div>

      <SeoMetrics metrics={results.metrics} />
    </div>
  )
}