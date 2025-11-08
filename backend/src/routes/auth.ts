import { Router } from 'express';
import { checkJwt } from '../middleware/auth';
import { getMe } from '../controllers/auth';

const router = Router();

router.get('/me', checkJwt, getMe);

export default router;

