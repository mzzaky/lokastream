-- =====================================================
-- LOKASTREAM DATABASE SCHEMA
-- Platform Streamer Gamer Indonesia
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- Tabel untuk menyimpan data streamer
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    stream_platforms JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk pencarian user
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);

-- =====================================================
-- MABAR SETTINGS TABLE
-- Pengaturan Mabar VIP untuk setiap streamer
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mabar_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    streamer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL DEFAULT 'mobile_legends',
    price_per_slot INTEGER NOT NULL DEFAULT 50000,
    currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
    max_queue_size INTEGER NOT NULL DEFAULT 20,
    min_players_to_start INTEGER NOT NULL DEFAULT 4,
    roles JSONB DEFAULT '[
        {"id": "exp", "name": "EXP Laner", "icon": "⚔️", "max_count": 5},
        {"id": "jungle", "name": "Jungler", "icon": "🌲", "max_count": 5},
        {"id": "mid", "name": "Mid Laner", "icon": "🎯", "max_count": 5},
        {"id": "gold", "name": "Gold Laner", "icon": "💰", "max_count": 5},
        {"id": "roam", "name": "Roamer", "icon": "🛡️", "max_count": 5}
    ]'::jsonb,
    mvp_reward_enabled BOOLEAN DEFAULT true,
    mvp_reward_description TEXT DEFAULT 'Dapatkan hadiah spesial setelah 3x MVP!',
    mvp_win_count INTEGER DEFAULT 3,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    overlay_theme JSONB DEFAULT '{
        "background_color": "#2D2B55",
        "text_color": "#FFFFFF",
        "accent_color": "#FF6B9D",
        "font_family": "Fredoka",
        "animation_style": "bounce"
    }'::jsonb,
    notification_sound VARCHAR(100) DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk mabar settings
CREATE INDEX idx_mabar_settings_streamer ON public.mabar_settings(streamer_id);
CREATE INDEX idx_mabar_settings_active ON public.mabar_settings(is_active);

-- =====================================================
-- QUEUE ENTRIES TABLE
-- Antrian Mabar VIP
-- =====================================================
CREATE TABLE IF NOT EXISTS public.queue_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mabar_settings_id UUID NOT NULL REFERENCES public.mabar_settings(id) ON DELETE CASCADE,
    streamer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Player Info
    player_name VARCHAR(100) NOT NULL,
    game_id VARCHAR(100) NOT NULL,
    game_nickname VARCHAR(100) NOT NULL,
    selected_role VARCHAR(50) NOT NULL,
    
    -- Contact
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Auth
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT true,
    
    -- Payment
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_id VARCHAR(100),
    payment_method VARCHAR(50),
    amount_paid INTEGER NOT NULL DEFAULT 0,
    
    -- Queue
    queue_position INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'selected', 'playing', 'completed', 'cancelled', 'no_show')),
    
    -- Custom Data
    custom_data JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes untuk queue
CREATE INDEX idx_queue_streamer ON public.queue_entries(streamer_id);
CREATE INDEX idx_queue_settings ON public.queue_entries(mabar_settings_id);
CREATE INDEX idx_queue_status ON public.queue_entries(status);
CREATE INDEX idx_queue_position ON public.queue_entries(queue_position);
CREATE INDEX idx_queue_payment ON public.queue_entries(payment_status);

-- =====================================================
-- GAME SESSIONS TABLE
-- Sesi game/mabar
-- =====================================================
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    streamer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    mabar_settings_id UUID NOT NULL REFERENCES public.mabar_settings(id) ON DELETE CASCADE,
    session_number INTEGER NOT NULL,
    
    -- Players
    players JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Game Info
    game_type VARCHAR(50) NOT NULL,
    game_result VARCHAR(20) CHECK (game_result IN ('win', 'lose', 'draw')),
    mvp_player_id VARCHAR(100),
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    
    -- Stats
    total_revenue INTEGER DEFAULT 0,
    notes TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'preparing' CHECK (status IN ('preparing', 'in_progress', 'completed', 'cancelled'))
);

-- Indexes untuk game sessions
CREATE INDEX idx_sessions_streamer ON public.game_sessions(streamer_id);
CREATE INDEX idx_sessions_status ON public.game_sessions(status);
CREATE INDEX idx_sessions_date ON public.game_sessions(started_at);

-- =====================================================
-- MVP RECORDS TABLE
-- Catatan MVP pemain
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mvp_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    streamer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    player_identifier VARCHAR(100) NOT NULL, -- game_id
    player_name VARCHAR(100) NOT NULL,
    total_mvp_wins INTEGER DEFAULT 0,
    total_games_played INTEGER DEFAULT 0,
    rewards_claimed JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(streamer_id, player_identifier)
);

-- Indexes untuk MVP records
CREATE INDEX idx_mvp_streamer ON public.mvp_records(streamer_id);
CREATE INDEX idx_mvp_player ON public.mvp_records(player_identifier);

-- =====================================================
-- DONATIONS TABLE
-- Catatan donasi
-- =====================================================
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    streamer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Donor Info
    donor_name VARCHAR(100) NOT NULL,
    donor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_anonymous_donor BOOLEAN DEFAULT false,
    
    -- Amount
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Type
    donation_type VARCHAR(20) NOT NULL CHECK (donation_type IN ('mabar', 'general', 'tip')),
    related_queue_entry_id UUID REFERENCES public.queue_entries(id) ON DELETE SET NULL,
    
    -- Message
    message TEXT,
    
    -- Payment
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_id VARCHAR(100) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes untuk donations
CREATE INDEX idx_donations_streamer ON public.donations(streamer_id);
CREATE INDEX idx_donations_date ON public.donations(created_at);
CREATE INDEX idx_donations_status ON public.donations(payment_status);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk auto-update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mabar_settings_updated_at
    BEFORE UPDATE ON public.mabar_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_entries_updated_at
    BEFORE UPDATE ON public.queue_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mvp_records_updated_at
    BEFORE UPDATE ON public.mvp_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function untuk auto-increment queue position
CREATE OR REPLACE FUNCTION get_next_queue_position(settings_id UUID)
RETURNS INTEGER AS $$
DECLARE
    next_pos INTEGER;
BEGIN
    SELECT COALESCE(MAX(queue_position), 0) + 1 
    INTO next_pos
    FROM public.queue_entries 
    WHERE mabar_settings_id = settings_id 
    AND status IN ('waiting', 'selected');
    
    RETURN next_pos;
END;
$$ language 'plpgsql';

-- Function untuk auto-increment session number
CREATE OR REPLACE FUNCTION get_next_session_number(s_id UUID)
RETURNS INTEGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(session_number), 0) + 1 
    INTO next_num
    FROM public.game_sessions 
    WHERE streamer_id = s_id;
    
    RETURN next_num;
END;
$$ language 'plpgsql';

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mabar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mvp_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Policies untuk users
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Policies untuk mabar_settings (public read, owner write)
CREATE POLICY "Anyone can view active mabar settings" ON public.mabar_settings
    FOR SELECT USING (is_active = true);

CREATE POLICY "Streamers can manage their mabar settings" ON public.mabar_settings
    FOR ALL USING (auth.uid() = streamer_id);

-- Policies untuk queue_entries
CREATE POLICY "Anyone can view queue entries" ON public.queue_entries
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert queue entries" ON public.queue_entries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Streamers can update queue entries" ON public.queue_entries
    FOR UPDATE USING (auth.uid() = streamer_id);

-- Policies untuk game_sessions
CREATE POLICY "Anyone can view game sessions" ON public.game_sessions
    FOR SELECT USING (true);

CREATE POLICY "Streamers can manage game sessions" ON public.game_sessions
    FOR ALL USING (auth.uid() = streamer_id);

-- Policies untuk mvp_records
CREATE POLICY "Anyone can view MVP records" ON public.mvp_records
    FOR SELECT USING (true);

CREATE POLICY "Streamers can manage MVP records" ON public.mvp_records
    FOR ALL USING (auth.uid() = streamer_id);

-- Policies untuk donations
CREATE POLICY "Anyone can view donations" ON public.donations
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert donations" ON public.donations
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime for specific tables
-- =====================================================

-- Enable realtime for queue_entries (penting untuk live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_entries;

-- Enable realtime for game_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;

-- Enable realtime for donations
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;

-- =====================================================
-- SAMPLE DATA (untuk testing)
-- Hapus di production
-- =====================================================

-- Insert sample streamer
-- INSERT INTO public.users (id, email, username, display_name, stream_platforms)
-- VALUES (
--     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
--     'demo@lokastream.com',
--     'demogamer',
--     'Demo Gamer',
--     '[{"platform": "twitch", "channel_url": "https://twitch.tv/demogamer", "channel_name": "demogamer"}]'
-- );

-- Insert sample mabar settings
-- INSERT INTO public.mabar_settings (streamer_id, game_type, price_per_slot)
-- VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'mobile_legends', 50000);
