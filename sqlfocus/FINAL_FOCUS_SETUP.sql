-- ==========================================================
-- FINAL FOCUS SETUP V2 (Sync on Login)
-- ==========================================================

-- 1. TABLES (Tetap sama)
CREATE TABLE IF NOT EXISTS focus_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    display_name TEXT,
    status TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS focus_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    difficulty TEXT,
    desire_text TEXT,
    status TEXT DEFAULT 'started',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    focus_time INTEGER DEFAULT 0,
    bump_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SECURITY (RLS)
ALTER TABLE focus_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_history ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Users can view their own focus client data" ON focus_clients;
DROP POLICY IF EXISTS "Users can update their own focus client data" ON focus_clients;
DROP POLICY IF EXISTS "Users can insert their own focus client data" ON focus_clients;
DROP POLICY IF EXISTS "Users can view their own focus history" ON focus_history;
DROP POLICY IF EXISTS "Users can insert their own focus history" ON focus_history;
DROP POLICY IF EXISTS "Users can update their own focus history" ON focus_history;

-- Create Policies (Menambahkan INSERT untuk focus_clients)
CREATE POLICY "Users can view their own focus client data" ON focus_clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own focus client data" ON focus_clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own focus client data" ON focus_clients FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own focus history" ON focus_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own focus history" ON focus_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own focus history" ON focus_history FOR UPDATE USING (auth.uid() = user_id);

-- 3. TRIGGER (Tetap ada sebagai failsafe)
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

DROP TRIGGER IF EXISTS on_focus_history_insert ON focus_history;
CREATE TRIGGER on_focus_history_insert
    AFTER INSERT ON focus_history
    FOR EACH ROW
    EXECUTE FUNCTION handle_focus_client_upsert();
