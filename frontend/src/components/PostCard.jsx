import { Clock, MapPin, User, Tag, ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '../utils/cn'
import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'
import { postsAPI } from '../services/api'
import toast from 'react-hot-toast'

const PostCard = ({ post }) => {
  const { user } = useAuth0()
  const [upvotes, setUpvotes] = useState(post.upvotes || 0)
  const [downvotes, setDownvotes] = useState(post.downvotes || 0)
  const [userVote, setUserVote] = useState(post.votedBy?.find(v => v.userId === user?.sub)?.vote || null)
  const [voting, setVoting] = useState(false)

  const handleVote = async (vote) => {
    if (voting || !user) {
      if (!user) toast.error('Please log in to vote')
      return
    }

    setVoting(true)
    try {
      const response = await postsAPI.vote(post._id, vote)
      setUpvotes(response.data.upvotes || upvotes)
      setDownvotes(response.data.downvotes || downvotes)
      setUserVote(response.data.userVote || null)
    } catch (error) {
      console.error('Vote failed:', error)
      if (error.response?.status === 401) {
        toast.error('Please log in to vote')
      } else {
        toast.error('Failed to vote')
      }
    } finally {
      setVoting(false)
    }
  }

  const netVotes = upvotes - downvotes

  const getPriorityColor = (urgency) => {
    const level = urgency?.toLowerCase()
    switch (level) {
      case 'emergency':
        return 'bg-danger-50 text-danger-700 border-danger-200'
      case 'urgent':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      default:
        return '' // Don't show badge for 'normal'
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      Safety: 'bg-danger-50 text-danger-700 border-danger-200',
      Events: 'bg-primary-50 text-primary-700 border-primary-200',
      'Lost & Found': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Public Works': 'bg-blue-50 text-blue-700 border-blue-200',
      General: 'bg-gray-50 text-gray-700 border-gray-200',
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
    <article className="card card-hover overflow-hidden animate-fade-in group">
      {/* Image */}
      {post.imageUrl && (
        <div className="w-full h-48 overflow-hidden bg-gray-100 relative">
          <img
            src={post.imageUrl}
            alt={post.text || 'Post image'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Priority Badge Overlay - Only show if not 'normal' */}
          {(post.urgency || post.priority) && (post.urgency?.toLowerCase() !== 'normal' && post.priority?.toLowerCase() !== 'normal') && (
            <div className="absolute top-3 left-3">
              <span
                className={cn(
                  'badge border backdrop-blur-sm',
                  getPriorityColor(post.urgency || post.priority)
                )}
              >
                {post.urgency || post.priority}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Priority Badge (if no image) - Only show if not 'normal' */}
        {(post.urgency || post.priority) && !post.imageUrl && (post.urgency?.toLowerCase() !== 'normal' && post.priority?.toLowerCase() !== 'normal') && (
          <div className="mb-3">
            <span
              className={cn(
                'badge border',
                getPriorityColor(post.urgency || post.priority)
              )}
            >
              {post.urgency || post.priority}
            </span>
          </div>
        )}

        {/* Post Text */}
        <p className="text-gray-900 font-medium mb-4 line-clamp-3 leading-relaxed">
          {post.text || post.content || 'No content'}
        </p>

        {/* Category & Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {post.category && (
            <span
              className={cn(
                'badge border text-xs',
                getCategoryColor(post.category)
              )}
            >
              {post.category}
            </span>
          )}
          {post.tags && post.tags.length > 0 && (
            <>
              {post.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-200"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </>
          )}
        </div>

        {/* Meta Info Header - Matching Image Layout */}
        <div className="flex items-center flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-gray-100">
          {/* Left Side: Voting, User, Time */}
          <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
            {/* Vote Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote(1)}
                disabled={voting}
                className={cn(
                  "py-1.5 px-3 text-center border border-gray-300 rounded-md h-8 text-sm flex items-center gap-1 lg:gap-2 transition-all duration-200",
                  userVote === 1 
                    ? 'text-success-600 bg-success-50 border-success-300' 
                    : 'text-gray-600 hover:text-success-600 hover:scale-105 hover:shadow',
                  voting && 'opacity-50 cursor-not-allowed'
                )}
                title="Upvote"
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="font-medium">{upvotes}</span>
              </button>

              <button
                onClick={() => handleVote(-1)}
                disabled={voting}
                className={cn(
                  "py-1.5 px-3 text-center border border-gray-300 rounded-md h-8 text-sm flex items-center gap-1 lg:gap-2 transition-all duration-200",
                  userVote === -1 
                    ? 'text-danger-600 bg-danger-50 border-danger-300' 
                    : 'text-gray-600 hover:text-danger-600 hover:scale-105 hover:shadow',
                  voting && 'opacity-50 cursor-not-allowed'
                )}
                title="Downvote"
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="font-medium">{downvotes}</span>
              </button>
            </div>
            
            {/* User */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <User className="w-4 h-4 text-black flex-shrink-0" />
              <span className="text-gray-600">{post.author?.name || post.authorName || 'Anonymous'}</span>
            </div>
            
            {/* Time */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-gray-600">{formatTime(post.createdAt || post.timestamp)}</span>
            </div>
          </div>

          {/* Right Side: Location */}
          {post.location && (
            <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
              <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span className="text-gray-600" title={post.location}>{post.location}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export default PostCard


