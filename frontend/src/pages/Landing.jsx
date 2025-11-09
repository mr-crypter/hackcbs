import { useAuth0 } from '@auth0/auth0-react'
import { LogIn, Users, AlertTriangle, MessageSquare, Sparkles, ArrowRight } from 'lucide-react'

const Landing = () => {
  const { loginWithRedirect } = useAuth0()

  const handleLogin = () => {
    loginWithRedirect()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 shadow-large animate-scale-in">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Stay Informed.
            <br />
            <span className="text-gradient">Stay Connected.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Community Pulse connects local residents and officials through a centralized,
            AI-powered information hub. Share alerts, discover events, and stay updated.
          </p>
          <button
            onClick={handleLogin}
            className="btn btn-primary px-8 py-4 text-lg font-semibold rounded-xl shadow-medium hover:shadow-large transform hover:scale-105 transition-all duration-300"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card card-hover p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-primary-100 rounded-xl p-4 w-fit mb-6">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Unified Feed</h3>
            <p className="text-gray-600 leading-relaxed">
              View all community posts organized by category, urgency, and location in one place.
            </p>
          </div>

          <div className="card card-hover p-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-success-100 rounded-xl p-4 w-fit mb-6">
              <Sparkles className="w-8 h-8 text-success-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">AI-Powered</h3>
            <p className="text-gray-600 leading-relaxed">
              Smart categorization, tagging, and summaries powered by Gemini AI for better organization.
            </p>
          </div>

          <div className="card card-hover p-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="bg-danger-100 rounded-xl p-4 w-fit mb-6">
              <AlertTriangle className="w-8 h-8 text-danger-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Real-Time Alerts</h3>
            <p className="text-gray-600 leading-relaxed">
              Get instant notifications about urgent community updates and emergency situations.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-12 md:p-16 text-center text-white shadow-large animate-fade-in">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-fit mx-auto mb-6">
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Connect?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto text-lg">
            Join your community today and start sharing information that matters.
          </p>
          <button
            onClick={handleLogin}
            className="btn bg-white text-primary-600 font-semibold rounded-xl px-8 py-4 hover:bg-gray-50 shadow-medium hover:shadow-large transform hover:scale-105 transition-all duration-300"
          >
            Sign In / Sign Up
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary-400" />
            <p className="text-lg font-semibold text-gray-300">Community Pulse</p>
          </div>
          <p className="text-sm">&copy; 2025 Community Pulse.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing


