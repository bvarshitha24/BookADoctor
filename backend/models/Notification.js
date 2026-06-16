import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Appointment', 'Prescription', 'Approval', 'System'], required: true },
  readStatus: { type: Boolean, default: false },
  createdTime: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
