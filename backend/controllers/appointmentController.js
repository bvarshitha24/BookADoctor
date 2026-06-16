import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Notification from '../models/Notification.js';

// Helper to create in-app notifications and broadcast via Socket.io
const sendNotification = async (req, userId, title, description, type) => {
  try {
    const notif = await Notification.create({
      user: userId,
      title,
      description,
      type
    });
    if (req.io) {
      req.io.to(userId.toString()).emit('notification', notif);
    }
  } catch (err) {
    console.error('Failed to save notification:', err);
  }
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, appointmentType, symptoms, notes, uploadedReports } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !appointmentDate || !appointmentTime || !appointmentType) {
      return res.status(400).json({ success: false, message: 'Doctor, date, time and consultation type are required' });
    }

    // 1. Verify Doctor exists & is approved
    const doctor = await Doctor.findById(doctorId).populate('user', 'fullName');
    if (!doctor || doctor.status !== 'Approved') {
      return res.status(404).json({ success: false, message: 'Doctor profile is not active or available' });
    }

    // 2. Validate day of week availability
    const dateObj = new Date(appointmentDate);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDay = days[dateObj.getDay()];

    if (!doctor.availableDays.includes(selectedDay)) {
      return res.status(400).json({ 
        success: false, 
        message: `Doctor is not available on ${selectedDay}s. Available days: ${doctor.availableDays.join(', ')}` 
      });
    }

    // 3. Double Booking Check
    const startOfSelectedDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfSelectedDay = new Date(dateObj.setHours(23, 59, 59, 999));

    const conflict = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: { $gte: startOfSelectedDay, $lte: endOfSelectedDay },
      appointmentTime: appointmentTime,
      appointmentStatus: { $in: ['Pending', 'Confirmed', 'Rescheduled'] }
    });

    if (conflict) {
      return res.status(400).json({ 
        success: false, 
        message: 'This time slot is already booked. Please choose a different time slot.' 
      });
    }

    // 4. Generate simulated online meeting link if consultation is Online
    let meetingLink = '';
    if (appointmentType === 'Online') {
      meetingLink = `https://meet.jit.si/ShopEZ-Doctor-${doctorId}-${Date.now()}`;
    }

    // 5. Create Appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      appointmentDate: appointmentDate,
      appointmentTime,
      appointmentType,
      symptoms,
      notes,
      uploadedReports: uploadedReports || [],
      paymentStatus: 'Paid', // Simulation automatically marks as Paid
      appointmentStatus: 'Confirmed', // Automatically confirms upon successful payment simulation
      meetingLink
    });

    // 6. Update Doctor total appointment stats
    doctor.totalAppointments += 1;
    await doctor.save();

    // 7. Send Notifications
    await sendNotification(
      req,
      doctor.user._id, 
      'New Appointment Booked', 
      `Patient ${req.user.fullName} has booked an appointment for ${appointmentTime} on ${new Date(appointmentDate).toLocaleDateString()}.`, 
      'Appointment'
    );

    await sendNotification(
      req,
      patientId, 
      'Appointment Confirmed', 
      `Your appointment with Dr. ${doctor.user.fullName} for ${appointmentTime} has been successfully scheduled.`, 
      'Appointment'
    );

    return res.status(201).json({
      success: true,
      message: 'Appointment booked and confirmed successfully',
      appointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's appointments (Patient or Doctor)
// @route   GET /api/appointments/my-appointments
// @access  Private
export const getMyAppointments = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'Patient') {
      appointments = await Appointment.find({ patient: req.user.id })
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'fullName profilePicture email' }
        })
        .sort({ appointmentDate: -1 });
    } else if (req.user.role === 'Doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor profile not found' });
      }

      appointments = await Appointment.find({ doctor: doctor._id })
        .populate('patient', 'fullName email phoneNumber gender dob profilePicture')
        .sort({ appointmentDate: -1 });
    } else {
      // Admin sees everything (limiting to most recent 100 to optimize dashboard payload)
      appointments = await Appointment.find()
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'fullName profilePicture email' }
        })
        .populate('patient', 'fullName email')
        .sort({ appointmentDate: -1 })
        .limit(100);
    }

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancellationReason, date, time } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'fullName')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'fullName' } });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Authorization checks
    const isPatient = req.user.id === appointment.patient._id.toString();
    const isDoctor = req.user.role === 'Doctor' && req.user.id === appointment.doctor.user.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this appointment' });
    }

    if (status === 'Cancelled') {
      appointment.appointmentStatus = 'Cancelled';
      appointment.cancellationReason = cancellationReason || 'No reason provided';
      
      const recipientId = isPatient ? appointment.doctor.user : appointment.patient._id;
      const initiator = isPatient ? `Patient ${appointment.patient.fullName}` : `Dr. ${appointment.doctor.user.fullName}`;
      await sendNotification(
        req,
        recipientId,
        'Appointment Cancelled',
        `Your scheduled appointment was cancelled by ${initiator}. Reason: ${appointment.cancellationReason}`,
        'Appointment'
      );
    } else if (status === 'Rescheduled') {
      if (!date || !time) {
        return res.status(400).json({ success: false, message: 'Date and time are required for rescheduling' });
      }

      // Check slot availability
      const dateObj = new Date(date);
      const startOfSelectedDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfSelectedDay = new Date(dateObj.setHours(23, 59, 59, 999));

      const conflict = await Appointment.findOne({
        doctor: appointment.doctor._id,
        appointmentDate: { $gte: startOfSelectedDay, $lte: endOfSelectedDay },
        appointmentTime: time,
        appointmentStatus: { $in: ['Pending', 'Confirmed', 'Rescheduled'] },
        _id: { $ne: appointment._id }
      });

      if (conflict) {
        return res.status(400).json({ success: false, message: 'The requested rescheduled slot is already occupied.' });
      }

      appointment.appointmentDate = date;
      appointment.appointmentTime = time;
      appointment.appointmentStatus = 'Rescheduled';

      const recipientId = isPatient ? appointment.doctor.user : appointment.patient._id;
      const initiator = isPatient ? `Patient ${appointment.patient.fullName}` : `Dr. ${appointment.doctor.user.fullName}`;
      await sendNotification(
        req,
        recipientId,
        'Appointment Rescheduled',
        `Your appointment has been rescheduled by ${initiator} to ${new Date(date).toLocaleDateString()} at ${time}.`,
        'Appointment'
      );
    } else {
      // General status updates (Confirmed, Completed)
      if (req.user.role === 'Patient' && status === 'Completed') {
        return res.status(403).json({ success: false, message: 'Only doctors can mark consultations as completed' });
      }
      
      appointment.appointmentStatus = status;
      
      if (status === 'Completed') {
        await sendNotification(
          req,
          appointment.patient._id,
          'Consultation Completed',
          `Your medical appointment with Dr. ${appointment.doctor.user.fullName} is complete. You can write a review.`,
          'Appointment'
        );
      }
    }

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload digital prescription
// @route   POST /api/appointments/:id/prescription
// @access  Private (Doctor only)
export const uploadPrescription = async (req, res) => {
  try {
    const { diagnosis, medications, notes, followUpDate } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'fullName')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'fullName' } });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Ensure logged-in doctor owns this appointment
    if (req.user.id !== appointment.doctor.user.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to prescribe for this appointment' });
    }

    appointment.prescription = {
      diagnosis,
      medications: medications || [],
      notes,
      dateUploaded: new Date()
    };
    if (followUpDate) {
      appointment.followUpDate = followUpDate;
    }
    
    // Automatically mark the appointment as Completed when prescription is uploaded
    appointment.appointmentStatus = 'Completed';

    await appointment.save();

    // Send notifications
    await sendNotification(
      req,
      appointment.patient._id,
      'Prescription Uploaded',
      `Dr. ${appointment.doctor.user.fullName} has uploaded a digital prescription for you.`,
      'Prescription'
    );

    return res.status(200).json({
      success: true,
      message: 'Prescription uploaded and consultation completed successfully',
      appointment
    });
  } catch (error) {
    console.error('Upload prescription error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
