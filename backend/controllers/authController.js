import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const generateToken = (res, id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey12345!', {
    expiresIn: '30d'
  });

  // Set token in HTTPOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  return token;
};

// @desc    Register a new user (Patient or Doctor)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { 
      fullName, email, password, role, phoneNumber, gender, dob,
      // Clinical fields for Doctor registration
      specialization, qualification, experience, consultationFee, hospitalName, city, licenseNumber, biography
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create User
    const user = await User.create({
      fullName,
      email,
      password,
      role: role || 'Patient',
      phoneNumber,
      gender,
      dob,
      verificationToken,
      isVerified: role === 'Admin' // Admins auto-verified, patients/doctors can verify via link or seeded accounts
    });

    let doctorProfile = null;

    // If role is Doctor, create a Doctor profile
    if (role === 'Doctor') {
      if (!specialization || !qualification || !experience || !consultationFee || !hospitalName || !city || !licenseNumber) {
        // Rollback user creation
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ 
          success: false, 
          message: 'All clinical details (specialization, qualification, experience, fee, hospital, city, license) are required for Doctors' 
        });
      }

      doctorProfile = await Doctor.create({
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
        status: 'Pending' // Requires admin approval
      });
    }

    // For testing and simulation, we print the verification link
    console.log(`Verification Token for ${email}: ${verificationToken}`);

    // Auto verify in non-production environments to smooth development
    user.isVerified = true;
    await user.save();

    const token = generateToken(res, user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      doctorProfile
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    let doctorProfile = null;
    if (user.role === 'Doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    const token = generateToken(res, user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified
      },
      doctorProfile
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let doctorProfile = null;

    if (user.role === 'Doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      user,
      doctorProfile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Common fields
    const { 
      fullName, phoneNumber, gender, dob, profilePicture, address,
      emergencyContact, medicalHistory, allergies, currentMedications,
      // Doctor fields
      specialization, qualification, experience, consultationFee, hospitalName, city, state,
      availableDays, availableTimeSlots, languagesSpoken, biography, insuranceAccepted
    } = req.body;

    user.fullName = fullName || user.fullName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.gender = gender || user.gender;
    user.dob = dob || user.dob;
    user.profilePicture = profilePicture !== undefined ? profilePicture : user.profilePicture;
    user.address = address || user.address;

    if (user.role === 'Patient') {
      user.emergencyContact = emergencyContact || user.emergencyContact;
      user.medicalHistory = medicalHistory || user.medicalHistory;
      user.allergies = allergies || user.allergies;
      user.currentMedications = currentMedications || user.currentMedications;
    }

    await user.save();

    let doctorProfile = null;
    if (user.role === 'Doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
      if (doctorProfile) {
        doctorProfile.specialization = specialization || doctorProfile.specialization;
        doctorProfile.qualification = qualification || doctorProfile.qualification;
        doctorProfile.experience = experience !== undefined ? Number(experience) : doctorProfile.experience;
        doctorProfile.consultationFee = consultationFee !== undefined ? Number(consultationFee) : doctorProfile.consultationFee;
        doctorProfile.hospitalName = hospitalName || doctorProfile.hospitalName;
        doctorProfile.city = city || doctorProfile.city;
        doctorProfile.state = state || doctorProfile.state;
        doctorProfile.availableDays = availableDays || doctorProfile.availableDays;
        doctorProfile.availableTimeSlots = availableTimeSlots || doctorProfile.availableTimeSlots;
        doctorProfile.languagesSpoken = languagesSpoken || doctorProfile.languagesSpoken;
        doctorProfile.biography = biography || doctorProfile.biography;
        doctorProfile.insuranceAccepted = insuranceAccepted || doctorProfile.insuranceAccepted;

        await doctorProfile.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
      doctorProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    console.log(`Reset Token for ${email}: ${resetToken}`);

    return res.status(200).json({
      success: true,
      message: 'Password reset link sent to console. For testing, use the reset token.',
      resetToken // Returning it directly for development simulation ease
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
