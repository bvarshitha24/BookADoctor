import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String, required: true, index: true },
  qualification: [{ type: String, required: true }],
  experience: { type: Number, required: true, index: true }, // years of experience
  consultationFee: { type: Number, required: true, index: true },
  hospitalName: { type: String, required: true },
  address: { type: String },
  city: { type: String, required: true, index: true },
  state: { type: String },
  availableDays: [{ type: String }], // e.g., ['Monday', 'Wednesday']
  availableTimeSlots: [{ type: String }], // e.g., ['09:00', '10:00']
  languagesSpoken: [{ type: String }],
  certificates: [{ type: String }],
  licenseNumber: { type: String, required: true },
  biography: { type: String },
  rating: { type: Number, default: 0, index: true },
  reviewsCount: { type: Number, default: 0 },
  totalAppointments: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  insuranceAccepted: [{ type: String }],
  waitingTimeIndicator: { type: Number, default: 15 } // in minutes
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
