-- ==========================================================
-- COMPLETE DATABASE SCHEMA SETUP FOR eL FOCUS
-- VERSION: 2026.03.08
-- ==========================================================
-- This script sets up all necessary tables, security policies, 
-- triggers, and indexes for the Focus application.
-- ==========================================================

-- 1. TABLES
-- focus_clients: Stores registered app users and their metadata
CREATE TABLE IF NOT EXISTS focus_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    display_name TEXT,
    status TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- focus_history: Tracks individual focus protocol sessions and achievements
CREATE TABLE IF NOT EXISTS focus_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    difficulty TEXT, -- Easy, Medium, Hard, eL Zen
    desire_text TEXT, -- The "Keinginan" goal
    status TEXT DEFAULT 'started', -- started, completed, abandoned
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    focus_time INTEGER DEFAULT 0, -- Total focus duration in seconds
    bump_count INTEGER DEFAULT 0, -- Number of bumps successfully performed (0-4)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SECURITY (Row Level Security)
ALTER TABLE focus_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_history ENABLE ROW LEVEL SECURITY;

-- Cleanup existing policies to prevent "already exists" errors
DROP POLICY IF EXISTS "Users can view their own focus client data" ON focus_clients;
DROP POLICY IF EXISTS "Users can update their own focus client data" ON focus_clients;
DROP POLICY IF EXISTS "Users can insert their own focus client data" ON focus_clients;
DROP POLICY IF EXISTS "Users can view their own focus history" ON focus_history;
DROP POLICY IF EXISTS "Users can insert their own focus history" ON focus_history;
DROP POLICY IF EXISTS "Users can update their own focus history" ON focus_history;

-- focus_clients policies
CREATE POLICY "Users can view their own focus client data" ON focus_clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own focus client data" ON focus_clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own focus client data" ON focus_clients FOR INSERT WITH CHECK (auth.uid() = user_id);

-- focus_history policies
CREATE POLICY "Users can view their own focus history" ON focus_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own focus history" ON focus_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own focus history" ON focus_history FOR UPDATE USING (auth.uid() = user_id);

-- 3. AUTO-MIGRATION / UPSERT TRIGGER
-- Automatically syncs/registers users into focus_clients whenever they start a session
CREATE OR REPLACE FUNCTION handle_focus_client_upsert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO focus_clients (user_id, user_email, display_name)
    VALUES (
        NEW.user_id,
        NEW.user_email,
        (SELECT COALESCE(raw_user_meta_data->>'display_name', email) FROM auth.users WHERE id = NEW.user_id)
    )
    ON CONFLICT (user_id) DO UPDATE SET
        user_email = EXCLUDED.user_email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_focus_history_insert ON focus_history;
CREATE TRIGGER on_focus_history_insert
    AFTER INSERT ON focus_history
    FOR EACH ROW
    EXECUTE FUNCTION handle_focus_client_upsert();

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_focus_history_user_id ON focus_history(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_history_started_at ON focus_history(started_at);
CREATE INDEX IF NOT EXISTS idx_focus_clients_user_id ON focus_clients(user_id);

-- 5. REALTIME ENABLING (Run this if you want to use Supabase Realtime)
-- ALTER PUBLICATION supabase_realtime ADD TABLE focus_clients;
-- ALTER PUBLICATION supabase_realtime ADD TABLE focus_history;
