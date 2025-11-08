import { Clock, MapPin, User, Tag } from 'lucide-react'
import { cn } from '../utils/cn'

const PostCard = ({ post }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'emergency':
        return 'bg-danger-100 text-danger-800 border-danger-300'
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-success-100 text-success-800 border-success-300'
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      Safety: 'bg-danger-50 text-danger-700',
      Events: 'bg-primary-50 text-primary-700',
      'Lost & Found': 'bg-yellow-50 text-yellow-700',
      'Public Works': 'bg-blue-50 text-blue-700',
      General: 'bg-gray-50 text-gray-700',
    }
    return colors[category] || colors.General
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'Just now'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image */}
      {post.imageUrl && (
        <div className="w-full h-48 overflow-hidden bg-gray-200">
          <img
            src={post.imageUrl}
            alt={post.text || 'Post image'}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
        {/* Priority Badge */}
        {post.priority && (
          <div className="mb-3">
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                getPriorityColor(post.priority)
              )}
            >
              {post.priority}
            </span>
          </div>
        )}

        {/* Post Text */}
        <p className="text-gray-900 font-medium mb-4 line-clamp-3">
          {post.text || post.content || 'No content'}
        </p>

        {/* Category */}
        {post.category && (
          <div className="mb-3">
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium',
                getCategoryColor(post.category)
              )}
            >
              {post.category}
            </span>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{post.author?.name || post.authorName || 'Anonymous'}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatTime(post.createdAt || post.timestamp)}</span>
            </div>
          </div>
          {post.location && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="truncate max-w-[100px]">{post.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostCard


