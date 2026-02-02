// =====================
// USER & AUTH TYPES
// =====================
export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  stream_platforms: StreamPlatform[];
  created_at: string;
  updated_at: string;
}

export interface StreamPlatform {
  platform: 'twitch' | 'youtube' | 'facebook' | 'nimotv';
  channel_url: string;
  channel_name: string;
}

// =====================
// MABAR VIP TYPES
// =====================
export interface MabarSettings {
  id: string;
  streamer_id: string;
  game_type: GameType;
  price_per_slot: number;
  currency: 'IDR' | 'USD';
  max_queue_size: number;
  min_players_to_start: number;
  roles: GameRole[];
  mvp_reward_enabled: boolean;
  mvp_reward_description?: string;
  mvp_win_count: number;
  custom_fields: CustomField[];
  is_active: boolean;
  overlay_theme: OverlayTheme;
  notification_sound: string;
  created_at: string;
  updated_at: string;
}

export type GameType = 'mobile_legends' | 'pubg_mobile' | 'free_fire' | 'valorant' | 'other';

export interface GameRole {
  id: string;
  name: string;
  icon: string;
  max_count: number;
}

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'number';
  required: boolean;
  options?: string[]; // for select type
  placeholder?: string;
}

export interface OverlayTheme {
  background_color: string;
  text_color: string;
  accent_color: string;
  font_family: string;
  animation_style: 'bounce' | 'slide' | 'fade' | 'pop';
}

// =====================
// QUEUE TYPES
// =====================
export interface QueueEntry {
  id: string;
  mabar_settings_id: string;
  streamer_id: string;
  
  // Player Info
  player_name: string;
  game_id: string;
  game_nickname: string;
  selected_role: string;
  
  // Contact (optional for registered users)
  email?: string;
  phone?: string;
  
  // Auth
  user_id?: string; // null for anonymous
  is_anonymous: boolean;
  
  // Payment
  payment_status: PaymentStatus;
  payment_id?: string;
  payment_method?: string;
  amount_paid: number;
  
  // Status
  queue_position: number;
  status: QueueStatus;
  
  // Custom Fields Data
  custom_data: Record<string, any>;
  
  // Timestamps
  joined_at: string;
  updated_at: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type QueueStatus = 'waiting' | 'selected' | 'playing' | 'completed' | 'cancelled' | 'no_show';

// =====================
// GAME SESSION TYPES
// =====================
export interface GameSession {
  id: string;
  streamer_id: string;
  mabar_settings_id: string;
  session_number: number;
  
  // Players
  players: SessionPlayer[];
  
  // Game Info
  game_type: GameType;
  game_result?: 'win' | 'lose' | 'draw';
  mvp_player_id?: string;
  
  // Timing
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  
  // Stats
  total_revenue: number;
  notes?: string;
  
  // Status
  status: SessionStatus;
}

export type SessionStatus = 'preparing' | 'in_progress' | 'completed' | 'cancelled';

export interface SessionPlayer {
  queue_entry_id: string;
  player_name: string;
  game_id: string;
  game_nickname: string;
  role: string;
  is_mvp: boolean;
  joined_at: string;
}

// =====================
// MVP & REWARDS
// =====================
export interface MVPRecord {
  id: string;
  streamer_id: string;
  player_identifier: string; // game_id or user_id
  player_name: string;
  total_mvp_wins: number;
  total_games_played: number;
  rewards_claimed: RewardClaim[];
  created_at: string;
  updated_at: string;
}

export interface RewardClaim {
  id: string;
  mvp_record_id: string;
  reward_type: string;
  reward_description: string;
  claimed_at: string;
  fulfilled: boolean;
}

// =====================
// MATCH HISTORY
// =====================
export interface MatchHistory {
  id: string;
  streamer_id: string;
  session_id: string;
  date: string;
  game_type: GameType;
  players: MatchPlayer[];
  result: 'win' | 'lose' | 'draw';
  mvp_player?: string;
  duration_minutes: number;
  total_revenue: number;
  notes?: string;
}

export interface MatchPlayer {
  name: string;
  game_id: string;
  role: string;
  is_mvp: boolean;
  is_anonymous: boolean;
}

// =====================
// DONATION TYPES
// =====================
export interface Donation {
  id: string;
  streamer_id: string;
  
  // Donor Info
  donor_name: string;
  donor_user_id?: string;
  is_anonymous_donor: boolean;
  
  // Amount
  amount: number;
  currency: 'IDR' | 'USD';
  
  // Type
  donation_type: 'mabar' | 'general' | 'tip';
  related_queue_entry_id?: string;
  
  // Message
  message?: string;
  
  // Payment
  payment_status: PaymentStatus;
  payment_id: string;
  payment_method: string;
  
  // Timestamps
  created_at: string;
}

// =====================
// ANALYTICS TYPES
// =====================
export interface StreamerAnalytics {
  total_sessions: number;
  total_players: number;
  total_revenue: number;
  average_session_duration: number;
  win_rate: number;
  top_roles: { role: string; count: number }[];
  daily_stats: DailyStat[];
  monthly_stats: MonthlyStat[];
}

export interface DailyStat {
  date: string;
  sessions: number;
  players: number;
  revenue: number;
}

export interface MonthlyStat {
  month: string;
  sessions: number;
  players: number;
  revenue: number;
}

// =====================
// API RESPONSE TYPES
// =====================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// =====================
// FORM TYPES
// =====================
export interface MabarRegistrationForm {
  player_name: string;
  game_id: string;
  game_nickname: string;
  selected_role: string;
  email?: string;
  phone?: string;
  custom_data: Record<string, any>;
}

// =====================
// REALTIME TYPES
// =====================
export interface RealtimeQueueUpdate {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  entry: QueueEntry;
}

export interface RealtimeSessionUpdate {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  session: GameSession;
}

// =====================
// NOTIFICATION TYPES
// =====================
export interface Notification {
  id: string;
  type: 'new_registration' | 'payment_received' | 'session_started' | 'mvp_achieved' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}
