-- FIX FOCUS_HISTORY COLUMN NAMES
DO $$ 
BEGIN
    -- 1. Rename 'email' ke 'user_email' di tabel history jika masih nama lama
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='focus_history' AND column_name='email') THEN
        ALTER TABLE focus_history RENAME COLUMN email TO user_email;
    END IF;

    -- 2. Pastikan kolom user_email ada
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='focus_history' AND column_name='user_email') THEN
        ALTER TABLE focus_history ADD COLUMN user_email TEXT;
    END IF;
END $$;

-- Reset Policies agar UPSERT lancar
DROP POLICY IF EXISTS "Users can insert their own focus history" ON focus_history;
CREATE POLICY "Users can insert their own focus history" ON focus_history 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own focus history" ON focus_history;
CREATE POLICY "Users can update their own focus history" ON focus_history 
FOR UPDATE USING (auth.uid() = user_id);
