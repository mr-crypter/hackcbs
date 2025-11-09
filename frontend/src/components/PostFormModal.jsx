import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { X, Upload, Loader2 } from 'lucide-react'
import { postsAPI } from '../services/api'
import toast from 'react-hot-toast'

const PostFormModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user, getAccessTokenSilently } = useAuth0()
  const [text, setText] = useState('')
  const [community, setCommunity] = useState('Downtown') // Default community
  const [location, setLocation] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageUrl, setImageUrl] = useState(null) // For image URL after upload
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Cloudinary configuration - Replace with your own values
  const CLOUDINARY_CLOUD_NAME = 'dq6dd3glr' // Replace with your cloud name
  const CLOUDINARY_UPLOAD_PRESET = 'community_pulse' // Replace with your upload preset

  const uploadToCloudinary = async (file) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setImageUrl(data.secure_url)
      toast.success('Image uploaded successfully!')
      return data.secure_url
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      toast.error('Failed to upload image')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      setImage(file)
      
      // Show preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Upload to Cloudinary
      await uploadToCloudinary(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) {
      toast.error('Please enter some text')
      return
    }

    if (!community.trim()) {
      toast.error('Please select a community')
      return
    }

    try {
      setIsSubmitting(true)
      setIsAnalyzing(true)

      const token = await getAccessTokenSilently()
      localStorage.setItem('auth_token', token)

      // Prepare post data - backend expects JSON, not FormData
      const postData = {
        text: text.trim(),
        community: community.trim(),
        location: location.trim() || null,
        imageUrl: imageUrl || null, // For now, imageUrl is null (image upload can be added later)
      }

      // Backend automatically runs AI pipeline (Gemini + HuggingFace)
      const createResponse = await postsAPI.create(postData)
      const createdPost = createResponse.data.post || createResponse.data

      toast.success('Post created with AI enrichment!')
      onPostCreated(createdPost)
      resetForm()
    } catch (error) {
      console.error('Error creating post:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create post'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
      setIsAnalyzing(false)
    }
  }

  const resetForm = () => {
    setText('')
    setCommunity('Downtown')
    setLocation('')
    setImage(null)
    setImagePreview(null)
    setImageUrl(null)
    setIsUploading(false)
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    setImageUrl(null)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-large max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* AI Processing Overlay */}
          {isAnalyzing && (
            <div className="mb-4 bg-gradient-to-r from-primary-50 to-success-50 border border-primary-200 rounded-xl p-4 flex items-center shadow-soft animate-fade-in">
              <Loader2 className="w-5 h-5 animate-spin text-primary-600 mr-3" />
              <span className="text-primary-700 font-medium">
                Analyzing with AI... Extracting category, tags, and urgency...
              </span>
            </div>
          )}

          {/* Community Input */}
          <div className="mb-4">
            <label htmlFor="community" className="block text-sm font-medium text-gray-700 mb-2">
              Community <span className="text-danger-500">*</span>
            </label>
            <input
              id="community"
              type="text"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              className="input"
              placeholder="e.g., Downtown, Northside, Westside"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Location Input (Optional) */}
          <div className="mb-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location (optional)
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input"
              placeholder="e.g., Main Street & 5th Avenue"
              disabled={isSubmitting}
            />
          </div>

          {/* Text Input */}
          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              What's happening? <span className="text-danger-500">*</span>
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
              rows={4}
              className="input resize-none"
              placeholder="Share local news, alerts, or updates..."
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{text.length}/2000 characters</p>
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Photo (optional)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Upload an image to provide visual evidence (max 5MB)
            </p>
            <div className="flex items-center gap-4">
              {!imagePreview ? (
                <label
                  htmlFor="image"
                  className={`flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg transition-colors ${
                    isUploading || isSubmitting
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer hover:border-primary-500'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 text-primary-600 animate-spin" />
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600">Choose Image</span>
                    </>
                  )}
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploading || isSubmitting}
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={isSubmitting}
                    className="absolute -top-2 -right-2 bg-danger-500 hover:bg-danger-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {imageUrl && (
                    <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-xs py-1 px-2 text-center rounded-b-lg">
                      ✓ Uploaded
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !text.trim() || isUploading}
              className="btn btn-primary px-6 py-2.5 rounded-lg flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostFormModal


