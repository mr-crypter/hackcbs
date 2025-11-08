import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  hfToken?: string; // Optional - for AI features
  hfEndpoint?: string; // Custom HF Space endpoint
  auth0Domain: string;
  auth0Audience: string;
  auth0Issuer: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

function validateEnv(): EnvConfig {
  const required = [
    'MONGO_URI',
    'AUTH0_DOMAIN',
    'AUTH0_AUDIENCE',
    'AUTH0_ISSUER',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  return {
    port: parseInt(process.env.PORT || '8080', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI!,
    hfToken: process.env.HF_TOKEN, // Optional
    hfEndpoint: process.env.HF_ENDPOINT || 'https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli',
    auth0Domain: process.env.AUTH0_DOMAIN!,
    auth0Audience: process.env.AUTH0_AUDIENCE!,
    auth0Issuer: process.env.AUTH0_ISSUER!,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  };
}

export const config = validateEnv();

