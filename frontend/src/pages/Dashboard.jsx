import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { AlertTriangle, TrendingUp, Users, FileText, Download, CheckCircle, XCircle } from 'lucide-react'
import { postsAPI, aiAPI } from '../services/api'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { getAccessTokenSilently } = useAuth0()
  const [urgentPosts, setUrgentPosts] = useState([])
  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    urgentCount: 0,
    categoryDistribution: {},
    activeUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [aiSummary, setAiSummary] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = await getAccessTokenSilently()
      localStorage.setItem('auth_token', token)

      // Fetch urgent posts
      const urgentResponse = await postsAPI.getUrgent()
      setUrgentPosts(urgentResponse.data.posts || urgentResponse.data || [])

      // Fetch all posts for analytics
      const allPostsResponse = await postsAPI.getAll()
      const allPosts = allPostsResponse.data.posts || allPostsResponse.data || []

      // Calculate analytics
      const categoryDist = {}
      let urgentCount = 0

      allPosts.forEach((post) => {
        if (post.category) {
          categoryDist[post.category] = (categoryDist[post.category] || 0) + 1
        }
        if (post.priority === 'Emergency' || post.priority === 'Urgent') {
          urgentCount++
        }
      })

      setAnalytics({
        totalPosts: allPosts.length,
        urgentCount,
        categoryDistribution: categoryDist,
        activeUsers: new Set(allPosts.map((p) => p.author?.email || p.authorName)).size,
      })

      // Fetch AI summary
      try {
        const summaryResponse = await aiAPI.getSummary()
        setAiSummary(summaryResponse.data)
      } catch (err) {
        console.error('Error fetching summary:', err)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePost = async (postId) => {
    // This would call an approve endpoint
    toast.success('Post approved')
    fetchDashboardData()
  }

  const handleRemovePost = async (postId) => {
    // This would call a delete endpoint
    toast.success('Post removed')
    fetchDashboardData()
  }

  const handleDownloadSummary = () => {
    const summaryText = aiSummary
      ? `Community Pulse Daily Summary\n\n${JSON.stringify(aiSummary, null, 2)}`
      : 'No summary available'
    const blob = new Blob([summaryText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `community-summary-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Summary downloaded')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage community activity</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Posts"
          value={analytics.totalPosts}
          icon={FileText}
          color="primary"
        />
        <AnalyticsCard
          title="Urgent Alerts"
          value={analytics.urgentCount}
          icon={AlertTriangle}
          color="danger"
        />
        <AnalyticsCard
          title="Active Users"
          value={analytics.activeUsers}
          icon={Users}
          color="success"
        />
        <AnalyticsCard
          title="Categories"
          value={Object.keys(analytics.categoryDistribution).length}
          icon={TrendingUp}
          color="primary"
        />
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics.categoryDistribution).map(([category, count]) => (
            <div key={category} className="text-center">
              <div className="text-3xl font-bold text-primary-600">{count}</div>
              <div className="text-sm text-gray-600">{category}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Summary Card */}
      {aiSummary && (
        <div className="bg-gradient-to-r from-primary-50 to-success-50 border border-primary-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Daily AI Summary</h2>
            <button
              onClick={handleDownloadSummary}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>
          <p className="text-gray-700">{aiSummary.summary || aiSummary.text || JSON.stringify(aiSummary)}</p>
        </div>
      )}

      {/* Urgent Posts List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Urgent Posts</h2>
        {urgentPosts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No urgent posts at this time</p>
        ) : (
          <div className="space-y-4">
            {urgentPosts.map((post) => (
              <div
                key={post._id || post.id}
                className="border border-danger-200 rounded-lg p-4 bg-danger-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-danger-600" />
                      <span className="font-semibold text-danger-800">{post.priority}</span>
                      {post.category && (
                        <span className="text-sm text-gray-600">• {post.category}</span>
                      )}
                    </div>
                    <p className="text-gray-900 mb-2">{post.text || post.content}</p>
                    <div className="text-sm text-gray-600">
                      <span>By: {post.author?.name || post.authorName || 'Anonymous'}</span>
                      <span className="ml-4">
                        {new Date(post.createdAt || post.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprovePost(post._id || post.id)}
                      className="p-2 bg-success-100 text-success-700 rounded-lg hover:bg-success-200 transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRemovePost(post._id || post.id)}
                      className="p-2 bg-danger-100 text-danger-700 rounded-lg hover:bg-danger-200 transition-colors"
                      title="Remove"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const AnalyticsCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    danger: 'bg-danger-100 text-danger-600',
    success: 'bg-success-100 text-success-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

export default Dashboard


