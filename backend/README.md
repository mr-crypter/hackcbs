# 🧠 Community Pulse - Backend

A hackathon-ready civic engagement platform powered by Hugging Face zero-shot classification (BART MNLI) for intelligent post categorization and urgency detection.

## 🚀 Features

- **AI-Powered Classification**: Automatic urgency and category detection using HF zero-shot learning
- **Smart Tagging**: Contextual tag extraction from post content
- **Emergency Clustering**: Automatic alert generation for multiple emergency reports
- **Daily Summaries**: Rule-based community activity summaries
- **Auth0 Integration**: JWT-based authentication with role-based access control
- **MongoDB Storage**: Scalable document storage with optimized indexes
- **RESTful API**: Clean, well-documented endpoints

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express + TypeScript
- **Database**: MongoDB Atlas
- **AI**: Hugging Face Inference API (BART MNLI)
- **Auth**: Auth0 JWT
- **Validation**: Zod
- **Logging**: Winston + Morgan

## 📋 Prerequisites

- Node.js 18 or higher
- MongoDB Atlas account
- Hugging Face account with API token
- Auth0 account (free tier works)

## ⚙️ Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server
PORT=8080
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/community-pulse?retryWrites=true&w=majority

# Hugging Face
HF_TOKEN=your_huggingface_token_here

# Auth0
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://api.community-pulse.com
AUTH0_ISSUER=https://your-tenant.us.auth0.com/

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# CORS (optional)
CORS_ORIGIN=*
```

### 3. Auth0 Setup

1. Create a new API in Auth0 Dashboard
2. Set the API Identifier (use as `AUTH0_AUDIENCE`)
3. Enable RBAC and add permissions:
   - `moderator` - Can delete any post
   - `official` - Can create alerts

### 4. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:8080`

### 5. Build for Production

```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication

Most endpoints require Auth0 JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

### 🔐 Auth Endpoints

#### Get Current User
```http
GET /api/auth/me
```
**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "userId": "auth0|123...",
  "permissions": ["moderator"],
  "profile": { ... }
}
```

---

### 📝 Post Endpoints

#### Create Post
```http
POST /api/posts
```
**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "text": "There's a fire on 5th Avenue!",
  "community": "MapleTown",
  "imageUrl": "https://example.com/image.jpg",
  "location": "5th Avenue"
}
```

**Response**:
```json
{
  "success": true,
  "post": {
    "_id": "...",
    "text": "There's a fire on 5th Avenue!",
    "urgency": "emergency",
    "urgencyScore": 0.92,
    "category": "Safety",
    "categoryScore": 0.88,
    "tags": ["fire", "emergency"],
    "status": "flagged",
    "createdAt": "2025-11-08T12:00:00.000Z"
  }
}
```

#### List Posts
```http
GET /api/posts?community=MapleTown&urgency=emergency&category=Safety&limit=20&offset=0
```

**Query Parameters**:
- `community` (optional): Filter by community
- `urgency` (optional): `normal`, `urgent`, `emergency`
- `category` (optional): `Safety`, `Events`, `Lost & Found`, `Public Works`, `General`
- `limit` (optional, default: 20, max: 100)
- `offset` (optional, default: 0)

**Response**:
```json
{
  "success": true,
  "posts": [...],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Get Single Post
```http
GET /api/posts/:id
```

#### Search Posts
```http
POST /api/posts/search
```

**Body**:
```json
{
  "q": "fire accident",
  "community": "MapleTown",
  "limit": 20
}
```

#### Delete Post
```http
DELETE /api/posts/:id
```
**Headers**: `Authorization: Bearer <token>`  
**Permissions**: Owner or moderator role

---

### 🚨 Alert Endpoints

#### List Alerts
```http
GET /api/alerts?community=MapleTown
```

**Response**:
```json
{
  "success": true,
  "alerts": [
    {
      "_id": "...",
      "type": "clustered_emergency",
      "community": "MapleTown",
      "reason": "3 emergency reports in the last 60 minutes",
      "posts": [...],
      "createdAt": "2025-11-08T12:00:00.000Z"
    }
  ]
}
```

#### Create Mock Alert
```http
POST /api/alerts/mock
```
**Headers**: `Authorization: Bearer <token>`  
**Permissions**: `official` or `moderator` role

**Body**:
```json
{
  "type": "fire",
  "community": "MapleTown",
  "reason": "Fire department notified of active fire",
  "postIds": ["post_id_1", "post_id_2"]
}
```

---

### 📊 Summary Endpoints

#### Get Daily Summary
```http
GET /api/summary/daily?community=MapleTown&date=2025-11-08
```

**Query Parameters**:
- `community` (required): Community name
- `date` (optional): ISO date string (YYYY-MM-DD), defaults to today

**Response**:
```json
{
  "success": true,
  "summary": {
    "community": "MapleTown",
    "dateISO": "2025-11-08",
    "summaryText": "Daily Summary for MapleTown on 2025-11-08:...",
    "stats": {
      "total": 45,
      "emergency": 3,
      "urgent": 8,
      "normal": 34
    },
    "createdAt": "2025-11-08T23:59:00.000Z"
  }
}
```

---

### ❤️ Health Check
```http
GET /api/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T12:00:00.000Z"
}
```

---

## 🧪 Testing with Postman/Thunder Client

### Sample Test Flow

1. **Create a normal post**:
```json
POST /api/posts
{
  "text": "Great community BBQ this weekend!",
  "community": "MapleTown"
}
```
Expected: `urgency: "normal"`, `category: "Events"`

2. **Create an emergency post**:
```json
POST /api/posts
{
  "text": "URGENT: House fire on Maple Street, smoke everywhere!",
  "community": "MapleTown",
  "location": "Maple Street"
}
```
Expected: `urgency: "emergency"`, `category: "Safety"`, `status: "flagged"`

3. **List emergency posts**:
```
GET /api/posts?community=MapleTown&urgency=emergency
```

4. **Get daily summary**:
```
GET /api/summary/daily?community=MapleTown
```

---

## 🏗️ Architecture

```
src/
├── config/
│   ├── env.ts          # Environment validation
│   ├── database.ts     # MongoDB connection
│   └── logger.ts       # Winston logger setup
├── models/
│   ├── Post.ts         # Post schema
│   ├── Alert.ts        # Alert schema
│   └── Summary.ts      # Summary schema
├── services/
│   ├── hf.ts           # Hugging Face zero-shot classification
│   ├── summary.ts      # Daily summary generation
│   └── alerts.ts       # Emergency clustering logic
├── middleware/
│   ├── auth.ts         # Auth0 JWT verification
│   ├── errors.ts       # Error handling
│   └── validation.ts   # Zod schemas
├── controllers/
│   ├── auth.ts         # Auth endpoints
│   ├── posts.ts        # Post CRUD
│   ├── alerts.ts       # Alert management
│   └── summary.ts      # Summary generation
├── routes/
│   └── index.ts        # Route aggregation
└── server.ts           # Express app setup
```

---

## 🤖 AI Classification Details

### Urgency Classification

Uses zero-shot classification with labels: `["normal", "urgent", "emergency"]`

**Thresholds**:
- `emergency`: score ≥ 0.80
- `urgent`: score ≥ 0.60
- `normal`: default

### Category Classification

Labels: `["Safety", "Events", "Lost & Found", "Public Works", "General"]`

### Tag Extraction

Labels: `["fire", "smoke", "lost_pet", "graffiti", "accident", "roadblock", "tree_fall", "flood", "power_outage", "suspicious_activity", "community_event", "celebration", "protest", "construction", "noise_complaint"]`

Threshold: 0.25 minimum score

---

## 🚨 Business Rules

### Auto-Flagging
- Posts with `urgency: "emergency"` are automatically set to `status: "flagged"`

### Emergency Clustering
- If ≥3 emergency posts in the same community within 60 minutes
- Automatically creates an alert of type `"clustered_emergency"`

### Fallback Behavior
- If HF API fails: `urgency: "normal"`, `category: "General"`
- Retries once on 5xx errors

---

## 🔒 Security Features

- Helmet.js for HTTP security headers
- Rate limiting (configurable)
- MongoDB sanitization (NoSQL injection prevention)
- CORS configuration
- JWT verification with JWKS
- Role-based access control (RBAC)

---

## 📊 Monitoring & Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console output (development)

Log format includes:
- Timestamp
- Request method and URL
- Response time
- Error stack traces (development only)
- HF API call duration

---

## 🚀 Deployment

### DigitalOcean App Platform

1. Connect your Git repository
2. Set environment variables in the App Platform UI
3. Build command: `npm run build`
4. Run command: `npm start`

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

---

## 🐛 Troubleshooting

### HF API Errors
- Verify `HF_TOKEN` is valid
- Check rate limits on HF account
- Review `logs/error.log` for specific error messages

### MongoDB Connection Issues
- Verify MongoDB Atlas IP whitelist includes your IP (or use 0.0.0.0/0 for development)
- Check connection string format
- Ensure database user has read/write permissions

### Auth0 Issues
- Verify JWT token is not expired
- Check `AUTH0_AUDIENCE` matches API identifier in Auth0 dashboard
- Ensure permissions are added to the user's token

---

## 📝 License

MIT

---

## 🤝 Contributing

This is a hackathon project. Feel free to fork and extend!

---

## 💡 Future Enhancements

- [ ] WebSocket support for real-time alerts
- [ ] Gemini integration for richer summaries
- [ ] Geographic clustering using coordinates
- [ ] Image analysis with Vision APIs
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Email/SMS notifications

---

## 📞 Support

For issues or questions, please check the logs first:
```bash
tail -f logs/combined.log
```

Built with ❤️ for civic engagement

