import axios from 'axios'
import toast from 'react-hot-toast'

// Backend runs on port 8080
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth0 token will be set by the component
let authToken = null

export const setAuthToken = (token) => {
  authToken = token
}

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Use the token set by Auth0
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      toast.error('Please log in to continue')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else {
      toast.error(error.response?.data?.message || 'An error occurred')
    }
    return Promise.reject(error)
  }
)

// Posts API - matches backend endpoints
export const postsAPI = {
  // GET /api/posts - List posts with filters
  getAll: (params = {}) => api.get('/posts', { params }),
  
  // GET /api/posts/:id - Get single post
  getById: (id) => api.get(`/posts/${id}`),
  
  // POST /api/posts - Create new post (AI pipeline triggered automatically)
  create: (data) => api.post('/posts', data),
  
  // POST /api/posts/search - Full-text search
  search: (query, community) => api.post('/posts/search', { q: query, community }),
  
  // DELETE /api/posts/:id - Delete post
  delete: (id) => api.delete(`/posts/${id}`),
  
  // Get posts by urgency level
  getByUrgency: (urgency, community) => 
    api.get('/posts', { params: { urgency, community } }),
  
  // Get posts by category
  getByCategory: (category, community) => 
    api.get('/posts', { params: { category, community } }),
  
  // Get emergency posts
  getEmergency: (community) => 
    api.get('/posts', { params: { urgency: 'emergency', community } }),
}

// Alerts API
export const alertsAPI = {
  // GET /api/alerts - Get recent alerts for community
  getAll: (community) => api.get('/alerts', { params: { community } }),
  
  // POST /api/alerts - Create manual alert
  create: (data) => api.post('/alerts', data),
}

// Summary API
export const summaryAPI = {
  // GET /api/summary/daily - Get daily summary for community
  get: (community, date) => 
    api.get('/summary/daily', { params: { community, date } }),
}

// Auth API
export const authAPI = {
  // GET /api/auth/me - Get current user info
  getMe: () => api.get('/auth/me'),
}

// Assistant API
export const assistantAPI = {
  // POST /api/assistant/chat - Chat with AI assistant
  chat: (query, community) => 
    api.post('/assistant/chat', { query, community }),
}

// Legacy alias for backward compatibility with existing components
export const aiAPI = {
  // GET /api/summary - Get daily summary (alias for summaryAPI)
  getSummary: (community, date) => summaryAPI.get(community, date),
  
  // POST /api/assistant/chat - Chat with AI assistant (alias for assistantAPI)
  askGemini: (query, community) => assistantAPI.chat(query, community),
}

export default api


