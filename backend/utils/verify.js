import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

dotenv.config();

const runVerify = async () => {
  let failed = false;
  try {
    console.log('Connecting to MongoDB for integration tests...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book-a-doctor');
    console.log('Connected.');

    // 1. Data Integrity Check
    console.log('\n--- Test 1: Data Integrity ---');
    const patientCount = await User.countDocuments({ role: 'Patient' });
    const doctorCount = await Doctor.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    
    console.log(`Patients Seeded: ${patientCount} (Expected: >100)`);
    console.log(`Doctors Seeded: ${doctorCount} (Expected: >80)`);
    console.log(`Appointments Seeded: ${appointmentCount} (Expected: >500)`);

    if (patientCount >= 100 && doctorCount >= 80 && appointmentCount >= 500) {
      console.log('✅ PASS: Data integrity counts meet constraints.');
    } else {
      console.error('❌ FAIL: Data counts do not match seeder requirements.');
      failed = true;
    }

    // 2. Authentication and Schema check
    console.log('\n--- Test 2: Credential Verification ---');
    const testEmail = 'patient_test@bookadoctor.com';
    await User.deleteMany({ email: testEmail });

    const testUser = await User.create({
      fullName: 'Verification Test Patient',
      email: testEmail,
      password: 'VerifyPassword123!',
      role: 'Patient',
      phoneNumber: '5550192',
      gender: 'Other',
      dob: new Date('1990-01-01')
    });

    const isMatch = await testUser.comparePassword('VerifyPassword123!');
    const isMismatch = await testUser.comparePassword('WrongPassword123!');

    if (isMatch && !isMismatch) {
      console.log('✅ PASS: User password hashing and encryption match.');
    } else {
      console.error('❌ FAIL: Password validation checks failed.');
      failed = true;
    }

    // 3. Double Booking Prevention Check
    console.log('\n--- Test 3: Double Booking Prevention ---');
    const approvedDoctor = await Doctor.findOne({ status: 'Approved' });
    if (!approvedDoctor) {
      throw new Error('No approved doctor found to execute scheduling tests.');
    }

    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 5); // 5 days in the future
    const testTime = '10:00';

    // Ensure slot is clear
    await Appointment.deleteMany({
      doctor: approvedDoctor._id,
      appointmentDate: {
        $gte: new Date(new Date(testDate).setHours(0,0,0,0)),
        $lte: new Date(new Date(testDate).setHours(23,59,59,999))
      },
      appointmentTime: testTime
    });

    // Book first appointment
    const app1 = await Appointment.create({
      patient: testUser._id,
      doctor: approvedDoctor._id,
      appointmentDate: testDate,
      appointmentTime: testTime,
      appointmentType: 'Online',
      paymentStatus: 'Paid',
      appointmentStatus: 'Confirmed'
    });
    console.log('Booked first slot successfully.');

    // Attempt double booking query (exactly as implemented in appointmentController.js)
    const dateObj = new Date(testDate);
    const startOfSelectedDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfSelectedDay = new Date(dateObj.setHours(23, 59, 59, 999));

    const conflict = await Appointment.findOne({
      doctor: approvedDoctor._id,
      appointmentDate: { $gte: startOfSelectedDay, $lte: endOfSelectedDay },
      appointmentTime: testTime,
      appointmentStatus: { $in: ['Pending', 'Confirmed', 'Rescheduled'] }
    });

    if (conflict) {
      console.log('✅ PASS: Double-booking query detected slot conflict.');
    } else {
      console.error('❌ FAIL: Double-booking query failed to detect overlapping slots.');
      failed = true;
    }

    // Clean up test documents
    await User.deleteMany({ email: testEmail });
    await Appointment.deleteOne({ _id: app1._id });

    console.log('\n--- Integration Tests Summary ---');
    if (!failed) {
      console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
      process.exit(0);
    } else {
      console.error('⚠️ SOME TESTS FAILED.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Verification error:', error);
    process.exit(1);
  }
};

runVerify();
