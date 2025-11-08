# 🚀 Deployment Guide

## DigitalOcean App Platform

### Prerequisites
- DigitalOcean account
- GitHub/GitLab repository with your code

### Steps

1. **Create New App**
   - Go to DigitalOcean App Platform
   - Click "Create App"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Port: `8080`

3. **Set Environment Variables**
   Navigate to Settings → Environment Variables and add:
   ```
   NODE_ENV=production
   PORT=8080
   MONGO_URI=<your-mongodb-atlas-uri>
   HF_TOKEN=<your-huggingface-token>
   AUTH0_DOMAIN=<your-auth0-domain>
   AUTH0_AUDIENCE=<your-auth0-audience>
   AUTH0_ISSUER=<your-auth0-issuer>
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Deploy**
   - Click "Save" and "Deploy"
   - Wait for build to complete (~3-5 minutes)

5. **Verify Deployment**
   ```bash
   curl https://your-app.ondigitalocean.app/api/health
   ```

---

## Heroku Deployment

### Prerequisites
- Heroku account
- Heroku CLI installed

### Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create App**
   ```bash
   heroku create community-pulse-api
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URI=<your-mongodb-uri>
   heroku config:set HF_TOKEN=<your-hf-token>
   heroku config:set AUTH0_DOMAIN=<your-auth0-domain>
   heroku config:set AUTH0_AUDIENCE=<your-auth0-audience>
   heroku config:set AUTH0_ISSUER=<your-auth0-issuer>
   ```

4. **Create Procfile**
   ```
   web: npm start
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Verify**
   ```bash
   heroku logs --tail
   heroku open /api/health
   ```

---

## Railway Deployment

### Prerequisites
- Railway account

### Steps

1. **Connect Repository**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Configure**
   - Railway auto-detects Node.js
   - Add environment variables in Settings

3. **Deploy**
   - Railway automatically deploys on push to main

---

## Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start app
CMD ["npm", "start"]
```

### Create .dockerignore

```
node_modules
npm-debug.log
logs
dist
.env
.git
.gitignore
README.md
```

### Build and Run

```bash
# Build image
docker build -t community-pulse-api .

# Run container
docker run -d \
  -p 8080:8080 \
  --env-file .env \
  --name community-pulse \
  community-pulse-api

# Check logs
docker logs -f community-pulse

# Stop container
docker stop community-pulse
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - MONGO_URI=${MONGO_URI}
      - HF_TOKEN=${HF_TOKEN}
      - AUTH0_DOMAIN=${AUTH0_DOMAIN}
      - AUTH0_AUDIENCE=${AUTH0_AUDIENCE}
      - AUTH0_ISSUER=${AUTH0_ISSUER}
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

Run with:
```bash
docker-compose up -d
```

---

## Environment Checklist

Before deploying, ensure all required environment variables are set:

- [ ] `NODE_ENV=production`
- [ ] `PORT` (usually 8080)
- [ ] `MONGO_URI` (MongoDB Atlas connection string)
- [ ] `HF_TOKEN` (Hugging Face API token)
- [ ] `AUTH0_DOMAIN`
- [ ] `AUTH0_AUDIENCE`
- [ ] `AUTH0_ISSUER`
- [ ] `RATE_LIMIT_WINDOW_MS` (optional)
- [ ] `RATE_LIMIT_MAX_REQUESTS` (optional)
- [ ] `CORS_ORIGIN` (optional, defaults to *)

---

## Post-Deployment

### 1. Health Check
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T12:00:00.000Z"
}
```

### 2. Test Post Creation
Use Postman/curl with valid Auth0 JWT:
```bash
curl -X POST https://your-domain.com/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test post for deployment verification",
    "community": "TestTown"
  }'
```

### 3. Monitor Logs
Check application logs for any errors or warnings.

### 4. Performance Testing
- Test response times for various endpoints
- Verify HF API calls complete within 1-2 seconds
- Check rate limiting is working

---

## Scaling Considerations

### Database
- MongoDB Atlas auto-scales
- Consider dedicated cluster for production
- Set up indexes (already configured in models)

### API
- Use load balancer for multiple instances
- Enable horizontal scaling
- Monitor HF API rate limits

### Caching
Consider adding Redis for:
- Frequently accessed posts
- Daily summaries
- HF API response caching (with hash of text as key)

---

## Monitoring

### Recommended Tools
- **Logs**: Papertrail, Loggly
- **APM**: New Relic, Datadog
- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry

### Key Metrics to Monitor
- API response times (p50, p95, p99)
- HF API call duration and error rate
- MongoDB query performance
- Memory usage
- CPU usage
- Request rate and errors

---

## Backup Strategy

### Database
- MongoDB Atlas automatic backups (enabled by default)
- Consider point-in-time recovery for critical data

### Application
- Git repository serves as source backup
- Environment variables documented in secure location

---

## Security Checklist

- [ ] HTTPS enabled (handled by platform)
- [ ] Environment variables secured
- [ ] Rate limiting configured
- [ ] MongoDB IP whitelist configured
- [ ] Auth0 JWT verification working
- [ ] CORS properly configured
- [ ] Security headers enabled (Helmet.js)
- [ ] No secrets in code/logs

---

## Rollback Plan

If deployment fails:

1. Check logs for errors
2. Verify environment variables
3. Test MongoDB connection
4. Verify HF API token
5. Roll back to previous version if needed

Most platforms support instant rollback to previous deployment.

---

## Cost Estimation (Monthly)

### Hobby/Development
- DigitalOcean: $5-10/month
- MongoDB Atlas: Free tier (512MB)
- Auth0: Free tier (7,000 MAU)
- HF API: Free tier with rate limits
- **Total**: ~$5-10/month

### Production
- DigitalOcean: $25-50/month
- MongoDB Atlas: $25-50/month (dedicated cluster)
- Auth0: Free tier or $23/month
- HF API: Free tier or paid for higher limits
- **Total**: ~$50-125/month

---

## Support & Troubleshooting

Common deployment issues:

**Build fails**:
- Check Node.js version (requires 18+)
- Verify all dependencies are in package.json
- Check TypeScript compilation

**Runtime errors**:
- Verify all environment variables
- Check MongoDB connection
- Verify HF API token

**Performance issues**:
- Monitor HF API response times
- Check MongoDB query performance
- Review rate limiting settings

---

Built with ❤️ for civic engagement

