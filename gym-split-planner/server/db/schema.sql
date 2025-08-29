-- Database schema for Gym Split Planner

DROP TABLE IF EXISTS day_exercises CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;


-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    primary_muscle VARCHAR(100) NOT NULL,
    secondary_muscles TEXT,
    default_sets INTEGER DEFAULT 3,
    default_reps INTEGER DEFAULT 10,
    default_rir INTEGER DEFAULT 0,
    -- Additional fields from comprehensive exercise database
    force_type VARCHAR(50),
    difficulty_level VARCHAR(50),
    mechanic_type VARCHAR(50),
    equipment VARCHAR(100),
    category VARCHAR(100),
    instructions TEXT,
    image_paths TEXT,
    exercise_id VARCHAR(255) UNIQUE
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Days table
CREATE TABLE IF NOT EXISTS days (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
    day_name VARCHAR(50) NOT NULL,
    day_order INTEGER NOT NULL,
    UNIQUE(plan_id, day_name)
);

-- Day exercises table (junction table)
CREATE TABLE IF NOT EXISTS day_exercises (
    id SERIAL PRIMARY KEY,
    day_id INTEGER REFERENCES days(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    rir INTEGER NOT NULL,
    exercise_order INTEGER NOT NULL,
    UNIQUE(day_id, exercise_id, exercise_order)
);

-- Public shares table
CREATE TABLE IF NOT EXISTS public_shares (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_days_plan_id ON days(plan_id);
CREATE INDEX IF NOT EXISTS idx_day_exercises_day_id ON day_exercises(day_id);
CREATE INDEX IF NOT EXISTS idx_day_exercises_exercise_id ON day_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_public_shares_slug ON public_shares(slug); 