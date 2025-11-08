import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errors';

export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    if (!req.auth) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json({
      userId: req.auth.sub,
      permissions: req.auth.permissions || [],
      profile: {
        ...req.auth,
      },
    });
  }
);

