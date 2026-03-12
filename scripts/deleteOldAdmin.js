const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const deleteOldAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected\n');

    const result = await User.findOneAndDelete({ email: 'admin@itsgoti.com' });

    if (result) {
      console.log('✓ Old admin (admin@itsgoti.com) deleted successfully!');
    } else {
      console.log('Old admin not found (already deleted)');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

deleteOldAdmin();
