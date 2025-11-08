import { useAuth0 } from '@auth0/auth0-react'
import { LogIn, Users, AlertTriangle, MessageSquare, Sparkles } from 'lucide-react'

const Landing = () => {
  const { loginWithRedirect } = useAuth0()

  const handleLogin = () => {
    loginWithRedirect()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-100 rounded-full p-4">
              <Sparkles className="w-12 h-12 text-primary-600" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Stay Informed.
            <br />
            <span className="text-primary-600">Stay Connected.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Community Pulse connects local residents and officials through a centralized,
            AI-powered information hub. Share alerts, discover events, and stay updated.
          </p>
          <button
            onClick={handleLogin}
            className="inline-flex items-center px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-primary-700 transition-colors transform hover:scale-105"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Get Started
          </button>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-primary-100 rounded-full p-3 w-fit mb-4">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unified Feed</h3>
            <p className="text-gray-600">
              View all community posts organized by category, urgency, and location in one place.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-success-100 rounded-full p-3 w-fit mb-4">
              <Sparkles className="w-6 h-6 text-success-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Smart categorization, tagging, and summaries powered by Gemini AI for better organization.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-danger-100 rounded-full p-3 w-fit mb-4">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Alerts</h3>
            <p className="text-gray-600">
              Get instant notifications about urgent community updates and emergency situations.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-primary-600 rounded-2xl p-12 text-center text-white">
          <MessageSquare className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to Connect?</h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Join your community today and start sharing information that matters.
          </p>
          <button
            onClick={handleLogin}
            className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Sign In / Sign Up
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Community Pulse. Built for hackathon.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing


