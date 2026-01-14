import 'dotenv/config';
import db from '../config/database.js';

const migrateTeachers = async () => {
  console.log('🔄 Starting teacher migration...');

  try {
    // Step 1: Check if users table has phone_number column
    console.log('Checking users table schema...');
    const tableInfo = await db.execute({
      sql: 'PRAGMA table_info(users)',
      args: []
    });

    const hasPhoneNumber = tableInfo.rows.some(row => row.name === 'phone_number');

    if (!hasPhoneNumber) {
      console.log('Adding phone_number column to users table...');
      await db.execute({
        sql: 'ALTER TABLE users ADD COLUMN phone_number TEXT',
        args: []
      });
      console.log('✅ Added phone_number column');
    } else {
      console.log('✅ phone_number column already exists');
    }

    // Step 2: Create trip_teachers table (many-to-many with visibility settings)
    console.log('Creating trip_teachers table...');
    await db.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS trip_teachers (
          id TEXT PRIMARY KEY,
          trip_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          show_phone INTEGER NOT NULL DEFAULT 0,
          show_email INTEGER NOT NULL DEFAULT 0,
          order_index INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(trip_id, user_id)
        )
      `,
      args: []
    });
    console.log('✅ trip_teachers table created');

    // Step 3: Create indexes for performance
    console.log('Creating indexes...');
    await db.execute({
      sql: 'CREATE INDEX IF NOT EXISTS idx_trip_teachers_trip_id ON trip_teachers(trip_id)',
      args: []
    });

    await db.execute({
      sql: 'CREATE INDEX IF NOT EXISTS idx_trip_teachers_user_id ON trip_teachers(user_id)',
      args: []
    });

    await db.execute({
      sql: 'CREATE INDEX IF NOT EXISTS idx_trip_teachers_order ON trip_teachers(trip_id, order_index)',
      args: []
    });

    console.log('✅ Indexes created');

    console.log('');
    console.log('✨ Migration completed successfully!');
    console.log('');
    console.log('Summary:');
    console.log('- Added phone_number column to users table (if not exists)');
    console.log('- Created trip_teachers table for assigning teachers to trips');
    console.log('- Created indexes for performance');
    console.log('');
    console.log('Teachers can now be assigned to trips with visibility controls for:');
    console.log('  - Name (always visible)');
    console.log('  - Phone number (optional)');
    console.log('  - Email (optional)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateTeachers().then(() => {
  console.log('Migration script finished');
  process.exit(0);
});
