import Review from '../models/Review.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

// @desc    Add review for a doctor
// @route   POST /api/doctors/:id/reviews
// @access  Private (Patient only)
export const createReview = async (req, res) => {
  try {
    const { rating, review, images } = req.body;
    const doctorId = req.params.id;
    const patientId = req.user.id;

    // 1. Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // 2. Security Check: Verify patient has at least one completed appointment with this doctor
    const hasCompletedAppointment = await Appointment.findOne({
      patient: patientId,
      doctor: doctorId,
      appointmentStatus: 'Completed'
    });

    if (!hasCompletedAppointment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Feedback can only be submitted for completed doctor appointments.' 
      });
    }

    // 3. Create Review
    const newReview = await Review.create({
      doctor: doctorId,
      patient: patientId,
      rating: Number(rating),
      review,
      images: images || []
    });

    // 4. Update Doctor aggregate rating metrics
    const allReviews = await Review.find({ doctor: doctorId });
    const reviewsCount = allReviews.length;
    const avgRating = allReviews.reduce((sum, item) => sum + item.rating, 0) / reviewsCount;

    doctor.rating = parseFloat(avgRating.toFixed(1));
    doctor.reviewsCount = reviewsCount;
    await doctor.save();

    return res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
