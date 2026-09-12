-- ==============================================================================
-- P2P Student Micro-Lending Network
-- Software Engineering Lab (BCSE301P)
-- Database: PostgreSQL (Supabase Compatible)
-- ==============================================================================

-- Drop tables if re-running
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS karma_txns CASCADE;
DROP TABLE IF EXISTS exchanges CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS user_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS otps CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    year INT DEFAULT 1,
    contact_info VARCHAR(255),
    karma_balance INT DEFAULT 50,
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'warned', 'suspended'))
);

-- 2. SKILLS TABLE
CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL
);

-- 3. USER_SKILLS (M:N)
CREATE TABLE user_skills (
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(skill_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, skill_id)
);

-- 4. ITEMS TABLE
CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    condition VARCHAR(100) DEFAULT 'Good',
    available_from DATE,
    available_to DATE,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'borrowed'))
);

-- 5. REQUESTS TABLE
CREATE TABLE requests (
    request_id SERIAL PRIMARY KEY,
    requester_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Academic', 'Project', 'Item')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    preferred_mode VARCHAR(50) DEFAULT 'in-person' CHECK (preferred_mode IN ('in-person', 'online')),
    campus_location VARCHAR(255),
    return_date DATE,
    skills_required VARCHAR(255),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled', 'flagged')),
    created_date DATE DEFAULT CURRENT_DATE
);

-- 6. OFFERS TABLE
CREATE TABLE offers (
    offer_id SERIAL PRIMARY KEY,
    request_id INT REFERENCES requests(request_id) ON DELETE CASCADE,
    helper_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    offer_date DATE DEFAULT CURRENT_DATE
);

-- 7. EXCHANGES TABLE
CREATE TABLE exchanges (
    exchange_id SERIAL PRIMARY KEY,
    request_id INT REFERENCES requests(request_id) ON DELETE CASCADE,
    requester_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    helper_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    due_date DATE,
    completion_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'disputed'))
);

-- 8. KARMA_TXNS TABLE (timestamp removed as requested)
CREATE TABLE karma_txns (
    txn_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    exchange_id INT REFERENCES exchanges(exchange_id) ON DELETE SET NULL,
    amount INT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('signup_bonus', 'help_provided', 'request_fulfilled', 'admin_adjustment'))
);

-- 9. RATINGS TABLE
CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    exchange_id INT REFERENCES exchanges(exchange_id) ON DELETE CASCADE,
    rater_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    rated_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT
);

-- 10. REPORTS TABLE
CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    reported_by_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    reported_user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'warned', 'suspended', 'dismissed')),
    created_date DATE DEFAULT CURRENT_DATE
);

-- 11. OTPS TABLE (Campus Verification)
CREATE TABLE otps (
    otp_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL
);

-- Indexes for fast query performance
CREATE INDEX idx_requests_category ON requests(category);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_offers_request ON offers(request_id);
CREATE INDEX idx_exchanges_status ON exchanges(status);
CREATE INDEX idx_karma_user ON karma_txns(user_id);
CREATE INDEX idx_ratings_rated ON ratings(rated_id);
