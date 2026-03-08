-- SQL Migration for Focus Folder Unified Auth & History
-- Target: Supabase SQL Editor

-- 1. FOCUS CLIENTS TABLE (For User Registry & Migration)
CREATE TABLE IF NOT EXISTS focus_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    status TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for focus_clients
ALTER TABLE focus_clients ENABLE ROW LEVEL SECURITY;

-- Policies for focus_clients
CREATE POLICY "Users can view their own focus client data"
    ON focus_clients FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus client data"
    ON focus_clients FOR UPDATE
    USING (auth.uid() = user_id);

-- 2. FOCUS HISTORY TABLE (For Achievement Tracking)
CREATE TABLE IF NOT EXISTS focus_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    difficulty TEXT, -- Easy, Medium, Hard, eL Zen
    desire_text TEXT, -- The "Keinginan"
    status TEXT DEFAULT 'started', -- started, completed, abandoned
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    focus_time INTEGER DEFAULT 0, -- Total seconds in Phase 1 and 6
    bump_count INTEGER DEFAULT 0, -- 1-4 bumps completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for focus_history
ALTER TABLE focus_history ENABLE ROW LEVEL SECURITY;

-- Policies for focus_history
CREATE POLICY "Users can view their own focus history"
    ON focus_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own focus history"
    ON focus_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus history"
    ON focus_history FOR UPDATE
    USING (auth.uid() = user_id);

-- 3. AUTO-MIGRATION / UPSERT TRIGGER (Optional but helpful)
-- This ensures that when a record is inserted into focus_history,
-- the user is also registered in focus_clients if they aren't already.

CREATE OR REPLACE FUNCTION handle_focus_client_upsert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO focus_clients (user_id, email, display_name)
    VALUES (
        NEW.user_id,
        (SELECT email FROM auth.users WHERE id = NEW.user_id),
        (SELECT COALESCE(raw_user_meta_data->>'display_name', email) FROM auth.users WHERE id = NEW.user_id)
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_focus_history_insert
    AFTER INSERT ON focus_history
    FOR EACH ROW
    EXECUTE FUNCTION handle_focus_client_upsert();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_focus_history_user_id ON focus_history(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_history_started_at ON focus_history(started_at);
CREATE INDEX IF NOT EXISTS idx_focus_clients_user_id ON focus_clients(user_id);
