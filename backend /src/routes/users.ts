import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// All user routes require admin authentication
router.get('/', authenticateToken, authorizeRoles('ADMIN'), getAllUsers);
router.get('/:id', authenticateToken, authorizeRoles('ADMIN'), getUserById);
router.patch('/:id', authenticateToken, authorizeRoles('ADMIN'), updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteUser);

export default router;
