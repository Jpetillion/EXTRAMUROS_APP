// Migration: add color column to trip_days table
import db from '../config/database.js';

try {
  await db.execute(`ALTER TABLE trip_days ADD COLUMN color TEXT DEFAULT '#3b82f6'`);
  console.log('✅ color column added to trip_days');
} catch (err) {
  if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
    console.log('ℹ️  color column already exists, skipping');
  } else {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}
