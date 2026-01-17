import 'dotenv/config';
import db from '../config/database.js';

const addMfaFields = async () => {
  console.log('🔐 Adding MFA fields to users table...');

  try {
    // Add mfa_enabled column
    await db.execute(`
      ALTER TABLE users ADD COLUMN mfa_enabled INTEGER NOT NULL DEFAULT 0
    `);
    console.log('✅ Added mfa_enabled column');

    // Add mfa_secret column (will store encrypted base32 secret)
    await db.execute(`
      ALTER TABLE users ADD COLUMN mfa_secret TEXT
    `);
    console.log('✅ Added mfa_secret column');

    // Add mfa_backup_codes column (will store JSON array of hashed codes)
    await db.execute(`
      ALTER TABLE users ADD COLUMN mfa_backup_codes TEXT
    `);
    console.log('✅ Added mfa_backup_codes column');

    console.log('\n✅ MFA fields added successfully!');
    console.log('');
    console.log('📝 Note: mfa_enabled=0 by default (disabled for all users)');
    console.log('   Admin/Teacher users can enable 2FA via the admin panel.');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️  MFA fields already exist, skipping migration.');
    } else {
      throw error;
    }
  }
};

addMfaFields().catch((error) => {
  console.error('❌ Error adding MFA fields:', error);
  process.exit(1);
});
