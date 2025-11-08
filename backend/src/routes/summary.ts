import { Router } from 'express';
import { validate } from '../middleware/validation';
import { dailySummarySchema } from '../middleware/validation';
import { getDailySummary } from '../controllers/summary';

const router = Router();

router.get('/daily', validate(dailySummarySchema), getDailySummary);

export default router;

