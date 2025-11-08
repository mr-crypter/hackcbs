# Community Pulse - Frontend

A lightweight, responsive, AI-powered community platform built with React + Vite + TailwindCSS.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Auth0 account (for authentication)
- Backend API running (see backend documentation)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-audience
VITE_API_BASE_URL=http://localhost:3000/api
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Navbar.jsx
│   ├── PostCard.jsx
│   ├── PostFormModal.jsx
│   ├── FeedHeader.jsx
│   ├── AIHighlight.jsx
│   └── ProtectedRoute.jsx
├── pages/           # Page components
│   ├── Landing.jsx
│   ├── Feed.jsx
│   ├── Assistant.jsx
│   ├── Dashboard.jsx
│   └── Profile.jsx
├── services/        # API service layer
│   └── api.js
├── store/           # State management
│   └── useStore.js
├── utils/           # Utility functions
│   └── cn.js
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

## 🎯 Features

- ✅ Unified Community Feed
- ✅ AI-Powered Post Organization (Gemini)
- ✅ Post Creation with Image Upload
- ✅ AI Assistant Chatbot
- ✅ Admin Dashboard (Officials/Moderators)
- ✅ Role-Based Access Control (Auth0)
- ✅ Responsive Design (Mobile-first)
- ✅ Real-time AI Summaries

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** TailwindCSS
- **Auth:** Auth0 React SDK
- **State:** Zustand
- **HTTP:** Axios
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

## 📱 Pages

1. **Landing** (`/`) - Login and hero section
2. **Feed** (`/feed`) - Main community feed with posts
3. **Assistant** (`/assistant`) - AI chatbot for queries
4. **Dashboard** (`/dashboard`) - Admin panel (Officials/Moderators only)
5. **Profile** (`/profile`) - User settings and preferences

## 🔌 API Integration

The frontend expects the following backend endpoints:

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `POST /api/analyzePost` - Analyze post with AI
- `GET /api/summary` - Get AI-generated summary
- `POST /api/askGemini` - Query AI assistant

## 🎨 Design System

- **Colors:** Primary (Blue), Success (Green), Danger (Red)
- **Fonts:** Inter, Poppins
- **Components:** Custom components with TailwindCSS
- **Accessibility:** ARIA labels, keyboard navigation

## 📝 License

Built for hackathon demonstration purposes.


