const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/StoreX';

async function resetPassword() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const hash = await bcrypt.hash('Admin@123', 12);

    const result = await db.collection('users').updateOne(
      { email: 'admin@StoreX.com' },
      { $set: { password: hash } }
    );

    if (result.modifiedCount > 0) {
      console.log('Password reset successfully for admin@StoreX.com');
    } else {
      console.log('User admin@StoreX.com not found. Checking existing users...');
      const users = await db.collection('users').find({}).project({ email: 1, role: 1 }).toArray();
      console.log('Users in database:', JSON.stringify(users, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetPassword();