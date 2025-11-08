import { useState, useRef, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Send, Loader2, Bot, User } from 'lucide-react'
import { aiAPI } from '../services/api'
import toast from 'react-hot-toast'

const Assistant = () => {
  const { getAccessTokenSilently } = useAuth0()
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "Hello! I'm your Community Pulse assistant. Ask me about local events, safety alerts, or any community updates. For example: 'Any events this weekend?' or 'Are there any road closures?'",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const token = await getAccessTokenSilently()
      localStorage.setItem('auth_token', token)

      const response = await aiAPI.askGemini(userMessage)
      const botResponse = response.data.response || response.data.answer || response.data

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: typeof botResponse === 'string' ? botResponse : JSON.stringify(botResponse),
        },
      ])
    } catch (error) {
      console.error('Error querying assistant:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: "I'm sorry, I encountered an error processing your request. Please try again.",
        },
      ])
      toast.error('Failed to get response from assistant')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Assistant</h1>
              <p className="text-primary-100 text-sm">Ask me anything about your community</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white ml-3'
                      : 'bg-gray-200 text-gray-700 mr-3'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-700 mr-3 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about events, alerts, or community updates..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Assistant


