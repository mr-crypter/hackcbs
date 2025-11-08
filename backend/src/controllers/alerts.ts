import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errors';
import { getRecentAlerts, createManualAlert } from '../services/alerts';

export const listAlerts = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { community } = req.query;

    if (!community) {
      return res.status(400).json({
        error: 'Community parameter required',
      });
    }

    const alerts = await getRecentAlerts(community as string);

    res.json({
      success: true,
      alerts,
    });
  }
);

export const createMockAlert = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { type, community, reason, postIds } = req.body;

    const alert = await createManualAlert(type, community, reason, postIds);

    res.status(201).json({
      success: true,
      alert,
    });
  }
);

