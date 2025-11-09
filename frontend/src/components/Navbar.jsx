import { Link, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { Home, MessageSquare, LayoutDashboard, User, LogOut, Sparkles } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth0()
  const location = useLocation()
  const userRoles = user?.['https://communitypulse.app/roles'] || []
  const isOfficial = userRoles.includes('Official') || userRoles.includes('Moderator')

  const navItems = [
    { path: '/feed', label: 'Feed', icon: Home },
    { path: '/assistant', label: 'Assistant', icon: MessageSquare },
    ...(isOfficial ? [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { path: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="glass sticky top-0 z-50 border-b border-gray-200/50 backdrop-blur-xl bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link 
              to="/feed" 
              className="flex items-center gap-2 group transition-transform duration-200 hover:scale-105"
            >
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-1.5 rounded-lg shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">
                Community Pulse
              </span>
            </Link>
            <div className="hidden md:flex md:space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">
                  {user.name || user.email}
                </span>
              </div>
            )}
            <button
              onClick={() => logout({ returnTo: window.location.origin })}
              className="btn btn-ghost px-3 py-2 rounded-lg text-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className="md:hidden border-t border-gray-200/50">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navbar


