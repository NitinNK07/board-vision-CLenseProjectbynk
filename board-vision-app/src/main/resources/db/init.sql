-- =====================================================
-- CLens Chess Database Initialization Script
-- Database: PostgreSQL
-- =====================================================

-- Create database (run this separately as postgres superuser)
-- CREATE DATABASE clens_chess_db;

-- Connect to the database
-- \c clens_chess_db

-- =====================================================
-- EXTENSIONS (PostgreSQL specific)
-- =====================================================
-- Enable UUID extension (if needed in future)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================
-- User roles
DO $$ BEGIN
    CREATE TYPE role_enum AS ENUM ('PLAYER', 'ARBITER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Game source
DO $$ BEGIN
    CREATE TYPE source_enum AS ENUM ('SCAN', 'UPLOAD', 'IMPORT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- TABLES
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_number VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    role role_enum DEFAULT 'PLAYER',
    
    -- Trial configuration
    trial_start DATE,
    trial_days INTEGER DEFAULT 2,
    trial_daily_limit INTEGER DEFAULT 3,
    trial_counter_day DATE,
    trial_used_today INTEGER DEFAULT 0,
    
    -- Scan credits
    ad_scan_credits INTEGER DEFAULT 0,
    paid_scan_credits INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_trial_days_positive CHECK (trial_days >= 0),
    CONSTRAINT chk_trial_daily_limit_positive CHECK (trial_daily_limit >= 0),
    CONSTRAINT chk_trial_used_today_non_negative CHECK (trial_used_today >= 0),
    CONSTRAINT chk_ad_scan_credits_non_negative CHECK (ad_scan_credits >= 0),
    CONSTRAINT chk_paid_scan_credits_non_negative CHECK (paid_scan_credits >= 0)
);

-- Chess games table
CREATE TABLE IF NOT EXISTS chess_games (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Player information
    white_player VARCHAR(100),
    black_player VARCHAR(100),
    
    -- Game content
    pgn_content TEXT NOT NULL,
    
    -- Tournament information
    event VARCHAR(200),
    site VARCHAR(200),
    round VARCHAR(50),
    tournament_name VARCHAR(200),
    
    -- Game metadata
    game_date DATE,
    result VARCHAR(10),
    white_elo INTEGER,
    black_elo INTEGER,
    eco VARCHAR(10),
    opening VARCHAR(200),
    time_control VARCHAR(50),
    termination VARCHAR(100),
    total_moves INTEGER,
    
    -- Source and visibility
    source source_enum DEFAULT 'SCAN',
    is_public BOOLEAN DEFAULT FALSE,
    is_tournament BOOLEAN DEFAULT FALSE,
    
    -- Original image (if scanned)
    original_image_url VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_white_elo_positive CHECK (white_elo IS NULL OR white_elo > 0),
    CONSTRAINT chk_black_elo_positive CHECK (black_elo IS NULL OR black_elo > 0),
    CONSTRAINT chk_total_moves_positive CHECK (total_moves IS NULL OR total_moves > 0),
    CONSTRAINT chk_result_valid CHECK (result IN ('1-0', '0-1', '1/2-1/2', '*'))
);

-- Game analysis table
CREATE TABLE IF NOT EXISTS game_analysis (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT UNIQUE NOT NULL REFERENCES chess_games(id) ON DELETE CASCADE,
    
    -- Accuracy metrics
    accuracy_white DOUBLE PRECISION,
    accuracy_black DOUBLE PRECISION,
    
    -- Move quality
    best_moves_white INTEGER DEFAULT 0,
    best_moves_black INTEGER DEFAULT 0,
    blunders_white INTEGER DEFAULT 0,
    blunders_black INTEGER DEFAULT 0,
    mistakes_white INTEGER DEFAULT 0,
    mistakes_black INTEGER DEFAULT 0,
    inaccuracies_white INTEGER DEFAULT 0,
    inaccuracies_black INTEGER DEFAULT 0,
    
    -- Detailed analysis data (JSON format)
    evaluation_data TEXT,
    best_line VARCHAR(1000),
    
    -- Timestamp
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_accuracy_white_range CHECK (accuracy_white IS NULL OR (accuracy_white >= 0 AND accuracy_white <= 100)),
    CONSTRAINT chk_accuracy_black_range CHECK (accuracy_black IS NULL OR (accuracy_black >= 0 AND accuracy_black <= 100)),
    CONSTRAINT chk_best_moves_non_negative CHECK (best_moves_white >= 0 AND best_moves_black >= 0),
    CONSTRAINT chk_blunders_non_negative CHECK (blunders_white >= 0 AND blunders_black >= 0),
    CONSTRAINT chk_mistakes_non_negative CHECK (mistakes_white >= 0 AND mistakes_black >= 0),
    CONSTRAINT chk_inaccuracies_non_negative CHECK (inaccuracies_white >= 0 AND inaccuracies_black >= 0)
);

-- Player statistics table
CREATE TABLE IF NOT EXISTS player_statistics (
    id BIGSERIAL PRIMARY KEY,
    player_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Overall stats
    total_games INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    win_rate DOUBLE PRECISION DEFAULT 0.0,
    
    -- White piece stats
    games_as_white INTEGER DEFAULT 0,
    wins_as_white INTEGER DEFAULT 0,
    win_rate_as_white DOUBLE PRECISION DEFAULT 0.0,
    
    -- Black piece stats
    games_as_black INTEGER DEFAULT 0,
    wins_as_black INTEGER DEFAULT 0,
    win_rate_as_black DOUBLE PRECISION DEFAULT 0.0,
    
    -- Performance metrics
    average_accuracy DOUBLE PRECISION DEFAULT 0.0,
    average_blunders_per_game DOUBLE PRECISION DEFAULT 0.0,
    average_mistakes_per_game DOUBLE PRECISION DEFAULT 0.0,
    
    -- Opening repertoire
    most_played_opening VARCHAR(200),
    most_played_eco VARCHAR(10),
    best_opening VARCHAR(200),
    
    -- Form tracking
    recent_form VARCHAR(20), -- e.g., "WWLDW"
    current_streak INTEGER DEFAULT 0,
    longest_win_streak INTEGER DEFAULT 0,
    
    -- Last activity
    last_game_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_total_games_non_negative CHECK (total_games >= 0),
    CONSTRAINT chk_wins_non_negative CHECK (wins >= 0),
    CONSTRAINT chk_losses_non_negative CHECK (losses >= 0),
    CONSTRAINT chk_draws_non_negative CHECK (draws >= 0),
    CONSTRAINT chk_win_rate_range CHECK (win_rate >= 0 AND win_rate <= 100),
    CONSTRAINT chk_streak_non_negative CHECK (current_streak >= 0 AND longest_win_streak >= 0)
);

-- OTP table
CREATE TABLE IF NOT EXISTS otp_codes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    otp_code VARCHAR(6) NOT NULL,
    otp_type VARCHAR(20) NOT NULL, -- 'EMAIL', 'PHONE', 'PASSWORD_RESET'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    
    -- Constraints
    CONSTRAINT chk_otp_not_expired CHECK (expires_at > CURRENT_TIMESTAMP)
);

-- =====================================================
-- INDEXES (for performance optimization)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_chess_games_user_id ON chess_games(user_id);
CREATE INDEX IF NOT EXISTS idx_chess_games_result ON chess_games(result);
CREATE INDEX IF NOT EXISTS idx_chess_games_eco ON chess_games(eco);
CREATE INDEX IF NOT EXISTS idx_chess_games_opening ON chess_games(opening);
CREATE INDEX IF NOT EXISTS idx_chess_games_game_date ON chess_games(game_date);
CREATE INDEX IF NOT EXISTS idx_chess_games_is_public ON chess_games(is_public);
CREATE INDEX IF NOT EXISTS idx_game_analysis_game_id ON game_analysis(game_id);
CREATE INDEX IF NOT EXISTS idx_player_statistics_player_id ON player_statistics(player_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Full-text search indexes for PGN content
CREATE INDEX IF NOT EXISTS idx_chess_games_pgn_content_fts ON chess_games USING gin(to_tsvector('english', pgn_content));
CREATE INDEX IF NOT EXISTS idx_chess_games_opening_fts ON chess_games USING gin(to_tsvector('english', opening));

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp for chess_games
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_chess_games_updated_at ON chess_games;
CREATE TRIGGER update_chess_games_updated_at
    BEFORE UPDATE ON chess_games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at timestamp for player_statistics
DROP TRIGGER IF EXISTS update_player_statistics_updated_at ON player_statistics;
CREATE TRIGGER update_player_statistics_updated_at
    BEFORE UPDATE ON player_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE users IS 'Stores user accounts with trial and credit information';
COMMENT ON TABLE chess_games IS 'Stores chess games from scans, uploads, and imports';
COMMENT ON TABLE game_analysis IS 'Stores Stockfish analysis for each game';
COMMENT ON TABLE player_statistics IS 'Aggregated statistics for each player';
COMMENT ON TABLE otp_codes IS 'Stores OTP codes for email/phone verification';

COMMENT ON COLUMN chess_games.pgn_content IS 'Portable Game Notation - standard chess game format';
COMMENT ON COLUMN chess_games.eco IS 'Encyclopedia of Chess Openings code (A00-E99)';
COMMENT ON COLUMN chess_games.source IS 'How the game was added: SCAN (OCR), UPLOAD (file), IMPORT (PGN import)';
COMMENT ON COLUMN game_analysis.evaluation_data IS 'JSON containing detailed move-by-move analysis';
COMMENT ON COLUMN player_statistics.recent_form IS 'Last 10 game results: W=Win, L=Loss, D=Draw';

-- =====================================================
-- INITIAL DATA (Optional - for testing)
-- =====================================================
-- This section is intentionally left empty
-- Users should be created through the signup API

-- =====================================================
-- END OF SCRIPT
-- =====================================================
