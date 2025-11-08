import { useAuth0 } from '@auth0/auth0-react'
import { User, Mail, Shield, Bell, LogOut } from 'lucide-react'
import { useState } from 'react'

const Profile = () => {
  const { user, logout } = useAuth0()
  const [notifications, setNotifications] = useState({
    urgent: true,
    daily: true,
    events: false,
  })

  const userRoles = user?.['https://communitypulse.app/roles'] || []
  const roleDisplay = userRoles.length > 0 ? userRoles.join(', ') : 'Resident'

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="bg-primary-100 rounded-full p-4 mr-4">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {user?.name || 'User'}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center text-gray-700">
            <Mail className="w-5 h-5 mr-3 text-gray-400" />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Shield className="w-5 h-5 mr-3 text-gray-400" />
            <span>Role: <span className="font-semibold">{roleDisplay}</span></span>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notification Preferences
        </h2>
        <div className="space-y-4">
          <NotificationToggle
            label="Urgent Alerts"
            description="Get notified about emergency and urgent posts"
            enabled={notifications.urgent}
            onChange={() => handleNotificationToggle('urgent')}
          />
          <NotificationToggle
            label="Daily Digest"
            description="Receive daily AI-generated community summary"
            enabled={notifications.daily}
            onChange={() => handleNotificationToggle('daily')}
          />
          <NotificationToggle
            label="Event Updates"
            description="Notifications about local events and activities"
            enabled={notifications.events}
            onChange={() => handleNotificationToggle('events')}
          />
        </div>
      </div>

      {/* Logout Button */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <button
          onClick={() => logout({ returnTo: window.location.origin })}
          className="w-full flex items-center justify-center px-6 py-3 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </div>
  )
}

const NotificationToggle = ({ label, description, enabled, onChange }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default Profile


