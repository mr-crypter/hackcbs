# 🚀 Quick Start Guide

Get your Community Pulse backend running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Environment File

Create `.env` in the root directory with these variables:

```env
# Required
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/community-pulse
HF_TOKEN=hf_your_huggingface_token
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://api.community-pulse.com
AUTH0_ISSUER=https://your-tenant.us.auth0.com/
```

### Getting Credentials:

**MongoDB Atlas** (Free):
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string

**Hugging Face** (Free):
1. Sign up at [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens
3. Create new token with "read" access

**Auth0** (Free):
1. Sign up at [auth0.com](https://auth0.com)
2. Create new API in Applications → APIs
3. Copy Domain, API Identifier (Audience), and Issuer URL

## Step 3: Run Development Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 8080
📍 Environment: development
🔗 Health check: http://localhost:8080/api/health
```

## Step 4: Test the API

### Option A: Using curl

```bash
# Health check (no auth required)
curl http://localhost:8080/api/health
```

### Option B: Using Postman

1. Import `postman_collection.json` into Postman
2. Set the `auth_token` variable (get from Auth0)
3. Run the requests!

## Step 5: Create Your First Post

```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer YOUR_AUTH0_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "There is a house fire on Maple Street!",
    "community": "MapleTown",
    "location": "Maple Street"
  }'
```

You'll get back a post with AI-enriched data:
```json
{
  "success": true,
  "post": {
    "urgency": "emergency",
    "urgencyScore": 0.92,
    "category": "Safety",
    "categoryScore": 0.88,
    "tags": ["fire", "emergency"],
    "status": "flagged"
  }
}
```

## Common Issues

### "MongoDB connection failed"
- Check your IP is whitelisted in MongoDB Atlas (Network Access)
- Verify the connection string is correct
- Try using `0.0.0.0/0` for testing (allows all IPs)

### "Unauthorized Error"
- Get a fresh JWT token from Auth0
- Verify Auth0 environment variables are correct
- Check the token hasn't expired

### "HF API Error"
- Verify your HF token is active
- Check you haven't exceeded rate limits
- Ensure token has "read" permissions

## Next Steps

- ✅ Read the full [README.md](README.md) for detailed API docs
- ✅ Import the Postman collection for easy testing
- ✅ Review [DEPLOYMENT.md](DEPLOYMENT.md) when ready to deploy
- ✅ Check [CONTRIBUTING.md](CONTRIBUTING.md) to extend functionality

## Test Scenarios

### 1. Normal Post (Event)
```json
{
  "text": "Community BBQ this Saturday at Central Park!",
  "community": "MapleTown"
}
```
Expected: `urgency: "normal"`, `category: "Events"`

### 2. Emergency Post (Safety)
```json
{
  "text": "URGENT: Car accident at Main St and 5th Ave, injuries reported",
  "community": "MapleTown",
  "location": "Main St & 5th Ave"
}
```
Expected: `urgency: "emergency"`, `category: "Safety"`, `status: "flagged"`

### 3. Lost & Found
```json
{
  "text": "Lost my keys near the library, has a blue keychain",
  "community": "MapleTown",
  "location": "Public Library"
}
```
Expected: `urgency: "normal"`, `category: "Lost & Found"`

## Production Build

When ready for production:

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

---

Happy coding! 🎉

