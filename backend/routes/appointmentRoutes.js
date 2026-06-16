import express from 'express';
import { bookAppointment, getMyAppointments, updateAppointmentStatus, uploadPrescription } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('Patient'), bookAppointment);
router.get('/my-appointments', getMyAppointments);
router.put('/:id/status', updateAppointmentStatus);
router.post('/:id/prescription', authorize('Doctor'), uploadPrescription);

export default router;
