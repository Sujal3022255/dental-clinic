import { Router } from 'express';
import {
  createTreatment,
  getTreatments,
  getTreatmentById,
  updateTreatment,
  deleteTreatment,
} from '../controllers/treatmentController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// All treatment routes require authentication
router.use(authenticateToken);

router.post('/', authorizeRoles('DENTIST', 'ADMIN'), createTreatment);
router.get('/', getTreatments);
router.get('/:id', getTreatmentById);
router.patch('/:id', authorizeRoles('DENTIST', 'ADMIN'), updateTreatment);
router.delete('/:id', authorizeRoles('ADMIN'), deleteTreatment);

export default router;
