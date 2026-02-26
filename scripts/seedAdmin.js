const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

// Default credentials - Add your new users here
const USERS = [
  {
    name: 'Admin',
    email: 'admin@itsgoti.in',
    password: 'Admin@123',
    role: 'admin',
  },
  // Add new user below:
  {
    name: 'New Admin',
    email: 'newadmin@example.com',
    password: 'NewAdmin@123',
    role: 'admin',
  },
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected\n');

    for (const userData of USERS) {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`✓ ${userData.role.toUpperCase()} already exists: ${existingUser.email}`);
      } else {
        await User.create(userData);
        console.log('----------------------------');
        console.log(`${userData.role.toUpperCase()} created successfully!`);
        console.log('Email:', userData.email);
        console.log('Password:', userData.password);
        console.log('----------------------------');
      }
    }

    console.log('\nPlease change passwords after first login!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

seedUsers();
