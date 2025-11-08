import { Router } from 'express';
import { checkJwt, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createAlertSchema } from '../middleware/validation';
import { listAlerts, createMockAlert } from '../controllers/alerts';

const router = Router();

router.get('/', listAlerts);

// Official role only
router.post(
  '/mock',
  checkJwt,
  requireRole('official', 'moderator'),
  validate(createAlertSchema),
  createMockAlert
);

export default router;

