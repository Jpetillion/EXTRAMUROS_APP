import 'dotenv/config';
import db from '../config/database.js';

const migrate = async () => {
  console.log('🔄 Running student_locations migration...');

  try {
    // Create student_locations table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS student_locations (
        id TEXT PRIMARY KEY,
        trip_id TEXT NOT NULL,
        student_username TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        accuracy REAL,
        last_updated INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        UNIQUE(trip_id, student_username)
      )
    `);

    // Create indexes
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_student_locations_trip_id ON student_locations(trip_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_student_locations_updated ON student_locations(last_updated)`);

    console.log('✅ student_locations table created successfully!');
    console.log('');
    console.log('You can now use location tracking features.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
