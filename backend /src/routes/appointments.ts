import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  rescheduleAppointment,
  approveAppointment,
  rejectAppointment,
} from '../controllers/appointmentController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createAppointment);
router.get('/', getAppointments);
router.patch('/:id/status', authorizeRoles('DENTIST', 'ADMIN'), updateAppointmentStatus);
router.patch('/:id/reschedule', rescheduleAppointment);
router.patch('/:id/approve', authorizeRoles('DENTIST', 'ADMIN'), approveAppointment);
router.patch('/:id/reject', authorizeRoles('DENTIST', 'ADMIN'), rejectAppointment);
router.delete('/:id', deleteAppointment);

export default router;
