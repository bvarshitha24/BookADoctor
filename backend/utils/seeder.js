import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';

dotenv.config();

const specializations = [
  'General Physician', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic',
  'Pediatrician', 'Gynecologist', 'Psychiatrist', 'ENT Specialist', 'Ophthalmologist',
  'Urologist', 'Gastroenterologist', 'Dentist', 'Pulmonologist', 'Endocrinologist',
  'Oncologist', 'Nephrologist', 'Rheumatologist', 'Surgeon', 'Physiotherapist'
];

const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'];
const hospitals = ['City General Hospital', 'Mercy Medical Center', 'Saint Jude Clinic', 'St. Luke Health', 'Metro Health Hospital'];
const firstNames = ['John', 'Mary', 'Robert', 'Patricia', 'James', 'Jennifer', 'David', 'Elizabeth', 'William', 'Linda', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White'];

const medicalConditions = ['Hypertension', 'Type 2 Diabetes', 'Asthma', 'Seasonal Allergies', 'Mild Anxiety', 'None', 'None', 'None'];
const allergiesList = ['Penicillin', 'Peanuts', 'Sulfa Drugs', 'Pollen', 'Shellfish', 'None', 'None'];
const medicationsList = ['Lisinopril 10mg', 'Metformin 500mg', 'Albuterol Inhaler', 'Cetirizine 10mg', 'None', 'None'];

const diagnosisList = ['Acute Nasopharyngitis', 'Essential Hypertension Checkup', 'Gastroesophageal Reflux Disease', 'Seasonal Allergic Rhinitis', 'Generalized Anxiety Followup', 'Mild Contact Dermatitis'];
const notesList = ['Rest well and drink plenty of fluids.', 'Monitor blood pressure twice daily.', 'Avoid spicy and acidic foods.', 'Take medications consistently as prescribed.', 'Follow up in 2 weeks if symptoms persist.'];

const runSeeder = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book-a-doctor');
    
    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Doctor.deleteMany();
    await Appointment.deleteMany();
    await Review.deleteMany();
    await Notification.deleteMany();

    console.log('Hashing passwords...');
    const salt = await bcrypt.genSalt(10);
    const doctorPassword = await bcrypt.hash('Doctor123!', salt);
    const patientPassword = await bcrypt.hash('Patient123!', salt);
    const adminPassword = await bcrypt.hash('Admin123!', salt);

    // 1. Create Admin
    const adminUser = await User.create({
      fullName: 'System Administrator',
      email: 'admin@bookadoctor.com',
      password: 'Admin123!',
      phoneNumber: '1234567890',
      gender: 'Male',
      dob: new Date('1985-05-15'),
      role: 'Admin',
      isVerified: true
    });
    console.log('Admin user created successfully.');

    // 2. Generate 110 Patients
    console.log('Generating 110 patients...');
    const patientUsersData = [];
    for (let i = 1; i <= 110; i++) {
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      patientUsersData.push({
        fullName: `${fName} ${lName}`,
        email: `patient${i}@bookadoctor.com`,
        password: patientPassword,
        phoneNumber: `98765432${String(i).padStart(2, '0')}`,
        gender: i % 2 === 0 ? 'Female' : 'Male',
        dob: new Date(1960 + Math.floor(Math.random() * 45), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        role: 'Patient',
        isVerified: true,
        bloodGroup: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'][Math.floor(Math.random() * 8)],
        address: {
          street: `${100 + i} Main St`,
          city: cities[Math.floor(Math.random() * cities.length)],
          state: 'State',
          zip: `100${String(i).padStart(2, '0')}`
        },
        medicalHistory: [medicalConditions[Math.floor(Math.random() * medicalConditions.length)]].filter(c => c !== 'None'),
        allergies: [allergiesList[Math.floor(Math.random() * allergiesList.length)]].filter(a => a !== 'None'),
        currentMedications: [medicationsList[Math.floor(Math.random() * medicationsList.length)]].filter(m => m !== 'None'),
        emergencyContact: {
          name: `${lName} Contact`,
          phone: `9999999${String(i).padStart(2, '0')}`,
          relationship: i % 2 === 0 ? 'Spouse' : 'Parent'
        }
      });
    }

    const createdPatients = await User.insertMany(patientUsersData);
    console.log(`${createdPatients.length} patient users inserted.`);

    // 3. Generate 80 Doctors
    console.log('Generating 80 doctors...');
    const doctorUsersData = [];
    for (let i = 1; i <= 80; i++) {
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      doctorUsersData.push({
        fullName: `Dr. ${fName} ${lName}`,
        email: `doctor${i}@bookadoctor.com`,
        password: doctorPassword,
        phoneNumber: `91122233${String(i).padStart(2, '0')}`,
        gender: i % 3 === 0 ? 'Female' : 'Male',
        dob: new Date(1955 + Math.floor(Math.random() * 35), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        role: 'Doctor',
        isVerified: true,
        profilePicture: `https://api.dicebear.com/7.x/adventurer/svg?seed=doctor${i}`
      });
    }

    const createdDoctorUsers = await User.insertMany(doctorUsersData);

    const doctorsData = [];
    for (let i = 0; i < createdDoctorUsers.length; i++) {
      const spec = specializations[i % specializations.length];
      const city = cities[i % cities.length];
      const hosp = hospitals[i % hospitals.length];
      const status = i < 75 ? 'Approved' : 'Pending'; // 5 pending applications for admin approval testing

      doctorsData.push({
        user: createdDoctorUsers[i]._id,
        specialization: spec,
        qualification: ['MBBS', 'MD', 'FACP', 'DNB'][i % 4],
        experience: 5 + Math.floor(Math.random() * 25), // 5-30 years
        consultationFee: 300 + (i % 6) * 200, // 300 to 1300 (INR)
        hospitalName: hosp,
        address: `${500 + i} Medical Pkwy`,
        city: city,
        state: 'State',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTimeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        languagesSpoken: ['English', 'Spanish', 'Hindi'][i % 3] === 'English' ? ['English'] : ['English', ['Spanish', 'Hindi'][i % 3 - 1]],
        licenseNumber: `LIC${100000 + i}`,
        biography: `Experienced specialist dedicated to providing comprehensive and compassionate patient-centered healthcare solutions in the field of ${spec}.`,
        status,
        insuranceAccepted: ['BlueCross', 'UnitedHealthcare', 'Aetna', 'Cigna'].slice(0, (i % 3) + 1)
      });
    }

    const createdDoctors = await Doctor.insertMany(doctorsData);
    console.log(`${createdDoctors.length} doctor profiles inserted (75 Approved, 5 Pending).`);

    // 4. Generate 500+ Appointments
    console.log('Generating 500+ appointments...');
    const approvedDoctors = createdDoctors.filter(d => d.status === 'Approved');
    const appointmentsData = [];
    
    // Distribute appointments over past 60 days and future 30 days
    const statuses = ['Completed', 'Confirmed', 'Cancelled', 'Rescheduled'];
    const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

    for (let i = 1; i <= 520; i++) {
      const patient = createdPatients[i % createdPatients.length];
      const doctor = approvedDoctors[i % approvedDoctors.length];
      
      const appDate = new Date();
      // past appointments (1 to 60 days ago) or future (1 to 20 days ahead)
      const dayOffset = i <= 400 ? -Math.floor(Math.random() * 60) - 1 : Math.floor(Math.random() * 20) + 1;
      appDate.setDate(appDate.getDate() + dayOffset);

      // Determine status based on past vs future date
      let appStatus = 'Confirmed';
      if (dayOffset < 0) {
        // past appointments are mostly completed, some cancelled
        appStatus = Math.random() > 0.15 ? 'Completed' : 'Cancelled';
      } else {
        // future appointments are confirmed or rescheduled
        appStatus = Math.random() > 0.85 ? 'Rescheduled' : 'Confirmed';
      }

      const appTime = times[i % times.length];
      const isOnline = i % 2 === 0;

      const appObj = {
        patient: patient._id,
        doctor: doctor._id,
        appointmentDate: appDate,
        appointmentTime: appTime,
        appointmentType: isOnline ? 'Online' : 'Offline',
        symptoms: ['Fever', 'Dry Cough', 'Back Pain', 'Headache', 'Stomach Cramps', 'Routine checkup'][i % 6],
        notes: 'Simulated checkup appointment.',
        paymentStatus: 'Paid',
        appointmentStatus: appStatus,
        cancellationReason: appStatus === 'Cancelled' ? 'Patient emergency or timing conflict' : undefined,
        meetingLink: isOnline ? `https://meet.jit.si/ShopEZ-Doctor-${doctor._id}-${Date.now()}` : undefined
      };

      // If completed, add digital prescription
      if (appStatus === 'Completed') {
        const diag = diagnosisList[i % diagnosisList.length];
        appObj.prescription = {
          diagnosis: diag,
          medications: [
            { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Three times daily', duration: '5 days' },
            { name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'Once daily (night)', duration: '10 days' }
          ],
          notes: notesList[i % notesList.length],
          dateUploaded: appDate
        };
      }

      appointmentsData.push(appObj);
    }

    const createdAppointments = await Appointment.insertMany(appointmentsData);
    console.log(`${createdAppointments.length} appointments seeded.`);

    // 5. Update Doctors' Total Appointments Counter based on seeded bookings
    console.log('Recalculating doctor appointment counters...');
    for (const doc of approvedDoctors) {
      const count = await Appointment.countDocuments({ doctor: doc._id });
      doc.totalAppointments = count;
      await doc.save();
    }

    // 6. Generate 300+ Reviews for Approved Doctors
    console.log('Generating 300+ reviews...');
    const reviewsData = [];
    const reviewTexts = [
      'Excellent doctor! Very patient and explained everything in detail. Highly recommended.',
      'Professional and thorough consultation. The wait time was minimal.',
      'Friendly staff and clean clinic. Dr. was very empathetic and caring.',
      'Average experience. Consultation felt a bit rushed, but the diagnosis was accurate.',
      'Very knowledgeable and took the time to answer all my questions.',
      'Highly professional! Detailed prescription and clear guidelines for recovery.',
      'Great bedside manner. I felt extremely comfortable sharing my concerns.'
    ];

    for (let i = 1; i <= 310; i++) {
      // Find a completed appointment to match patient-doctor pairing
      const app = createdAppointments.find(
        (a, index) => a.appointmentStatus === 'Completed' && index >= i && index < i + 50
      ) || createdAppointments[i % createdAppointments.length];

      reviewsData.push({
        doctor: app.doctor,
        patient: app.patient,
        rating: 3 + (i % 3), // ratings of 3, 4, or 5
        review: reviewTexts[i % reviewTexts.length],
        createdDate: new Date()
      });
    }

    await Review.insertMany(reviewsData);
    console.log('Reviews seeded successfully.');

    // 7. Recalculate and update doctor aggregate rating metrics
    console.log('Recalculating doctor average ratings...');
    for (const doc of approvedDoctors) {
      const docReviews = await Review.find({ doctor: doc._id });
      if (docReviews.length > 0) {
        const reviewsCount = docReviews.length;
        const avg = docReviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount;
        doc.rating = parseFloat(avg.toFixed(1));
        doc.reviewsCount = reviewsCount;
        await doc.save();
      }
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

runSeeder();
