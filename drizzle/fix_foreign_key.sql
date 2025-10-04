-- Disable foreign keys temporarily
PRAGMA foreign_keys=off;

-- Create new table without foreign key on user_profile
CREATE TABLE user_profile_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  age INTEGER,
  height_feet INTEGER,
  height_inches INTEGER,
  weight INTEGER,
  profile_photo TEXT,
  fertility_goal TEXT,
  smoking TEXT,
  alcohol TEXT,
  exercise TEXT,
  diet_quality TEXT,
  sleep_hours REAL,
  stress_level TEXT,
  masturbation_frequency TEXT,
  sexual_activity TEXT,
  supplements TEXT,
  career_status TEXT,
  family_pledge TEXT,
  tight_clothing INTEGER DEFAULT 0,
  hot_baths INTEGER DEFAULT 0,
  onboarding_completed INTEGER DEFAULT 0 NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Copy data from old table
INSERT INTO user_profile_new SELECT * FROM user_profile;

-- Drop old table
DROP TABLE user_profile;

-- Rename new table
ALTER TABLE user_profile_new RENAME TO user_profile;

-- Re-enable foreign keys
PRAGMA foreign_keys=on;
