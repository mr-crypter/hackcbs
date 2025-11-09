import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import useStore from '../store/useStore'
import { postsAPI, aiAPI } from '../services/api'
import FeedHeader from '../components/FeedHeader'
import PostCard from '../components/PostCard'
import AIHighlight from '../components/AIHighlight'
import PostFormModal from '../components/PostFormModal'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const Feed = () => {
  const { posts, setPosts, setLoading, filters, setAISummary, aiSummary, loading } = useStore()
  const { getAccessTokenSilently } = useAuth0()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [filters.category, filters.priority, filters.tag])

  useEffect(() => {
    // Fetch summary when component mounts or when posts change
    // Use community from first post, or default to 'Downtown'
    fetchAISummary()
  }, [posts])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const token = await getAccessTokenSilently()
      localStorage.setItem('auth_token', token)
      
      const params = {}
      if (filters.category) params.category = filters.category
      if (filters.priority) params.urgency = filters.priority.toLowerCase() // Map priority filter to urgency API param
      if (filters.tag) params.tag = filters.tag

      const response = await postsAPI.getAll(params)
      setPosts(response.data.posts || response.data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const fetchAISummary = async () => {
    try {
      setLoadingSummary(true)
      // Get community from first post or use default
      const community = posts.length > 0 && posts[0].community 
        ? posts[0].community 
        : 'Downtown' // Default community
      
      const response = await aiAPI.getSummary(community)
      // Backend returns { success: true, summary: {...} }
      // Extract the summary object
      setAISummary(response.data.summary || response.data)
    } catch (error) {
      console.error('Error fetching AI summary:', error)
      // Don't show error toast - summary is optional
    } finally {
      setLoadingSummary(false)
    }
  }

  const handlePostCreated = (newPost) => {
    useStore.getState().addPost(newPost)
    setIsModalOpen(false)
    fetchAISummary() // Refresh summary after new post
  }

  const filteredPosts = posts.filter((post) => {
    if (filters.category && post.category !== filters.category) return false
    if (filters.priority && post.urgency?.toLowerCase() !== filters.priority.toLowerCase()) return false
    if (filters.tag && !post.tags?.includes(filters.tag)) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FeedHeader />
      
      {aiSummary && <AIHighlight summary={aiSummary} loading={loadingSummary} />}

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts found. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <div 
                key={post._id || post.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Post Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white p-5 rounded-full shadow-large hover:shadow-xl transition-all duration-300 z-50 transform hover:scale-110 active:scale-95 group"
        aria-label="Create new post"
      >
        <Plus className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
      </button>

      <PostFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}

export default Feed

