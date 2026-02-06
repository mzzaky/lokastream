'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client with fallback for build time
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a mock client for build time
  // This will be replaced with actual client at runtime
  console.warn('Supabase URL or Anon Key not provided. Using mock client.');
  supabase = {
    auth: {
      signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: new Error('Supabase not configured') }),
      getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
      getSession: async () => ({ data: { session: null }, error: new Error('Supabase not configured') }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ data: null, error: null, single: () => ({ data: null, error: null }), eq: () => ({ data: null, error: null, single: () => ({ data: null, error: null }) }) }),
      insert: () => ({ data: null, error: null, select: () => ({ single: () => ({ data: null, error: null }) }) }),
      update: () => ({ data: null, error: null, eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
      delete: () => ({ error: null, eq: () => ({ error: null }) }),
      upsert: () => ({ data: null, error: null, select: () => ({ single: () => ({ data: null, error: null }) }) }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
    rpc: () => ({}),
  } as unknown as SupabaseClient;
}

export { supabase };

// Database Types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          stream_platforms: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          stream_platforms?: any;
        };
        Update: {
          email?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          stream_platforms?: any;
        };
      };
      mabar_settings: {
        Row: {
          id: string;
          streamer_id: string;
          game_type: string;
          price_per_slot: number;
          currency: string;
          max_queue_size: number;
          min_players_to_start: number;
          roles: any;
          mvp_reward_enabled: boolean;
          mvp_reward_description: string;
          mvp_win_count: number;
          custom_fields: any;
          is_active: boolean;
          overlay_theme: any;
          notification_sound: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          streamer_id: string;
          game_type?: string;
          price_per_slot?: number;
          currency?: string;
          max_queue_size?: number;
          min_players_to_start?: number;
          roles?: any;
          mvp_reward_enabled?: boolean;
          mvp_reward_description?: string;
          mvp_win_count?: number;
          custom_fields?: any;
          is_active?: boolean;
          overlay_theme?: any;
          notification_sound?: string;
        };
        Update: Partial<Database['public']['Tables']['mabar_settings']['Insert']>;
      };
      queue_entries: {
        Row: {
          id: string;
          mabar_settings_id: string;
          streamer_id: string;
          player_name: string;
          game_id: string;
          game_nickname: string;
          selected_role: string;
          email: string | null;
          phone: string | null;
          user_id: string | null;
          is_anonymous: boolean;
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_id: string | null;
          payment_method: string | null;
          amount_paid: number;
          queue_position: number;
          status: 'waiting' | 'selected' | 'playing' | 'completed' | 'cancelled' | 'no_show';
          custom_data: any;
          joined_at: string;
          updated_at: string;
        };
        Insert: {
          mabar_settings_id: string;
          streamer_id: string;
          player_name: string;
          game_id: string;
          game_nickname: string;
          selected_role: string;
          email?: string | null;
          phone?: string | null;
          user_id?: string | null;
          is_anonymous?: boolean;
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_id?: string | null;
          payment_method?: string | null;
          amount_paid?: number;
          queue_position: number;
          status?: 'waiting' | 'selected' | 'playing' | 'completed' | 'cancelled' | 'no_show';
          custom_data?: any;
        };
        Update: Partial<Database['public']['Tables']['queue_entries']['Insert']>;
      };
      game_sessions: {
        Row: {
          id: string;
          streamer_id: string;
          mabar_settings_id: string;
          session_number: number;
          players: any;
          game_type: string;
          game_result: 'win' | 'lose' | 'draw' | null;
          mvp_player_id: string | null;
          started_at: string;
          ended_at: string | null;
          duration_minutes: number | null;
          total_revenue: number;
          notes: string | null;
          status: 'preparing' | 'in_progress' | 'completed' | 'cancelled';
        };
        Insert: {
          streamer_id: string;
          mabar_settings_id: string;
          session_number: number;
          players?: any;
          game_type: string;
          game_result?: 'win' | 'lose' | 'draw' | null;
          mvp_player_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          duration_minutes?: number | null;
          total_revenue?: number;
          notes?: string | null;
          status?: 'preparing' | 'in_progress' | 'completed' | 'cancelled';
        };
        Update: Partial<Database['public']['Tables']['game_sessions']['Insert']>;
      };
      mvp_records: {
        Row: {
          id: string;
          streamer_id: string;
          player_identifier: string;
          player_name: string;
          total_mvp_wins: number;
          total_games_played: number;
          rewards_claimed: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          streamer_id: string;
          player_identifier: string;
          player_name: string;
          total_mvp_wins?: number;
          total_games_played?: number;
          rewards_claimed?: any;
        };
        Update: Partial<Database['public']['Tables']['mvp_records']['Insert']>;
      };
      donor_customers: {
        Row: {
          id: string;
          streamer_id: string;
          player_name: string;
          game_id: string;
          game_nickname: string;
          email: string | null;
          phone: string | null;
          user_id: string | null;
          total_donations: number;
          total_amount_spent: number;
          total_games_played: number;
          total_mvp_wins: number;
          favorite_role: string | null;
          customer_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
          notes: string | null;
          is_blocked: boolean;
          first_donation_at: string | null;
          last_donation_at: string | null;
          last_played_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          streamer_id: string;
          player_name: string;
          game_id: string;
          game_nickname: string;
          email?: string | null;
          phone?: string | null;
          user_id?: string | null;
          total_donations?: number;
          total_amount_spent?: number;
          total_games_played?: number;
          total_mvp_wins?: number;
          favorite_role?: string | null;
          customer_tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
          notes?: string | null;
          is_blocked?: boolean;
          first_donation_at?: string | null;
          last_donation_at?: string | null;
          last_played_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['donor_customers']['Insert']>;
      };
      donations: {
        Row: {
          id: string;
          streamer_id: string;
          donor_name: string;
          donor_user_id: string | null;
          is_anonymous_donor: boolean;
          amount: number;
          currency: string;
          donation_type: 'mabar' | 'general' | 'tip';
          related_queue_entry_id: string | null;
          message: string | null;
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_id: string;
          payment_method: string;
          created_at: string;
        };
        Insert: {
          streamer_id: string;
          donor_name: string;
          donor_user_id?: string | null;
          is_anonymous_donor?: boolean;
          amount: number;
          currency?: string;
          donation_type: 'mabar' | 'general' | 'tip';
          related_queue_entry_id?: string | null;
          message?: string | null;
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_id: string;
          payment_method: string;
        };
        Update: Partial<Database['public']['Tables']['donations']['Insert']>;
      };
    };
  };
};

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// User profile functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const getUserByUsername = async (username: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  return { data, error };
};

export const createUserProfile = async (profile: Database['public']['Tables']['users']['Insert']) => {
  const { data, error } = await supabase
    .from('users')
    .insert(profile)
    .select()
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: Database['public']['Tables']['users']['Update']) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// Check if username is available
export const checkUsernameAvailable = async (username: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();
  
  if (error && error.code === 'PGRST116') {
    // No rows returned - username is available
    return { available: true, error: null };
  }
  
  return { available: false, error };
};

// Mabar settings functions
export const getMabarSettings = async (streamerId: string) => {
  const { data, error } = await supabase
    .from('mabar_settings')
    .select('*')
    .eq('streamer_id', streamerId)
    .eq('is_active', true)
    .single();
  return { data, error };
};

export const getMabarSettingsByUsername = async (username: string) => {
  const { data: user, error: userError } = await getUserByUsername(username);
  if (userError || !user) return { data: null, error: userError, user: null };
  
  const { data, error } = await supabase
    .from('mabar_settings')
    .select('*')
    .eq('streamer_id', user.id)
    .eq('is_active', true)
    .single();
  return { data, error, user };
};

export const createMabarSettings = async (settings: Database['public']['Tables']['mabar_settings']['Insert']) => {
  const { data, error } = await supabase
    .from('mabar_settings')
    .insert(settings)
    .select()
    .single();
  return { data, error };
};

export const updateMabarSettings = async (settingsId: string, updates: Database['public']['Tables']['mabar_settings']['Update']) => {
  const { data, error } = await supabase
    .from('mabar_settings')
    .update(updates)
    .eq('id', settingsId)
    .select()
    .single();
  return { data, error };
};

// Queue functions
export const getQueueEntries = async (streamerId: string, status?: string[]) => {
  let query = supabase
    .from('queue_entries')
    .select('*')
    .eq('streamer_id', streamerId)
    .order('queue_position', { ascending: true });
  
  if (status && status.length > 0) {
    query = query.in('status', status);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const addToQueue = async (entry: Database['public']['Tables']['queue_entries']['Insert']) => {
  const { data, error } = await supabase
    .from('queue_entries')
    .insert(entry)
    .select()
    .single();
  return { data, error };
};

export const updateQueueEntry = async (entryId: string, updates: Database['public']['Tables']['queue_entries']['Update']) => {
  const { data, error } = await supabase
    .from('queue_entries')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single();
  return { data, error };
};

export const deleteQueueEntry = async (entryId: string) => {
  const { error } = await supabase
    .from('queue_entries')
    .delete()
    .eq('id', entryId);
  return { error };
};

// Get next queue position
export const getNextQueuePosition = async (mabarSettingsId: string) => {
  const { data, error } = await supabase
    .from('queue_entries')
    .select('queue_position')
    .eq('mabar_settings_id', mabarSettingsId)
    .in('status', ['waiting', 'selected'])
    .order('queue_position', { ascending: false })
    .limit(1);
  
  if (error) return { position: 1, error };
  return { position: (data?.[0]?.queue_position || 0) + 1, error: null };
};

// Game sessions functions
export const getGameSessions = async (streamerId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('streamer_id', streamerId)
    .order('started_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

// Get game sessions with pagination and filters
export const getGameSessionsPaginated = async (
  streamerId: string,
  options: {
    page?: number;
    perPage?: number;
    gameType?: string;
    result?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}
) => {
  const { page = 1, perPage = 10, gameType, result, status, dateFrom, dateTo } = options;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('game_sessions')
    .select('*', { count: 'exact' })
    .eq('streamer_id', streamerId)
    .order('started_at', { ascending: false });

  if (gameType && gameType !== 'all') {
    query = query.eq('game_type', gameType);
  }

  if (result && result !== 'all') {
    query = query.eq('game_result', result);
  }

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (dateFrom) {
    query = query.gte('started_at', dateFrom);
  }

  if (dateTo) {
    query = query.lte('started_at', dateTo);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  return {
    data,
    error,
    count: count || 0,
    totalPages: Math.ceil((count || 0) / perPage),
    currentPage: page
  };
};

// Get game history stats
export const getGameHistoryStats = async (streamerId: string) => {
  const { data: sessions } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('streamer_id', streamerId)
    .eq('status', 'completed');

  if (!sessions || sessions.length === 0) {
    return {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
      winRate: 0,
      totalRevenue: 0,
      averageDuration: 0,
      totalPlayers: 0,
    };
  }

  const totalGames = sessions.length;
  const totalWins = sessions.filter(s => s.game_result === 'win').length;
  const totalLosses = sessions.filter(s => s.game_result === 'lose').length;
  const totalDraws = sessions.filter(s => s.game_result === 'draw').length;
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
  const totalRevenue = sessions.reduce((sum, s) => sum + (s.total_revenue || 0), 0);
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const averageDuration = totalGames > 0 ? Math.round(totalDuration / totalGames) : 0;
  const totalPlayers = sessions.reduce((sum, s) => sum + (s.players?.length || 0), 0);

  return {
    totalGames,
    totalWins,
    totalLosses,
    totalDraws,
    winRate,
    totalRevenue,
    averageDuration,
    totalPlayers,
  };
};

export const createGameSession = async (session: Database['public']['Tables']['game_sessions']['Insert']) => {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert(session)
    .select()
    .single();
  return { data, error };
};

export const updateGameSession = async (sessionId: string, updates: Database['public']['Tables']['game_sessions']['Update']) => {
  const { data, error } = await supabase
    .from('game_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();
  return { data, error };
};

export const getNextSessionNumber = async (streamerId: string) => {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('session_number')
    .eq('streamer_id', streamerId)
    .order('session_number', { ascending: false })
    .limit(1);
  
  if (error) return { sessionNumber: 1, error };
  return { sessionNumber: (data?.[0]?.session_number || 0) + 1, error: null };
};

// MVP records functions
export const getMvpRecords = async (streamerId: string) => {
  const { data, error } = await supabase
    .from('mvp_records')
    .select('*')
    .eq('streamer_id', streamerId)
    .order('total_mvp_wins', { ascending: false });
  return { data, error };
};

export const upsertMvpRecord = async (record: Database['public']['Tables']['mvp_records']['Insert']) => {
  const { data, error } = await supabase
    .from('mvp_records')
    .upsert(record, { onConflict: 'streamer_id,player_identifier' })
    .select()
    .single();
  return { data, error };
};

// Dashboard stats
export const getDashboardStats = async (streamerId: string) => {
  // Get queue count
  const { data: queueData } = await supabase
    .from('queue_entries')
    .select('id', { count: 'exact' })
    .eq('streamer_id', streamerId)
    .in('status', ['waiting', 'selected']);
  
  // Get completed games count
  const { data: gamesData } = await supabase
    .from('game_sessions')
    .select('id', { count: 'exact' })
    .eq('streamer_id', streamerId)
    .eq('status', 'completed');
  
  // Get MVP count
  const { data: mvpData } = await supabase
    .from('mvp_records')
    .select('total_mvp_wins')
    .eq('streamer_id', streamerId);
  
  // Get total revenue
  const { data: revenueData } = await supabase
    .from('donations')
    .select('amount')
    .eq('streamer_id', streamerId)
    .eq('payment_status', 'completed');
  
  const totalMvp = mvpData?.reduce((sum, r) => sum + r.total_mvp_wins, 0) || 0;
  const totalRevenue = revenueData?.reduce((sum, d) => sum + d.amount, 0) || 0;
  
  return {
    queueCount: queueData?.length || 0,
    gamesCompleted: gamesData?.length || 0,
    totalMvp,
    totalRevenue,
  };
};

// Donor customer functions
export const getDonorCustomers = async (
  streamerId: string,
  options: {
    page?: number;
    perPage?: number;
    search?: string;
    tier?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
) => {
  const { page = 1, perPage = 20, search, tier, sortBy = 'total_amount_spent', sortOrder = 'desc' } = options;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('donor_customers')
    .select('*', { count: 'exact' })
    .eq('streamer_id', streamerId);

  if (search) {
    query = query.or(`player_name.ilike.%${search}%,game_id.ilike.%${search}%,game_nickname.ilike.%${search}%`);
  }

  if (tier && tier !== 'all') {
    query = query.eq('customer_tier', tier);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to);

  const { data, error, count } = await query;
  return {
    data,
    error,
    count: count || 0,
    totalPages: Math.ceil((count || 0) / perPage),
    currentPage: page,
  };
};

export const getDonorCustomerStats = async (streamerId: string) => {
  const { data: customers } = await supabase
    .from('donor_customers')
    .select('*')
    .eq('streamer_id', streamerId);

  if (!customers || customers.length === 0) {
    return {
      totalCustomers: 0,
      totalRevenue: 0,
      avgSpentPerCustomer: 0,
      topTierCount: 0,
      newThisMonth: 0,
      repeatCustomers: 0,
    };
  }

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_amount_spent, 0);
  const avgSpentPerCustomer = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;
  const topTierCount = customers.filter(c => ['gold', 'platinum', 'diamond'].includes(c.customer_tier)).length;
  const newThisMonth = customers.filter(c => c.created_at >= firstOfMonth).length;
  const repeatCustomers = customers.filter(c => c.total_donations > 1).length;

  return {
    totalCustomers,
    totalRevenue,
    avgSpentPerCustomer,
    topTierCount,
    newThisMonth,
    repeatCustomers,
  };
};

export const updateDonorCustomer = async (
  customerId: string,
  updates: Database['public']['Tables']['donor_customers']['Update']
) => {
  const { data, error } = await supabase
    .from('donor_customers')
    .update(updates)
    .eq('id', customerId)
    .select()
    .single();
  return { data, error };
};

export const upsertDonorCustomer = async (
  customer: Database['public']['Tables']['donor_customers']['Insert']
) => {
  const { data, error } = await supabase
    .from('donor_customers')
    .upsert(customer, { onConflict: 'streamer_id,game_id' })
    .select()
    .single();
  return { data, error };
};

// Realtime subscriptions
export const subscribeToQueue = (streamerId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`queue-${streamerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'queue_entries',
        filter: `streamer_id=eq.${streamerId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToSessions = (streamerId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`sessions-${streamerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_sessions',
        filter: `streamer_id=eq.${streamerId}`,
      },
      callback
    )
    .subscribe();
};
