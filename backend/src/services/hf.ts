import { config } from '../config/env';
import { logger } from '../config/logger';

// Query function - supports both HF Inference API and custom HF Spaces
async function query(data: any): Promise<any> {
  const endpoint = config.hfEndpoint || "https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli";
  const isHfSpace = endpoint.includes('/run/predict');
  
  let payload: any;
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (isHfSpace) {
    // HF Spaces format: { data: [inputs, parameters] }
    payload = {
      data: [
        data.inputs,
        data.parameters || {}
      ]
    };
    // HF Spaces typically don't need auth token in header
    // But add it if your space requires it
    if (config.hfToken && config.hfToken !== 'hf_your_actual_token') {
      headers["Authorization"] = `Bearer ${config.hfToken}`;
    }
  } else {
    // Standard HF Inference API format
    payload = data;
    if (config.hfToken) {
      headers["Authorization"] = `Bearer ${config.hfToken}`;
    }
  }

  const response = await fetch(endpoint, {
    headers,
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HF API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  
  // Handle HF Spaces response format: { data: [result] }
  if (isHfSpace && result.data && Array.isArray(result.data) && result.data.length > 0) {
    return result.data[0]; // Extract the first result from data array
  }
  
  return result;
}

// Retry wrapper with circuit breaker
async function queryWithRetry(data: any, retries = 1): Promise<any> {
  const startTime = Date.now();
  
  try {
    const result = await query(data);
    const duration = Date.now() - startTime;
    
    logger.debug('HF query successful', {
      duration,
      labels: result?.labels?.slice(0, 3),
    });
    
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error('HF query failed', {
      duration,
      error: error?.message,
      status: error?.status,
      retries,
    });
    
    // Retry on 5xx errors
    if (retries > 0 && error?.status >= 500) {
      logger.info('Retrying HF query...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return queryWithRetry(data, retries - 1);
    }
    
    throw error;
  }
}

// Label definitions
const URGENCY_LABELS = ["normal", "urgent", "emergency"];
const CATEGORY_LABELS = ["Safety", "Events", "Lost & Found", "Public Works", "General"];
const TAG_LABELS = [
  "fire",
  "smoke",
  "lost_pet",
  "graffiti",
  "accident",
  "roadblock",
  "tree_fall",
  "flood",
  "power_outage",
  "suspicious_activity",
  "community_event",
  "celebration",
  "protest",
  "construction",
  "noise_complaint",
];

export interface ClassificationResult {
  label: string;
  score: number;
}

export async function classifyUrgency(text: string): Promise<ClassificationResult> {
  try {
    const res = await queryWithRetry({
      inputs: text,
      parameters: { candidate_labels: URGENCY_LABELS },
    });
    
    const label = res?.labels?.[0] || "normal";
    const score = res?.scores?.[0] || 0;
    
    // Apply thresholds from PRD
    let finalLabel = label;
    if (label === "emergency" && score >= 0.80) {
      finalLabel = "emergency";
    } else if (label === "urgent" && score >= 0.60) {
      finalLabel = "urgent";
    } else {
      finalLabel = "normal";
    }
    
    return { label: finalLabel, score };
  } catch (error) {
    logger.error('Failed to classify urgency, using fallback', { error });
    return { label: "normal", score: 0 };
  }
}

export async function classifyCategory(text: string): Promise<ClassificationResult> {
  try {
    const res = await queryWithRetry({
      inputs: text,
      parameters: { candidate_labels: CATEGORY_LABELS },
    });
    
    const label = res?.labels?.[0] || "General";
    const score = res?.scores?.[0] || 0;
    
    return { label, score };
  } catch (error) {
    logger.error('Failed to classify category, using fallback', { error });
    return { label: "General", score: 0 };
  }
}

export async function extractTags(text: string, threshold = 0.25): Promise<string[]> {
  try {
    const res = await queryWithRetry({
      inputs: text,
      parameters: { candidate_labels: TAG_LABELS },
    });
    
    if (!res?.labels || !res?.scores) {
      return [];
    }
    
    // Keep all labels above threshold
    const tags: string[] = [];
    for (let i = 0; i < res.labels.length; i++) {
      if (res.scores[i] >= threshold) {
        tags.push(res.labels[i]);
      }
    }
    
    return tags;
  } catch (error) {
    logger.error('Failed to extract tags, returning empty', { error });
    return [];
  }
}

export interface EnrichmentResult {
  urgency: string;
  urgencyScore: number;
  category: string;
  categoryScore: number;
  tags: string[];
}

// Main enrichment function
export async function enrichPost(text: string): Promise<EnrichmentResult> {
  try {
    // Run classifications in parallel for speed
    const [urgencyResult, categoryResult, tags] = await Promise.all([
      classifyUrgency(text),
      classifyCategory(text),
      extractTags(text),
    ]);
    
    return {
      urgency: urgencyResult.label,
      urgencyScore: urgencyResult.score,
      category: categoryResult.label,
      categoryScore: categoryResult.score,
      tags,
    };
  } catch (error) {
    logger.error('Failed to enrich post', { error });
    // Return safe defaults
    return {
      urgency: "normal",
      urgencyScore: 0,
      category: "General",
      categoryScore: 0,
      tags: [],
    };
  }
}

