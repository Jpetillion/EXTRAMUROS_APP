-- Migration: Add student_progress table for tracking student progress
-- This table stores student progress data (completed activities, viewed content, etc.)

CREATE TABLE IF NOT EXISTS student_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  trip_id TEXT NOT NULL,
  progress_data TEXT NOT NULL, -- JSON blob with progress info
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  last_synced_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  UNIQUE(user_id, trip_id)
);

CREATE INDEX IF NOT EXISTS idx_student_progress_user ON student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_trip ON student_progress(trip_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_sync ON student_progress(last_synced_at);
