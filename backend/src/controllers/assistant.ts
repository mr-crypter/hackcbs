import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errors';
import { askAssistant } from '../services/assistant';
import { AuthRequest } from '../middleware/auth';

/**
 * Handle chat/assistant queries
 * POST /api/assistant/chat
 * Body: { query: string, community?: string }
 */
export const chatAssistant = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    // Validation is handled by Zod middleware, so req.body is already validated
    const { query, community } = req.body;

    console.log('💬 Assistant query:', { query, community });

    try {
      const result = await askAssistant(query.trim(), community);

      console.log('✅ Assistant response generated:', {
        responseLength: result.response.length,
        sourcesCount: result.sources?.length || 0,
      });

      res.json({
        success: true,
        response: result.response,
        sources: result.sources,
      });
    } catch (error: any) {
      console.error('❌ Assistant controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process assistant query',
        message: error?.message || 'Unknown error',
      });
    }
  }
);

/**
 * Diagnostic endpoint to check assistant status
 * GET /api/assistant/status
 */
export const getAssistantStatus = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { config } = await import('../config/env');
    
    res.json({
      success: true,
      status: {
        geminiConfigured: !!config.geminiApiKey,
        apiKeyPrefix: config.geminiApiKey ? config.geminiApiKey.substring(0, 10) + '...' : 'NOT_SET',
      },
    });
  }
);

