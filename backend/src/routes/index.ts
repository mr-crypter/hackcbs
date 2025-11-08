import { Router } from 'express';
import authRoutes from './auth';
import postsRoutes from './posts';
import alertsRoutes from './alerts';
import summaryRoutes from './summary';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/posts', postsRoutes);
router.use('/alerts', alertsRoutes);
router.use('/summary', summaryRoutes);

export default router;

