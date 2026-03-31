-- ============================================================
-- EduGame Platform — MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS edugame CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edugame;

-- ── Parents ──────────────────────────────────────────────

CREATE TABLE parents (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Children ─────────────────────────────────────────────

CREATE TABLE children (
  id CHAR(36) PRIMARY KEY,
  parent_id CHAR(36) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  age_tier ENUM('preschool', 'early_elementary', 'upper_elementary') NOT NULL,
  avatar_config JSON DEFAULT NULL,
  xp_total INT NOT NULL DEFAULT 0,
  currency_balance INT NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_active_date DATE DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
);

CREATE INDEX idx_children_parent ON children(parent_id);

-- ── Subjects ─────────────────────────────────────────────

CREATE TABLE subjects (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  icon_url TEXT
);

INSERT INTO subjects (id, slug, name) VALUES
  (UUID(), 'math', 'Mathematics'),
  (UUID(), 'coding-logic', 'Coding & Logic');

-- ── Games ────────────────────────────────────────────────

CREATE TABLE games (
  id CHAR(36) PRIMARY KEY,
  subject_id CHAR(36) NOT NULL,
  age_tier ENUM('preschool', 'early_elementary', 'upper_elementary') NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL DEFAULT (''),
  thumbnail_url TEXT,
  game_type ENUM(
    'counting', 'number_recognition', 'shapes',
    'addition_subtraction', 'multiplication', 'word_problems',
    'fractions', 'algebra',
    'pattern_recognition', 'sequencing', 'sorting',
    'block_sequencing', 'conditionals', 'block_programming',
    'algorithm_challenge', 'debugging'
  ) NOT NULL,
  difficulty_range_min INT NOT NULL DEFAULT 1,
  difficulty_range_max INT NOT NULL DEFAULT 10,
  order_in_map INT NOT NULL DEFAULT 0,
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

CREATE INDEX idx_games_subject ON games(subject_id);

-- ── Questions ────────────────────────────────────────────

CREATE TABLE questions (
  id CHAR(36) PRIMARY KEY,
  game_id CHAR(36) NOT NULL,
  difficulty_level INT NOT NULL CHECK (difficulty_level BETWEEN 1 AND 10),
  question_data JSON NOT NULL,
  correct_answer JSON NOT NULL,
  hints JSON NOT NULL DEFAULT ('[]'),
  explanation TEXT NOT NULL DEFAULT (''),
  xp_reward INT NOT NULL DEFAULT 10,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE INDEX idx_questions_game ON questions(game_id);
CREATE INDEX idx_questions_difficulty ON questions(game_id, difficulty_level);

-- ── Game Sessions ────────────────────────────────────────

CREATE TABLE game_sessions (
  id CHAR(36) PRIMARY KEY,
  child_id CHAR(36) NOT NULL,
  game_id CHAR(36),
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  score INT NOT NULL DEFAULT 0,
  xp_earned INT NOT NULL DEFAULT 0,
  difficulty_level_start FLOAT NOT NULL DEFAULT 1,
  difficulty_level_end FLOAT NOT NULL DEFAULT 1,
  accuracy_pct FLOAT NOT NULL DEFAULT 0,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE INDEX idx_sessions_child ON game_sessions(child_id);
CREATE INDEX idx_sessions_child_date ON game_sessions(child_id, started_at DESC);

-- ── Answers ──────────────────────────────────────────────

CREATE TABLE answers (
  id CHAR(36) PRIMARY KEY,
  session_id CHAR(36) NOT NULL,
  question_id CHAR(36),
  child_answer JSON,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  time_taken_ms INT NOT NULL DEFAULT 0,
  hints_used INT NOT NULL DEFAULT 0,
  answered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE INDEX idx_answers_session ON answers(session_id);

-- ── Difficulty State ─────────────────────────────────────

CREATE TABLE difficulty_state (
  child_id CHAR(36) NOT NULL,
  game_id CHAR(36) NOT NULL,
  current_level FLOAT NOT NULL DEFAULT 1,
  consecutive_correct INT NOT NULL DEFAULT 0,
  consecutive_wrong INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (child_id, game_id),
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- ── XP Ledger ────────────────────────────────────────────

CREATE TABLE xp_ledger (
  id CHAR(36) PRIMARY KEY,
  child_id CHAR(36) NOT NULL,
  amount INT NOT NULL,
  source_type ENUM('game', 'badge', 'streak_bonus', 'daily_login') NOT NULL,
  source_id CHAR(36),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);

CREATE INDEX idx_xp_child ON xp_ledger(child_id);

-- ── Badges ───────────────────────────────────────────────

CREATE TABLE badges (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL DEFAULT (''),
  icon_url TEXT,
  criteria JSON NOT NULL
);

CREATE TABLE child_badges (
  child_id CHAR(36) NOT NULL,
  badge_id CHAR(36) NOT NULL,
  earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (child_id, badge_id),
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id)
);

-- ── Streaks ──────────────────────────────────────────────

CREATE TABLE streaks (
  id CHAR(36) PRIMARY KEY,
  child_id CHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  activity_count INT NOT NULL DEFAULT 1,
  UNIQUE KEY uniq_streak (child_id, `date`),
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);

CREATE INDEX idx_streaks_child ON streaks(child_id, `date` DESC);

-- ── Leaderboard Cache ────────────────────────────────────

CREATE TABLE leaderboard_cache (
  child_id CHAR(36) NOT NULL,
  age_tier ENUM('preschool', 'early_elementary', 'upper_elementary') NOT NULL,
  period ENUM('daily', 'weekly', 'alltime') NOT NULL,
  xp_total INT NOT NULL DEFAULT 0,
  `rank` INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (child_id, period),
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);

-- ── Avatar Items ─────────────────────────────────────────

CREATE TABLE avatar_items (
  id CHAR(36) PRIMARY KEY,
  category ENUM('head', 'body', 'accessory', 'background') NOT NULL,
  name VARCHAR(200) NOT NULL,
  image_url TEXT NOT NULL DEFAULT (''),
  price_currency INT NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE child_inventory (
  child_id CHAR(36) NOT NULL,
  item_id CHAR(36) NOT NULL,
  purchased_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (child_id, item_id),
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES avatar_items(id)
);

-- ── Shop Items ───────────────────────────────────────────

CREATE TABLE shop_items (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL DEFAULT (''),
  category ENUM('head', 'body', 'accessory', 'background') NOT NULL,
  image_url TEXT NOT NULL DEFAULT (''),
  price_currency INT NOT NULL DEFAULT 0,
  available_from TIMESTAMP NULL,
  available_until TIMESTAMP NULL
);

-- ── Adventure Nodes ──────────────────────────────────────

CREATE TABLE adventure_nodes (
  id CHAR(36) PRIMARY KEY,
  subject_id CHAR(36) NOT NULL,
  age_tier ENUM('preschool', 'early_elementary', 'upper_elementary') NOT NULL,
  order_index INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  game_id CHAR(36),
  node_type ENUM('game', 'boss', 'checkpoint', 'reward') NOT NULL,
  xp_requirement INT NOT NULL DEFAULT 0,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE INDEX idx_nodes_subject_tier ON adventure_nodes(subject_id, age_tier);

CREATE TABLE child_adventure_progress (
  child_id CHAR(36) NOT NULL,
  subject_id CHAR(36) NOT NULL,
  current_node_id CHAR(36),
  nodes_completed JSON NOT NULL DEFAULT ('[]'),
  unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (child_id, subject_id),
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (current_node_id) REFERENCES adventure_nodes(id)
);

-- ── Seed Badges ──────────────────────────────────────────

INSERT INTO badges (id, slug, name, description, criteria) VALUES
  (UUID(), 'first_game', 'First Steps', 'Complete your very first game!', '{"type": "first_game"}'),
  (UUID(), 'math_beginner', 'Math Explorer', 'Complete 5 math games', '{"type": "subject_games", "subject": "math", "count": 5}'),
  (UUID(), 'math_whiz', 'Math Whiz', 'Complete 25 math games', '{"type": "subject_games", "subject": "math", "count": 25}'),
  (UUID(), 'coding_beginner', 'Code Explorer', 'Complete 5 coding games', '{"type": "subject_games", "subject": "coding-logic", "count": 5}'),
  (UUID(), 'coding_whiz', 'Code Master', 'Complete 25 coding games', '{"type": "subject_games", "subject": "coding-logic", "count": 25}'),
  (UUID(), 'perfect_score_1', 'Perfect!', 'Get a perfect score in any game', '{"type": "perfect_score", "count": 1}'),
  (UUID(), 'perfect_score_5', 'Perfectionist', 'Get 5 perfect scores', '{"type": "perfect_score", "count": 5}'),
  (UUID(), 'streak_3', 'Getting Warmed Up', 'Play 3 days in a row', '{"type": "streak_days", "count": 3}'),
  (UUID(), 'streak_7', 'Week Warrior', 'Play 7 days in a row', '{"type": "streak_days", "count": 7}'),
  (UUID(), 'streak_30', 'Monthly Champion', 'Play 30 days in a row', '{"type": "streak_days", "count": 30}'),
  (UUID(), 'xp_100', 'Rising Star', 'Earn 100 XP total', '{"type": "xp_total", "threshold": 100}'),
  (UUID(), 'xp_500', 'Shining Star', 'Earn 500 XP total', '{"type": "xp_total", "threshold": 500}'),
  (UUID(), 'xp_1000', 'Superstar', 'Earn 1,000 XP total', '{"type": "xp_total", "threshold": 1000}'),
  (UUID(), 'xp_5000', 'Legend', 'Earn 5,000 XP total', '{"type": "xp_total", "threshold": 5000}'),
  (UUID(), 'accuracy_90', 'Sharp Mind', 'Maintain 90% average accuracy', '{"type": "accuracy_avg", "threshold": 90}'),
  (UUID(), 'ten_games', 'Dedicated Learner', 'Complete 10 games total', '{"type": "games_completed", "count": 10}'),
  (UUID(), 'fifty_games', 'Knowledge Seeker', 'Complete 50 games total', '{"type": "games_completed", "count": 50}'),
  (UUID(), 'hundred_games', 'Grand Scholar', 'Complete 100 games total', '{"type": "games_completed", "count": 100}');

-- ── Seed Default Avatar Items ────────────────────────────

INSERT INTO avatar_items (id, category, name, image_url, price_currency, is_default) VALUES
  (UUID(), 'head', 'Crown', '👑', 0, TRUE),
  (UUID(), 'head', 'Cap', '🧢', 0, TRUE),
  (UUID(), 'body', 'Super Hero', '🦸', 0, TRUE),
  (UUID(), 'body', 'Ninja', '🥷', 0, TRUE),
  (UUID(), 'accessory', 'Backpack', '🎒', 0, TRUE),
  (UUID(), 'background', 'Forest', '🌲', 0, TRUE),
  (UUID(), 'head', 'Wizard Hat', '🧙', 50, FALSE),
  (UUID(), 'accessory', 'Sword', '⚔️', 30, FALSE),
  (UUID(), 'background', 'Space', '🚀', 40, FALSE),
  (UUID(), 'background', 'Ocean', '🌊', 40, FALSE);
