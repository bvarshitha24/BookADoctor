import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
  appointmentDate: { type: Date, required: true, index: true },
  appointmentTime: { type: String, required: true },
  appointmentType: { type: String, enum: ['Online', 'Offline'], required: true },
  symptoms: { type: String },
  notes: { type: String },
  uploadedReports: [{ type: String }],
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Pending' },
  paymentId: { type: String },
  appointmentStatus: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled'], 
    default: 'Pending',
    index: true
  },
  cancellationReason: { type: String },
  meetingLink: { type: String },
  prescription: {
    diagnosis: { type: String },
    medications: [{
      name: { type: String },
      dosage: { type: String }, // e.g. "500mg"
      frequency: { type: String }, // e.g. "Once daily", "Twice daily"
      duration: { type: String } // e.g. "5 days"
    }],
    notes: { type: String },
    dateUploaded: { type: Date }
  },
  followUpDate: { type: Date }
}, {
  timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
