import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { getBrands, createBrand } from '../controllers/brandController';

const router = Router();

// These routes are now relative to the mount point /api/brands
router.get('/', authenticateUser, getBrands);
router.post('/', authenticateUser, createBrand);

export default router;
