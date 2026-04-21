import { Router } from 'express';
import {
  triggerAnalysis,
  getAnalysisRuns,
  getMentionsByRun,
} from '../controllers/analysisController';
import { authenticateUser } from '../middleware/auth';
import { validateModelAccess } from '../middleware/validateModelAccess';

const router = Router();

router.get('/', authenticateUser, getAnalysisRuns);
router.post('/', authenticateUser, validateModelAccess, triggerAnalysis);
router.get('/:runId/mentions', authenticateUser, getMentionsByRun);

export default router;
