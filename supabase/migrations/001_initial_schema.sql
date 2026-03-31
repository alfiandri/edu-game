-- ============================================================
-- EduGame Platform — Initial Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── Enums ────────────────────────────────────────────────

CREATE TYPE age_tier AS ENUM ('preschool', 'early_elementary', 'upper_elementary');
CREATE TYPE game_type AS ENUM (
  'counting', 'number_recognition', 'shapes',
  'addition_subtraction', 'multiplication', 'word_problems',
  'fractions', 'algebra',
  'pattern_recognition', 'sequencing', 'sorting',
  'block_sequencing', 'conditionals', 'block_programming',
  'algorithm_challenge', 'debugging'
);
CREATE TYPE node_type AS ENUM ('game', 'boss', 'checkpoint', 'reward');
CREATE TYPE xp_source_type AS ENUM ('game', 'badge', 'streak_bonus', 'daily_login');
CREATE TYPE avatar_category AS ENUM ('head', 'body', 'accessory', 'background');
CREATE TYPE leaderboard_period AS ENUM ('daily', 'weekly', 'alltime');

-- ── Parents ──────────────────────────────────────────────

CREATE TABLE parents (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view own row" ON parents FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Parents can insert own row" ON parents FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Parents can update own row" ON parents FOR UPDATE USING (auth.uid() = id);

-- ── Children ─────────────────────────────────────────────

CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age_tier age_tier NOT NULL,
  avatar_config JSONB DEFAULT NULL,
  xp_total INTEGER NOT NULL DEFAULT 0,
  currency_balance INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_children_parent ON children(parent_id);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can manage own children" ON children FOR ALL
  USING (parent_id = auth.uid());

-- ── Subjects ─────────────────────────────────────────────

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon_url TEXT
);

INSERT INTO subjects (slug, name) VALUES
  ('math', 'Mathematics'),
  ('coding-logic', 'Coding & Logic');

-- ── Games ────────────────────────────────────────────────

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  age_tier age_tier NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT,
  game_type game_type NOT NULL,
  difficulty_range_min INTEGER NOT NULL DEFAULT 1,
  difficulty_range_max INTEGER NOT NULL DEFAULT 10,
  order_in_map INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_games_subject ON games(subject_id);

-- ── Questions ────────────────────────────────────────────

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 10),
  question_data JSONB NOT NULL,
  correct_answer JSONB NOT NULL,
  hints JSONB NOT NULL DEFAULT '[]',
  explanation TEXT NOT NULL DEFAULT '',
  xp_reward INTEGER NOT NULL DEFAULT 10
);

CREATE INDEX idx_questions_game ON questions(game_id);
CREATE INDEX idx_questions_difficulty ON questions(game_id, difficulty_level);

-- ── Game Sessions ────────────────────────────────────────

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  score INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  difficulty_level_start REAL NOT NULL DEFAULT 1,
  difficulty_level_end REAL NOT NULL DEFAULT 1,
  accuracy_pct REAL NOT NULL DEFAULT 0
);

CREATE INDEX idx_sessions_child ON game_sessions(child_id);
CREATE INDEX idx_sessions_child_date ON game_sessions(child_id, started_at DESC);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view child sessions" ON game_sessions FOR SELECT
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
CREATE POLICY "Sessions can be inserted for own children" ON game_sessions FOR INSERT
  WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- ── Answers ──────────────────────────────────────────────

CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  child_answer JSONB,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  time_taken_ms INTEGER NOT NULL DEFAULT 0,
  hints_used INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_answers_session ON answers(session_id);

ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view child answers" ON answers FOR SELECT
  USING (session_id IN (
    SELECT gs.id FROM game_sessions gs
    JOIN children c ON gs.child_id = c.id
    WHERE c.parent_id = auth.uid()
  ));
CREATE POLICY "Answers can be inserted for own children" ON answers FOR INSERT
  WITH CHECK (session_id IN (
    SELECT gs.id FROM game_sessions gs
    JOIN children c ON gs.child_id = c.id
    WHERE c.parent_id = auth.uid()
  ));

-- ── Difficulty State ─────────────────────────────────────

CREATE TABLE difficulty_state (
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  current_level REAL NOT NULL DEFAULT 1,
  consecutive_correct INTEGER NOT NULL DEFAULT 0,
  consecutive_wrong INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (child_id, game_id)
);

ALTER TABLE difficulty_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Difficulty state for own children" ON difficulty_state FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- ── XP Ledger ────────────────────────────────────────────

CREATE TABLE xp_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source_type xp_source_type NOT NULL,
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_child ON xp_ledger(child_id);

ALTER TABLE xp_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "XP ledger for own children" ON xp_ledger FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- ── Badges ───────────────────────────────────────────────

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_url TEXT,
  criteria JSONB NOT NULL
);

CREATE TABLE child_badges (
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (child_id, badge_id)
);

ALTER TABLE child_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Child badges for own children" ON child_badges FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- ── Streaks ──────────────────────────────────────────────

CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  activity_count INTEGER NOT NULL DEFAULT 1,
  UNIQUE (child_id, date)
);

CREATE INDEX idx_streaks_child ON streaks(child_id, date DESC);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Streaks for own children" ON streaks FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- ── Leaderboard Cache ────────────────────────────────────

CREATE TABLE leaderboard_cache (
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  age_tier age_tier NOT NULL,
  period leaderboard_period NOT NULL,
  xp_total INTEGER NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (child_id, period)
);

ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaderboard is publicly readable" ON leaderboard_cache FOR SELECT
  USING (true);

-- ── Avatar Items ─────────────────────────────────────────

CREATE TABLE avatar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category avatar_category NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  price_currency INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE child_inventory (
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES avatar_items(id),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (child_id, item_id)
);

ALTER TABLE child_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory for own children" ON child_inventory FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- ── Shop Items ───────────────────────────────────────────

CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category avatar_category NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  price_currency INTEGER NOT NULL DEFAULT 0,
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ
);

-- ── Adventure Nodes ──────────────────────────────────────

CREATE TABLE adventure_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  age_tier age_tier NOT NULL,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  game_id UUID REFERENCES games(id),
  node_type node_type NOT NULL,
  xp_requirement INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_nodes_subject_tier ON adventure_nodes(subject_id, age_tier);

CREATE TABLE child_adventure_progress (
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id),
  current_node_id UUID REFERENCES adventure_nodes(id),
  nodes_completed UUID[] NOT NULL DEFAULT '{}',
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (child_id, subject_id)
);

ALTER TABLE child_adventure_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Adventure progress for own children" ON child_adventure_progress FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- ── Seed Badges ──────────────────────────────────────────

INSERT INTO badges (slug, name, description, criteria) VALUES
  ('first_game', 'First Steps', 'Complete your very first game!', '{"type": "first_game"}'::jsonb),
  ('math_beginner', 'Math Explorer', 'Complete 5 math games', '{"type": "subject_games", "subject": "math", "count": 5}'::jsonb),
  ('math_whiz', 'Math Whiz', 'Complete 25 math games', '{"type": "subject_games", "subject": "math", "count": 25}'::jsonb),
  ('coding_beginner', 'Code Explorer', 'Complete 5 coding games', '{"type": "subject_games", "subject": "coding-logic", "count": 5}'::jsonb),
  ('coding_whiz', 'Code Master', 'Complete 25 coding games', '{"type": "subject_games", "subject": "coding-logic", "count": 25}'::jsonb),
  ('perfect_score_1', 'Perfect!', 'Get a perfect score in any game', '{"type": "perfect_score", "count": 1}'::jsonb),
  ('perfect_score_5', 'Perfectionist', 'Get 5 perfect scores', '{"type": "perfect_score", "count": 5}'::jsonb),
  ('streak_3', 'Getting Warmed Up', 'Play 3 days in a row', '{"type": "streak_days", "count": 3}'::jsonb),
  ('streak_7', 'Week Warrior', 'Play 7 days in a row', '{"type": "streak_days", "count": 7}'::jsonb),
  ('streak_30', 'Monthly Champion', 'Play 30 days in a row', '{"type": "streak_days", "count": 30}'::jsonb),
  ('xp_100', 'Rising Star', 'Earn 100 XP total', '{"type": "xp_total", "threshold": 100}'::jsonb),
  ('xp_500', 'Shining Star', 'Earn 500 XP total', '{"type": "xp_total", "threshold": 500}'::jsonb),
  ('xp_1000', 'Superstar', 'Earn 1,000 XP total', '{"type": "xp_total", "threshold": 1000}'::jsonb),
  ('xp_5000', 'Legend', 'Earn 5,000 XP total', '{"type": "xp_total", "threshold": 5000}'::jsonb),
  ('accuracy_90', 'Sharp Mind', 'Maintain 90% average accuracy', '{"type": "accuracy_avg", "threshold": 90}'::jsonb),
  ('ten_games', 'Dedicated Learner', 'Complete 10 games total', '{"type": "games_completed", "count": 10}'::jsonb),
  ('fifty_games', 'Knowledge Seeker', 'Complete 50 games total', '{"type": "games_completed", "count": 50}'::jsonb),
  ('hundred_games', 'Grand Scholar', 'Complete 100 games total', '{"type": "games_completed", "count": 100}'::jsonb);

-- ── Seed Default Avatar Items ────────────────────────────

INSERT INTO avatar_items (category, name, image_url, price_currency, is_default) VALUES
  ('head', 'Crown', '👑', 0, true),
  ('head', 'Cap', '🧢', 0, true),
  ('body', 'Super Hero', '🦸', 0, true),
  ('body', 'Ninja', '🥷', 0, true),
  ('accessory', 'Backpack', '🎒', 0, true),
  ('background', 'Forest', '🌲', 0, true),
  ('head', 'Wizard Hat', '🧙', 50, false),
  ('accessory', 'Sword', '⚔️', 30, false),
  ('background', 'Space', '🚀', 40, false),
  ('background', 'Ocean', '🌊', 40, false);
