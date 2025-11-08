# Setup Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Auth0 account
- (Optional) Google Gemini API key
- (Optional) HuggingFace account

---

## 1. Clone and Install

```bash
cd backend
npm install
```

---

## 2. Environment Configuration

Create a `.env` file in the `backend/` directory:

```bash
# Server Configuration
PORT=8080
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# AI Services (Optional - fallback to keyword extraction)

# Google Gemini API - for tag extraction
# Get at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# HuggingFace API - for urgency classification
# Get at: https://huggingface.co/settings/tokens
HF_TOKEN=hf_your_token_here
HF_ENDPOINT=https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli

# Auth0 Configuration
AUTH0_DOMAIN=dev-xxx.us.auth0.com
AUTH0_AUDIENCE=https://api.community-pulse.com
AUTH0_ISSUER=https://dev-xxx.us.auth0.com/
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=*
```

---

## 3. Get API Keys

### MongoDB Atlas (Required)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your credentials
6. Add to `.env` as `MONGO_URI`

### Auth0 (Required)

1. Go to https://auth0.com/ and sign up
2. Create a new **API** in the dashboard
3. Note the **Domain**, **Audience**, and **Issuer**
4. Create a new **Application** (Machine to Machine)
5. Note the **Client ID** and **Client Secret**
6. Add all values to `.env`

### Google Gemini API (Optional)

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Add to `.env` as `GEMINI_API_KEY`

**Note:** If not provided, the system will use keyword-based fallback extraction.

### HuggingFace (Optional)

1. Go to https://huggingface.co/settings/tokens
2. Create a new **Read** access token
3. Copy the token
4. Add to `.env` as `HF_TOKEN`

**Note:** If not provided, the system will return default urgency values.

---

## 4. Start the Server

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:8080`

### Production Mode

```bash
npm run build
npm start
```

---

## 5. Verify Installation

### Health Check

```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Create a Test Post

```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer YOUR_AUTH0_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Fire reported on Main Street",
    "community": "Downtown"
  }'
```

---

## 6. Common Issues

### Issue: `Missing required environment variables`

**Solution:** Make sure all required variables are in `.env`:
- `MONGO_URI`
- `AUTH0_DOMAIN`
- `AUTH0_AUDIENCE`
- `AUTH0_ISSUER`

### Issue: `Failed to connect to MongoDB`

**Solutions:**
- Check your MongoDB connection string
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify username/password are correct

### Issue: `Invalid or missing authentication token`

**Solutions:**
- Make sure you're sending a valid JWT from Auth0
- Check that `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, and `AUTH0_ISSUER` are correct
- Verify the token hasn't expired

### Issue: AI enrichment not working

**Solutions:**
- Check if `GEMINI_API_KEY` and/or `HF_TOKEN` are set
- Verify API keys are valid and have quota remaining
- Check logs for specific error messages
- The system will use fallback extraction if APIs fail

---

## 7. Testing the Pipeline

### Test with Gemini + HuggingFace

```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "URGENT: Gas leak at Main Street shopping center. Fire department evacuating residents.",
    "community": "Downtown",
    "imageUrl": "https://example.com/image.jpg"
  }'
```

Expected response includes enrichment:
```json
{
  "success": true,
  "post": { ... },
  "enrichment": {
    "gemini": {
      "category": "Safety",
      "entities": ["Main Street", "shopping center", "Fire department"],
      "tags": ["emergency", "gas_leak"],
      "confidence": 0.95
    },
    "huggingface": {
      "urgency": "emergency",
      "score": 0.92
    }
  }
}
```

### Test Fallback Mode

Remove API keys and restart:
```bash
# Comment out in .env
# GEMINI_API_KEY=...
# HF_TOKEN=...

npm run dev
```

Create the same post - it should still work with keyword-based extraction.

---

## 8. Next Steps

- Read [PIPELINE.md](./PIPELINE.md) for detailed pipeline documentation
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Read [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines

---

## Need Help?

- Check the logs: `tail -f logs/app.log`
- Enable debug mode: `NODE_ENV=development npm run dev`
- Review the [README.md](./README.md) for API documentation

