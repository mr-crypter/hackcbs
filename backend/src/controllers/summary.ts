import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errors';
import { getOrCreateDailySummary } from '../services/summary';

export const getDailySummary = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { community, date } = req.query as any;

    if (!community) {
      return res.status(400).json({
        error: 'Community parameter required',
      });
    }

    const summary = await getOrCreateDailySummary(community, date);

    res.json({
      success: true,
      summary,
    });
  }
);

