# AI Processing Pipeline

## Overview

The Community Pulse platform uses a **dual-AI pipeline** to enrich user posts with structured metadata for intelligent categorization, urgency detection, and entity recognition.

## Pipeline Architecture

```
┌─────────────────┐
│  Text + Image   │
│  (User Input)   │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌────────────────┐  ┌──────────────┐
│  Gemini API    │  │ HuggingFace  │
│  (Tag Extract) │  │  (Urgency)   │
└────────┬───────┘  └──────┬───────┘
         │                  │
         │  ┌───────────────┘
         │  │
         ▼  ▼
    ┌──────────┐
    │  Merge   │
    │  Results │
    └─────┬────┘
          │
          ▼
    ┌──────────┐
    │ MongoDB  │
    │  Store   │
    └──────────┘
```

## Step-by-Step Flow

### Step 1: Gemini API - Structured Tag Extraction

**Endpoint:** Google Gemini 1.5 Flash  
**Purpose:** Extract structured information from text and images

**Extracts:**
- **Category**: ONE of [Safety, Events, Lost & Found, Public Works, General]
- **Entities**: People, places, organizations mentioned (max 5)
- **Location**: Specific location detected or null
- **Tags**: Descriptive keywords (max 5)
- **Confidence**: Extraction confidence score (0.0-1.0)

**Example Input:**
```
Text: "Fire reported on Main Street near the library. Fire department is on scene."
Image: (optional)
```

**Example Output:**
```json
{
  "category": "Safety",
  "entities": ["Main Street", "library", "Fire department"],
  "location": "Main Street near library",
  "tags": ["fire", "emergency"],
  "confidence": 0.95
}
```

**Fallback:** If Gemini API is unavailable, uses keyword-based extraction

---

### Step 2: HuggingFace - Urgency Classification

**Model:** facebook/bart-large-mnli (Zero-Shot Classification)  
**Purpose:** Classify the urgency level of the post

**Classification Labels:**
- `normal`: Regular community updates (0.0-0.59 score)
- `urgent`: Time-sensitive but not life-threatening (0.60-0.79 score)
- `emergency`: Immediate danger or life-threatening (0.80+ score)

**Example Input:**
```
Text: "Fire reported on Main Street near the library."
```

**Example Output:**
```json
{
  "label": "emergency",
  "score": 0.92
}
```

**Thresholds:**
- `emergency`: score >= 0.80
- `urgent`: 0.60 <= score < 0.80
- `normal`: score < 0.60

---

### Step 3: Merge Results

All AI outputs are merged into a single enriched post object:

```typescript
{
  // User input
  text: "Fire reported on Main Street...",
  imageUrl: "https://...",
  community: "Downtown",
  userId: "auth0|123",
  
  // Gemini enrichment
  category: "Safety",
  categoryScore: 0.95,
  entities: ["Main Street", "library", "Fire department"],
  tags: ["fire", "emergency"],
  location: "Main Street near library",
  
  // HuggingFace enrichment
  urgency: "emergency",
  urgencyScore: 0.92,
  
  // Auto-flags
  status: "flagged" // Auto-flagged if urgency === "emergency"
}
```

---

### Step 4: Store in MongoDB

The enriched post is saved to MongoDB with all metadata indexed for fast querying.

**Indexes:**
- `community + createdAt`: For community feeds
- `urgency + createdAt`: For urgency filtering
- `category`: For category filtering
- `text + tags + category`: Full-text search

---

## API Response

When a post is created, the API returns the full enrichment breakdown:

```json
{
  "success": true,
  "post": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0",
    "text": "Fire reported on Main Street...",
    "urgency": "emergency",
    "category": "Safety",
    "tags": ["fire", "emergency"],
    "entities": ["Main Street", "library"],
    // ... other fields
  },
  "enrichment": {
    "gemini": {
      "category": "Safety",
      "entities": ["Main Street", "library", "Fire department"],
      "tags": ["fire", "emergency"],
      "confidence": 0.95
    },
    "huggingface": {
      "urgency": "emergency",
      "score": 0.92
    }
  }
}
```

---

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Gemini API (Optional - for tag extraction)
GEMINI_API_KEY=your_gemini_api_key_here

# HuggingFace API (Optional - for urgency classification)
HF_TOKEN=hf_your_token_here
HF_ENDPOINT=https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli
```

### Getting API Keys

**Gemini API:**
1. Visit: https://aistudio.google.com/app/apikey
2. Create a new API key
3. Add to `.env` as `GEMINI_API_KEY`

**HuggingFace:**
1. Visit: https://huggingface.co/settings/tokens
2. Create a new access token
3. Add to `.env` as `HF_TOKEN`

---

## Fallback Behavior

Both AI services are **optional**. If they fail or are unavailable:

### Gemini Fallback
Uses keyword-based extraction:
- Simple regex matching for categories
- Keyword detection for tags
- No entity or location extraction
- Confidence: 0.5

### HuggingFace Fallback
Returns default urgency:
- Label: "normal"
- Score: 0.5

The post will still be created and saved with fallback values.

---

## Performance

- **Gemini API**: ~500-1000ms per request
- **HuggingFace**: ~300-800ms per request
- **Total Pipeline**: ~1-2 seconds (parallel execution)
- **Fallback**: ~50ms (keyword matching)

Both APIs are called **in parallel** to minimize total latency.

---

## Error Handling

All errors are logged and handled gracefully:

1. **API Timeout**: Falls back to keyword extraction
2. **Rate Limiting**: Retries with exponential backoff
3. **Invalid Response**: Uses fallback values
4. **Network Error**: Catches and logs, returns post with defaults

The user always gets a successful response, even if AI enrichment fails.

---

## Auto-Flagging

Posts classified as `emergency` are automatically flagged for moderator review:

```typescript
if (post.urgency === 'emergency') {
  post.status = 'flagged';
}
```

Moderators can review and approve/reject flagged posts.

---

## Emergency Clustering

When an emergency post is created, the system checks for emergency clusters:

- If **3+ emergency posts** in the same community within 10 minutes
- An **alert** is automatically created
- Official accounts are notified

---

## Code Structure

```
backend/src/
├── services/
│   ├── gemini.ts       # Gemini API integration
│   ├── hf.ts           # HuggingFace integration
│   └── alerts.ts       # Emergency clustering
├── controllers/
│   └── posts.ts        # Pipeline orchestration
└── models/
    └── Post.ts         # Post schema with enrichment fields
```

---

## Testing

### Test Gemini Extraction

```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Fire reported on Main Street near the library",
    "community": "Downtown"
  }'
```

### Test HuggingFace Classification

```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "URGENT: Gas leak at the shopping center, evacuate immediately!",
    "community": "Midtown"
  }'
```

### Test Fallback Mode

Remove API keys from `.env` and restart:

```bash
# Comment out in .env
# GEMINI_API_KEY=...
# HF_TOKEN=...

npm run dev
```

---

## Monitoring

All pipeline steps are logged with structured metadata:

```typescript
logger.info('Post created with AI enrichment', {
  postId: post._id,
  urgency: post.urgency,
  urgencyScore: post.urgencyScore,
  category: post.category,
  categoryScore: post.categoryScore,
  tags: post.tags,
  entities: post.entities,
});
```

Check logs for pipeline performance and error rates.

---

## Future Enhancements

- [ ] Batch processing for multiple posts
- [ ] Image analysis with Gemini Vision
- [ ] Multi-language support
- [ ] Sentiment analysis
- [ ] Duplicate detection
- [ ] Trending topic extraction

