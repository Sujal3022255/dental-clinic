import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} from '../controllers/appointmentController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createAppointment);
router.get('/', getAppointments);
router.patch('/:id/status', authorizeRoles('DENTIST', 'ADMIN'), updateAppointmentStatus);
router.delete('/:id', deleteAppointment);

export default router;
