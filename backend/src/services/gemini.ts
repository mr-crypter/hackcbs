import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import { logger } from '../config/logger';

// Initialize Gemini API
let genAI: GoogleGenerativeAI | null = null;

if (config.geminiApiKey) {
  genAI = new GoogleGenerativeAI(config.geminiApiKey);
} else {
  logger.warn('Gemini API key not configured - tag extraction will be disabled');
}

export interface GeminiExtractionResult {
  category: string;
  entities: string[];
  location: string | null;
  tags: string[];
  confidence: number;
}

/**
 * Extract structured tags from text using Gemini API
 * - Category classification
 * - Entity extraction (people, places, organizations)
 * - Location detection
 * - Relevant tags
 */
export async function extractTags(text: string, imageUrl?: string | null): Promise<GeminiExtractionResult> {
  if (!genAI) {
    logger.warn('Gemini API not available, using fallback extraction');
    return fallbackExtraction(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' }); // Using latest available model

    const prompt = `Analyze this community post and extract structured information in JSON format.

Post text: "${text}"
${imageUrl ? `Image URL: ${imageUrl}` : ''}

Extract:
1. **category**: ONE of ["Safety", "Events", "Lost & Found", "Public Works", "General"]
2. **entities**: List of important people, places, or organizations mentioned (max 5)
3. **location**: Specific location mentioned or null
4. **tags**: Relevant descriptive tags (max 5 from: fire, smoke, lost_pet, graffiti, accident, roadblock, tree_fall, flood, power_outage, suspicious_activity, community_event, celebration, protest, construction, noise_complaint, medical_emergency, weather_alert, missing_person)
5. **confidence**: Your confidence score (0.0-1.0)

Return ONLY valid JSON in this format:
{
  "category": "Safety",
  "entities": ["Main Street", "Police Department"],
  "location": "Corner of Main and 5th",
  "tags": ["accident", "roadblock"],
  "confidence": 0.95
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Parse JSON response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Gemini response');
    }

    const extracted = JSON.parse(jsonMatch[0]) as GeminiExtractionResult;

    // Validate and sanitize
    const validCategories = ['Safety', 'Events', 'Lost & Found', 'Public Works', 'General'];
    if (!validCategories.includes(extracted.category)) {
      extracted.category = 'General';
    }

    // Limit arrays
    extracted.entities = (extracted.entities || []).slice(0, 5);
    extracted.tags = (extracted.tags || []).slice(0, 5);
    extracted.confidence = Math.max(0, Math.min(1, extracted.confidence || 0.5));

    logger.info('Gemini extraction successful', {
      category: extracted.category,
      tagCount: extracted.tags.length,
      confidence: extracted.confidence,
    });

    return extracted;
  } catch (error: any) {
    logger.error('Gemini extraction failed', {
      error: error?.message,
      text: text.substring(0, 100),
    });
    return fallbackExtraction(text);
  }
}

/**
 * Fallback extraction using simple keyword matching
 */
function fallbackExtraction(text: string): GeminiExtractionResult {
  const textLower = text.toLowerCase();
  
  // Simple category detection
  let category = 'General';
  if (/fire|emergency|danger|unsafe|accident|crime|suspicious/i.test(text)) {
    category = 'Safety';
  } else if (/event|festival|concert|meeting|gathering/i.test(text)) {
    category = 'Events';
  } else if (/lost|found|missing/i.test(text)) {
    category = 'Lost & Found';
  } else if (/road|pothole|water|electric|maintenance|repair/i.test(text)) {
    category = 'Public Works';
  }

  // Extract simple tags based on keywords
  const tags: string[] = [];
  const tagKeywords: Record<string, string[]> = {
    fire: ['fire', 'burning', 'smoke'],
    accident: ['accident', 'crash', 'collision'],
    flood: ['flood', 'flooding', 'water'],
    power_outage: ['power', 'outage', 'electricity'],
    lost_pet: ['lost pet', 'missing dog', 'missing cat'],
    construction: ['construction', 'building', 'repair'],
    suspicious_activity: ['suspicious', 'unusual', 'strange'],
  };

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(kw => textLower.includes(kw))) {
      tags.push(tag);
    }
  }

  return {
    category,
    entities: [],
    location: null,
    tags: tags.slice(0, 5),
    confidence: 0.5,
  };
}

/**
 * Extract tags from multiple posts in batch (for efficiency)
 */
export async function extractTagsBatch(
  posts: Array<{ text: string; imageUrl?: string | null }>
): Promise<GeminiExtractionResult[]> {
  // Process in parallel with a limit of 5 concurrent requests
  const batchSize = 5;
  const results: GeminiExtractionResult[] = [];

  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(post => extractTags(post.text, post.imageUrl))
    );
    results.push(...batchResults);
  }

  return results;
}

