import express from 'express';
import { getDoctorApplications, approveDoctor, getPatients, toggleBlockUser, getAdminAnalytics, addDoctor } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.get('/doctor-applications', getDoctorApplications);
router.put('/approve-doctor/:id', approveDoctor);
router.get('/patients', getPatients);
router.put('/users/:id/block', toggleBlockUser);
router.get('/analytics', getAdminAnalytics);
router.post('/add-doctor', addDoctor);

export default router;
