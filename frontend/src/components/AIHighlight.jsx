import { Sparkles, Loader2 } from 'lucide-react'

const AIHighlight = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-primary-50 to-success-50 border border-primary-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary-600 mr-2" />
          <span className="text-primary-600">Generating AI summary...</span>
        </div>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="bg-gradient-to-r from-primary-50 to-success-50 border border-primary-200 rounded-xl p-6 mb-6">
      <div className="flex items-start">
        <div className="bg-primary-100 rounded-full p-2 mr-4 flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Community Summary
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {summary.summaryText || summary.summary || summary.text || 'No summary available'}
          </p>
          {summary.keyPoints && summary.keyPoints.length > 0 && (
            <ul className="mt-3 space-y-1">
              {summary.keyPoints.map((point, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  {point}
                </li>
              ))}
            </ul>
          )}
          {summary.stats && (
            <div className="mt-3 flex gap-4 text-sm">
              {summary.stats.totalPosts && (
                <span className="text-gray-600">
                  <span className="font-semibold text-primary-600">{summary.stats.totalPosts}</span> posts
                </span>
              )}
              {summary.stats.emergencyCount && (
                <span className="text-gray-600">
                  <span className="font-semibold text-red-600">{summary.stats.emergencyCount}</span> emergencies
                </span>
              )}
            </div>
          )}
          {(summary.updatedAt || summary.createdAt || summary.dateISO) && (
            <p className="text-xs text-gray-500 mt-2">
              Last updated: {new Date(summary.updatedAt || summary.createdAt || summary.dateISO).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIHighlight


