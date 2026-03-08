-- FIX COLUMN NAMES AND POLICIES
DO $$ 
BEGIN
    -- 1. Rename 'email' to 'user_email' jika masih pakai nama lama
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='focus_clients' AND column_name='email') THEN
        ALTER TABLE focus_clients RENAME COLUMN email TO user_email;
    END IF;

    -- 2. Pastikan kolom user_email ada (jika tabel baru kosong)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='focus_clients' AND column_name='user_email') THEN
        ALTER TABLE focus_clients ADD COLUMN user_email TEXT;
    END IF;
END $$;

-- Pastikan RLS mengizinkan UPSERT
DROP POLICY IF EXISTS "Users can insert their own focus client data" ON focus_clients;
CREATE POLICY "Users can insert their own focus client data" ON focus_clients 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own focus client data" ON focus_clients;
CREATE POLICY "Users can update their own focus client data" ON focus_clients 
FOR UPDATE USING (auth.uid() = user_id);
