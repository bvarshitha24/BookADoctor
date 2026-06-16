import express from 'express';
import { getMyNotifications, markNotificationAsRead, readAllNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.put('/read-all', readAllNotifications);
router.put('/:id/read', markNotificationAsRead);

export default router;
