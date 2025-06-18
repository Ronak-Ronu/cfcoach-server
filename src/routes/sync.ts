import { Router } from 'express';
import { triggerSync } from '../controllers/syncController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.post('/', triggerSync);

export default router;