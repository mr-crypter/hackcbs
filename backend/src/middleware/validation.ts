import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errors';

export const createPostSchema = z.object({
  text: z.string().min(3, 'Text must be at least 3 characters').max(2000, 'Text too long'),
  imageUrl: z.string().url().optional().nullable(),
  community: z.string().min(2, 'Community name required'),
  location: z.string().max(200).optional().nullable(),
});

export const listPostsSchema = z.object({
  community: z.string().optional(),
  urgency: z.enum(['normal', 'urgent', 'emergency']).optional(),
  category: z.enum(['Safety', 'Events', 'Lost & Found', 'Public Works', 'General']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const searchPostsSchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters'),
  community: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const createAlertSchema = z.object({
  type: z.string().min(2),
  community: z.string().min(2),
  reason: z.string().min(5),
  postIds: z.array(z.string()).optional(),
});

export const dailySummarySchema = z.object({
  community: z.string().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export function validate(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = req.method === 'GET' ? req.query : req.body;
      const validated = schema.parse(data);
      
      if (req.method === 'GET') {
        req.query = validated as any;
      } else {
        req.body = validated;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new AppError(messages, 400));
      } else {
        next(error);
      }
    }
  };
}

