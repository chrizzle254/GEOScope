import { Router } from 'express';
import { triggerAnalysis } from '../controllers/analysisController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// POST / - Trigger a new analysis run
// Protected by JWT authentication middleware
router.post('/', authenticateUser, triggerAnalysis);

export default router;
