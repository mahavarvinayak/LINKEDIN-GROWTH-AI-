-- Add referral columns to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referral_points INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id);

-- Create referrals tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reward_status TEXT DEFAULT 'pending' CHECK (reward_status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT
);

CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS referrals_referred_id_idx ON public.referrals(referred_id);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can only see referrals where they are the referrer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'referrals'
      AND policyname = 'Users can view own referrals'
  ) THEN
    CREATE POLICY "Users can view own referrals"
      ON public.referrals FOR SELECT
      TO authenticated
      USING (auth.uid() = referrer_id);
  END IF;
END $$;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- First try deterministic code from user UUID
  v_code := 'REF_' || UPPER(REPLACE(SUBSTRING(p_user_id::TEXT, 1, 8), '-', ''));

  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE referral_code = v_code
  ) THEN
    RETURN v_code;
  END IF;

  -- Fallback random code on collision
  LOOP
    v_code := 'REF_' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.users WHERE referral_code = v_code
    );
  END LOOP;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-generate referral code on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id, email, full_name, persona_complete,
    daily_analyze_count, daily_generate_count, daily_reset_date,
    referral_code, referral_points
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    false, 0, 0, CURRENT_DATE,
    public.generate_referral_code(new.id),
    0
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process a referral signup
CREATE OR REPLACE FUNCTION public.process_referral(p_referred_id UUID, p_referral_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
WITH normalized AS (
  SELECT
    p_referred_id AS referred_id,
    UPPER(TRIM(COALESCE(p_referral_code, ''))) AS referral_code
),
referrer AS (
  SELECT
    u.id AS referrer_id,
    n.referred_id
  FROM public.users u
  JOIN normalized n ON u.referral_code = n.referral_code
  WHERE n.referred_id IS NOT NULL
    AND n.referral_code <> ''
    AND u.id <> n.referred_id
  LIMIT 1
),
inserted AS (
  INSERT INTO public.referrals (referrer_id, referred_id)
  SELECT r.referrer_id, r.referred_id
  FROM referrer r
  ON CONFLICT (referred_id) DO NOTHING
  RETURNING referrer_id, referred_id
),
update_referred AS (
  UPDATE public.users u
  SET referral_points = COALESCE(u.referral_points, 0) + 1,
      referred_by = i.referrer_id
  FROM inserted i
  WHERE u.id = i.referred_id
  RETURNING 1
),
update_referrer AS (
  UPDATE public.users u
  SET referral_points = COALESCE(u.referral_points, 0) + 1
  FROM inserted i
  WHERE u.id = i.referrer_id
  RETURNING 1
)
SELECT EXISTS(SELECT 1 FROM inserted);
$$;
