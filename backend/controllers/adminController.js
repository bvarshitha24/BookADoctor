import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';

// @desc    Get pending doctor applications
// @route   GET /api/admin/doctor-applications
// @access  Private (Admin only)
export const getDoctorApplications = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: 'Pending' })
      .populate('user', 'fullName email phoneNumber gender dob profilePicture');

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or Reject doctor application
// @route   PUT /api/admin/approve-doctor/:id
// @access  Private (Admin only)
export const approveDoctor = async (req, res) => {
  try {
    const { status } = req.body; // Approved or Rejected
    
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Choose Approved or Rejected' });
    }

    const doctor = await Doctor.findById(req.params.id).populate('user', 'fullName');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor application not found' });
    }

    doctor.status = status;
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: `Doctor status updated to ${status}`,
      doctor
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private (Admin only)
export const getPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'Patient' }).select('-password');
    return res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle blocking status of a user
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin only)
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Toggle custom block field
    user.isBlocked = !user.isBlocked;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User is now ${user.isBlocked ? 'Blocked' : 'Unblocked'}`,
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a doctor directly (pre-approved)
// @route   POST /api/admin/add-doctor
// @access  Private (Admin only)
export const addDoctor = async (req, res) => {
  try {
    const { 
      fullName, email, password, phoneNumber, gender, dob,
      specialization, qualification, experience, consultationFee, hospitalName, city, licenseNumber, biography
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create User (Pre-save hook will hash password)
    const user = await User.create({
      fullName,
      email,
      password,
      role: 'Doctor',
      phoneNumber,
      gender,
      dob,
      isVerified: true
    });

    // Create Doctor Profile directly as Approved
    const doctorProfile = await Doctor.create({
      user: user._id,
      specialization,
      qualification: Array.isArray(qualification) ? qualification : [qualification],
      experience: Number(experience),
      consultationFee: Number(consultationFee),
      hospitalName,
      city,
      licenseNumber,
      biography,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableTimeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      languagesSpoken: ['English'],
      status: 'Approved'
    });

    return res.status(201).json({
      success: true,
      message: 'Doctor account created and approved successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      doctorProfile
    });
  } catch (error) {
    console.error('Admin add doctor error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Core KPIs
    const totalPatients = await User.countDocuments({ role: 'Patient' });
    const totalDoctors = await Doctor.countDocuments({ status: 'Approved' });
    const totalAppointments = await Appointment.countDocuments();
    
    // Calculate total earnings (sum of fees for confirmed/completed appointments)
    const completedAppointments = await Appointment.find({ 
      appointmentStatus: { $in: ['Completed', 'Confirmed', 'Rescheduled'] } 
    }).populate('doctor', 'consultationFee');

    const totalRevenue = completedAppointments.reduce((sum, app) => {
      return sum + (app.doctor ? app.doctor.consultationFee : 0);
    }, 0);

    // 2. Appointment Status Distribution
    const statusDistribution = await Appointment.aggregate([
      { $group: { _id: '$appointmentStatus', count: { $sum: 1 } } }
    ]);

    // 3. Top Rated Doctors
    const topDoctors = await Doctor.find({ status: 'Approved' })
      .populate('user', 'fullName profilePicture')
      .sort({ rating: -1 })
      .limit(5);

    // 4. Specialization Distribution
    const specializationDistribution = await Doctor.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 5. Monthly Appointments Trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyAppointments = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        kpis: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          totalRevenue
        },
        statusDistribution,
        topDoctors,
        specializationDistribution,
        monthlyAppointments
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
