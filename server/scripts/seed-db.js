import 'dotenv/config';
import bcrypt from 'bcrypt';
import { createUser } from '../models/db.js';

const seedDatabase = async () => {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@school.be';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await createUser(adminEmail, passwordHash, 'admin', 'Admin', 'User');
    console.log(`✅ Admin user created: ${adminEmail}`);

    // Create a teacher user
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    await createUser('teacher@school.be', teacherPassword, 'teacher', 'Teacher', 'Demo');
    console.log('✅ Teacher user created: teacher@school.be');

    // Create a student user
    const studentPassword = await bcrypt.hash('student123', 10);
    await createUser('student@school.be', studentPassword, 'student', 'Student', 'Demo');
    console.log('✅ Student user created: student@school.be');

    console.log('\n📋 Login credentials:');
    console.log(`Admin: ${adminEmail} / ${adminPassword}`);
    console.log('Teacher: teacher@school.be / teacher123');
    console.log('Student: student@school.be / student123');
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      console.log('ℹ️  Users already exist, skipping seed.');
    } else {
      throw error;
    }
  }
};

seedDatabase().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
