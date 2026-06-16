import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Review from '../models/Review.js';

// @desc    Get all approved doctors with advanced search, filtering and sorting
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res) => {
  try {
    const {
      search,
      specialization,
      city,
      experience,
      maxFee,
      minRating,
      gender,
      language,
      day,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    const query = { status: 'Approved' };

    // 1. Text Search across Doctor name, hospitalName, and specialization
    if (search) {
      // Find users whose names match the search term
      const users = await User.find({
        fullName: { $regex: search, $options: 'i' },
        role: 'Doctor'
      }).select('_id');
      const userIds = users.map(u => u._id);

      query.$or = [
        { user: { $in: userIds } },
        { hospitalName: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Metadata filters
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (experience) {
      query.experience = { $gte: Number(experience) };
    }
    if (maxFee) {
      query.consultationFee = { $lte: Number(maxFee) };
    }
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }
    if (day) {
      query.availableDays = { $in: [day] };
    }
    if (language) {
      query.languagesSpoken = { $regex: language, $options: 'i' };
    }

    // 3. User properties filter (like Gender)
    if (gender) {
      const usersByGender = await User.find({
        gender: gender,
        role: 'Doctor'
      }).select('_id');
      const genderUserIds = usersByGender.map(u => u._id);
      
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { user: { $in: genderUserIds } }
        ];
        delete query.$or;
      } else {
        query.user = { $in: genderUserIds };
      }
    }

    // 4. Sorting Setup
    let sortBy = { rating: -1 }; // default: highest rated
    if (sort === 'highestRated') {
      sortBy = { rating: -1 };
    } else if (sort === 'lowestFee') {
      sortBy = { consultationFee: 1 };
    } else if (sort === 'mostExperienced') {
      sortBy = { experience: -1 };
    } else if (sort === 'mostBooked') {
      sortBy = { totalAppointments: -1 };
    } else if (sort === 'new') {
      sortBy = { _id: -1 };
    }

    // 5. Pagination Execution
    const skip = (Number(page) - 1) * Number(limit);
    
    const doctors = await Doctor.find(query)
      .populate('user', 'fullName email phoneNumber gender profilePicture address')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));

    const total = await Doctor.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: doctors.length,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
      doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'fullName email phoneNumber gender profilePicture address biography');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Load reviews
    const reviews = await Review.find({ doctor: doctor._id })
      .populate('patient', 'fullName profilePicture')
      .sort({ createdDate: -1 });

    return res.status(200).json({
      success: true,
      doctor,
      reviews
    });
  } catch (error) {
    console.error('Get doctor detail error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
