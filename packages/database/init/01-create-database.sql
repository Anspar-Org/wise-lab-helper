-- Initialize STEM Lab Assistant Database
-- This script runs when the PostgreSQL container first starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'America/Los_Angeles';

-- Database is already created by Docker environment variables
-- This file is for additional initialization if needed

SELECT 'Database initialized successfully' AS status;
