import { Router } from 'express';
import {
  getAllDentists,
  getDentistById,
  updateDentistProfile,
  setDentistAvailability,
} from '../controllers/dentistController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/', getAllDentists);
router.get('/:id', getDentistById);

router.use(authenticateToken);

router.patch('/:id', authorizeRoles('DENTIST', 'ADMIN'), updateDentistProfile);
router.post('/:dentistId/availability', authorizeRoles('DENTIST', 'ADMIN'), setDentistAvailability);

export default router;
