import { Router } from 'express';
import { triggerAnalysis } from '../controllers/analysisController';
import { authenticateUser } from '../middleware/auth';
import { validateModelAccess } from '../middleware/validateModelAccess';

const router = Router();

// POST / - Trigger a new analysis run
// Protected by JWT authentication and model validation middleware
router.post('/', authenticateUser, validateModelAccess, triggerAnalysis);

export default router;
