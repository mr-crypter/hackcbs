import { create } from 'zustand'

const useStore = create((set) => ({
  posts: [],
  loading: false,
  filters: {
    category: null,
    priority: null,
    tag: null,
  },
  aiSummary: null,
  
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  setLoading: (loading) => set({ loading }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  clearFilters: () => set({ filters: { category: null, priority: null, tag: null } }),
  setAISummary: (summary) => set({ aiSummary: summary }),
}))

export default useStore


