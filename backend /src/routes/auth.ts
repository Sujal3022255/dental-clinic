import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getCurrentUser, refreshToken } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Registration validation
const validateRegistration = validate([
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role').isIn(['USER', 'PATIENT', 'DENTIST', 'ADMIN']).withMessage('Invalid role'),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('phone').optional().trim(),
  body('specialization').optional().trim(),
  body('licenseNumber').if(body('role').equals('DENTIST')).notEmpty().withMessage('License number is required for dentists'),
]);

// Login validation
const validateLogin = validate([
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]);

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
