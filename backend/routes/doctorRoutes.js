import express from 'express';
import { getDoctors, getDoctorById } from '../controllers/doctorController.js';
import { createReview } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/:id/reviews', protect, authorize('Patient'), createReview);

export default router;
