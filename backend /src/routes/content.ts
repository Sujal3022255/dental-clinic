import { Router } from 'express';
import {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} from '../controllers/contentController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllContent);
router.get('/:id', getContentById);

// Protected routes (Admin only)
router.use(authenticateToken);
router.post('/', authorizeRoles('ADMIN'), createContent);
router.patch('/:id', authorizeRoles('ADMIN'), updateContent);
router.delete('/:id', authorizeRoles('ADMIN'), deleteContent);

export default router;
