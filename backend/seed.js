const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Review = require('./models/Review');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Review.deleteMany({});
    await require('./models/MetricsResult').deleteMany({});
    await require('./models/AIResult').deleteMany({});
    await require('./models/FairnessReport').deleteMany({});
    await require('./models/Notification').deleteMany({});

    // Create users
    const users = await User.create([
      { name: 'Alice Student', email: 'alice@university.edu', passwordHash: 'password123', role: 'student', hostelBlock: 'Block-A' },
      { name: 'Bob Student', email: 'bob@university.edu', passwordHash: 'password123', role: 'student', hostelBlock: 'Block-B' },
      { name: 'Charlie Student', email: 'charlie@university.edu', passwordHash: 'password123', role: 'student', hostelBlock: 'Block-A' },
      { name: 'Diana Student', email: 'diana@university.edu', passwordHash: 'password123', role: 'student', hostelBlock: 'Block-C' },
      { name: 'Eve Student', email: 'eve@university.edu', passwordHash: 'password123', role: 'student', hostelBlock: 'Block-B' },
      { name: 'Mess Admin', email: 'admin@university.edu', passwordHash: 'admin123', role: 'admin', hostelBlock: 'Block-A' },
      { name: 'System Admin', email: 'sysadmin@university.edu', passwordHash: 'sysadmin123', role: 'sysadmin', hostelBlock: 'Block-A' }
    ]);

    console.log(`Created ${users.length} users`);

    // Create sample reviews
    const reviewsData = [
      { userId: users[0]._id, rating: 4, foodQuality: 4, cleanliness: 5, service: 4, comment: 'Good food today, enjoyed the dal and rice.', hostelBlock: 'Block-A', ipAddress: '192.168.1.10' },
      { userId: users[0]._id, rating: 3, foodQuality: 3, cleanliness: 3, service: 3, comment: 'Average meal, nothing special.', hostelBlock: 'Block-A', ipAddress: '192.168.1.10' },
      { userId: users[1]._id, rating: 5, foodQuality: 5, cleanliness: 5, service: 5, comment: 'Excellent mess food today! Best biryani ever.', hostelBlock: 'Block-B', ipAddress: '192.168.1.20' },
      { userId: users[1]._id, rating: 2, foodQuality: 2, cleanliness: 3, service: 2, comment: 'Food was cold and tasteless.', hostelBlock: 'Block-B', ipAddress: '192.168.1.20' },
      { userId: users[2]._id, rating: 1, foodQuality: 1, cleanliness: 1, service: 1, comment: 'Terrible food. Found hair in my plate.', hostelBlock: 'Block-A', ipAddress: '192.168.1.30' },
      { userId: users[2]._id, rating: 4, foodQuality: 4, cleanliness: 4, service: 3, comment: 'Decent lunch today, chapati was fresh.', hostelBlock: 'Block-A', ipAddress: '192.168.1.30' },
      { userId: users[3]._id, rating: 3, foodQuality: 3, cleanliness: 4, service: 3, comment: 'Okay food, but the queue was too long.', hostelBlock: 'Block-C', ipAddress: '192.168.1.40' },
      { userId: users[3]._id, rating: 5, foodQuality: 5, cleanliness: 4, service: 5, comment: 'Special dinner was amazing! Great variety.', hostelBlock: 'Block-C', ipAddress: '192.168.1.40' },
      { userId: users[4]._id, rating: 2, foodQuality: 1, cleanliness: 2, service: 3, comment: 'Sambar was too watery, not enough vegetables.', hostelBlock: 'Block-B', ipAddress: '192.168.1.50' },
      { userId: users[4]._id, rating: 4, foodQuality: 4, cleanliness: 5, service: 4, comment: 'Good hygiene today. Food was warm and tasty.', hostelBlock: 'Block-B', ipAddress: '192.168.1.50' }
    ];

    const reviews = await Review.create(reviewsData);
    console.log(`Created ${reviews.length} reviews`);

    console.log('\n--- Seed Summary ---');
    console.log('Students: alice@university.edu / password123');
    console.log('          bob@university.edu / password123');
    console.log('          charlie@university.edu / password123');
    console.log('          diana@university.edu / password123');
    console.log('          eve@university.edu / password123');
    console.log('Admin:    admin@university.edu / admin123');
    console.log('SysAdmin: sysadmin@university.edu / sysadmin123');
    console.log('--------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedData();
