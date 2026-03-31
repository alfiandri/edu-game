import { z } from "zod";

// ── Enums ──────────────────────────────────────────────────

export const AgeTier = z.enum(["preschool", "early_elementary", "upper_elementary"]);
export type AgeTier = z.infer<typeof AgeTier>;

export const GameType = z.enum([
  "counting",
  "number_recognition",
  "shapes",
  "addition_subtraction",
  "multiplication",
  "word_problems",
  "fractions",
  "algebra",
  "pattern_recognition",
  "sequencing",
  "sorting",
  "block_sequencing",
  "conditionals",
  "block_programming",
  "algorithm_challenge",
  "debugging",
]);
export type GameType = z.infer<typeof GameType>;

export const SubjectSlug = z.enum(["math", "coding-logic"]);
export type SubjectSlug = z.infer<typeof SubjectSlug>;

export const NodeType = z.enum(["game", "boss", "checkpoint", "reward"]);
export type NodeType = z.infer<typeof NodeType>;

export const XPSourceType = z.enum(["game", "badge", "streak_bonus", "daily_login"]);
export type XPSourceType = z.infer<typeof XPSourceType>;

export const AvatarCategory = z.enum(["head", "body", "accessory", "background"]);
export type AvatarCategory = z.infer<typeof AvatarCategory>;

export const LeaderboardPeriod = z.enum(["daily", "weekly", "alltime"]);
export type LeaderboardPeriod = z.infer<typeof LeaderboardPeriod>;

// ── Database Row Types ─────────────────────────────────────

export interface Parent {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  display_name: string;
  date_of_birth: string;
  age_tier: AgeTier;
  avatar_config: AvatarConfig | null;
  xp_total: number;
  currency_balance: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  created_at: string;
}

export interface Subject {
  id: string;
  slug: SubjectSlug;
  name: string;
  icon_url: string | null;
}

export interface Game {
  id: string;
  subject_id: string;
  age_tier: AgeTier;
  title: string;
  description: string;
  thumbnail_url: string | null;
  game_type: GameType;
  difficulty_range_min: number;
  difficulty_range_max: number;
  order_in_map: number;
}

export interface Question {
  id: string;
  game_id: string;
  difficulty_level: number;
  question_data: QuestionData;
  correct_answer: unknown;
  hints: string[];
  explanation: string;
  xp_reward: number;
}

export interface GameSession {
  id: string;
  child_id: string;
  game_id: string;
  started_at: string;
  ended_at: string | null;
  score: number;
  xp_earned: number;
  difficulty_level_start: number;
  difficulty_level_end: number;
  accuracy_pct: number;
}

export interface Answer {
  id: string;
  session_id: string;
  question_id: string;
  child_answer: unknown;
  is_correct: boolean;
  time_taken_ms: number;
  hints_used: number;
  answered_at: string;
}

export interface DifficultyState {
  child_id: string;
  game_id: string;
  current_level: number;
  consecutive_correct: number;
  consecutive_wrong: number;
  updated_at: string;
}

export interface XPLedgerEntry {
  id: string;
  child_id: string;
  amount: number;
  source_type: XPSourceType;
  source_id: string | null;
  created_at: string;
}

export interface BadgeCriteria {
  type:
    | "games_completed"
    | "perfect_score"
    | "streak_days"
    | "xp_total"
    | "first_game"
    | "subject_games"
    | "accuracy_avg";
  subject?: string;
  count?: number;
  threshold?: number;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_url: string | null;
  criteria: BadgeCriteria;
}

export interface ChildBadge {
  child_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface StreakEntry {
  id: string;
  child_id: string;
  date: string;
  activity_count: number;
}

export interface LeaderboardEntry {
  child_id: string;
  age_tier: AgeTier;
  period: LeaderboardPeriod;
  xp_total: number;
  rank: number;
  updated_at: string;
  child?: Pick<Child, "display_name" | "avatar_config">;
}

export interface AvatarItem {
  id: string;
  category: AvatarCategory;
  name: string;
  image_url: string;
  price_currency: number;
  is_default: boolean;
}

export interface ChildInventoryItem {
  child_id: string;
  item_id: string;
  purchased_at: string;
  item?: AvatarItem;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: AvatarCategory;
  image_url: string;
  price_currency: number;
  available_from: string | null;
  available_until: string | null;
}

export interface AdventureNode {
  id: string;
  subject_id: string;
  age_tier: AgeTier;
  order_index: number;
  title: string;
  game_id: string | null;
  node_type: NodeType;
  xp_requirement: number;
}

export interface ChildAdventureProgress {
  child_id: string;
  subject_id: string;
  current_node_id: string;
  nodes_completed: string[];
  unlocked_at: string;
}

// ── Composite / UI Types ───────────────────────────────────

export interface AvatarConfig {
  equipped_head: string | null;
  equipped_body: string | null;
  equipped_accessory: string | null;
  equipped_background: string | null;
}

export type QuestionData =
  | CountingQuestionData
  | MultipleChoiceQuestionData
  | MatchingQuestionData
  | SequencingQuestionData
  | BlockProgrammingQuestionData;

export interface CountingQuestionData {
  type: "counting";
  prompt: string;
  objectCount: number;
  objectEmoji: string;
}

export interface MultipleChoiceQuestionData {
  type: "multiple_choice";
  prompt: string;
  options: string[];
  imageUrl?: string;
}

export interface MatchingQuestionData {
  type: "matching";
  prompt: string;
  pairs: { left: string; right: string }[];
}

export interface SequencingQuestionData {
  type: "sequencing";
  prompt: string;
  items: string[];
  correctOrder: number[];
}

export interface BlockProgrammingQuestionData {
  type: "block_programming";
  prompt: string;
  availableBlocks: ProgramBlock[];
  gridSize: { rows: number; cols: number };
  startPosition: { row: number; col: number };
  goalPosition: { row: number; col: number };
  obstacles: { row: number; col: number }[];
}

export interface ProgramBlock {
  id: string;
  type: "move_forward" | "turn_left" | "turn_right" | "if_wall" | "repeat";
  label: string;
  color: string;
  value?: number;
}

// ── Game Engine Types ──────────────────────────────────────

export interface GameState {
  sessionId: string | null;
  currentQuestionIndex: number;
  questions: Question[];
  answers: AnswerRecord[];
  score: number;
  xpEarned: number;
  difficultyLevel: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  hintsUsed: number;
  isComplete: boolean;
  startedAt: string;
}

export interface AnswerRecord {
  questionId: string;
  answer: unknown;
  isCorrect: boolean;
  timeTakenMs: number;
  hintsUsed: number;
}

export interface TutorMessage {
  type: "encouragement" | "hint" | "explanation" | "celebration";
  text: string;
}

// ── Zod Schemas for Validation ─────────────────────────────

export const CreateChildSchema = z.object({
  display_name: z
    .string()
    .min(1, "Name is required")
    .max(30, "Name must be 30 characters or less")
    .regex(/^[a-zA-Z0-9\s]+$/, "Name can only contain letters, numbers, and spaces"),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});
export type CreateChildInput = z.infer<typeof CreateChildSchema>;

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  display_name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less"),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const SubmitAnswerSchema = z.object({
  session_id: z.string().uuid(),
  question_id: z.string().uuid(),
  answer: z.unknown(),
  time_taken_ms: z.number().int().min(0),
  hints_used: z.number().int().min(0).max(3),
});
export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;
