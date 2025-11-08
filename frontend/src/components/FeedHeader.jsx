import { Filter, X } from 'lucide-react'
import useStore from '../store/useStore'

const categories = ['Safety', 'Events', 'Lost & Found', 'Public Works', 'General']
const priorities = ['Emergency', 'Urgent', 'Normal']

const FeedHeader = () => {
  const { filters, setFilters, clearFilters } = useStore()
  const hasActiveFilters = filters.category || filters.priority || filters.tag

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Community Feed</h1>
      
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters:</span>
        </div>

        {/* Category Filter */}
        <select
          value={filters.category || ''}
          onChange={(e) => setFilters({ category: e.target.value || null })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority || ''}
          onChange={(e) => setFilters({ priority: e.target.value || null })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Priorities</option>
          {priorities.map((pri) => (
            <option key={pri} value={pri}>
              {pri}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

export default FeedHeader


