import { Router } from 'express';
import { chatAssistant, getAssistantStatus } from '../controllers/assistant';
import { checkJwt } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Validation schema for chat request
const chatSchema = z.object({
  query: z.string().min(1).max(500),
  community: z.string().optional(),
});

// GET /api/assistant/status - Check assistant status (no auth required)
router.get('/status', getAssistantStatus);

// POST /api/assistant/chat - Chat with AI assistant
router.post('/chat', checkJwt, validate(chatSchema), chatAssistant);

export default router;

