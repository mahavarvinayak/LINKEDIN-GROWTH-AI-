-- Remove old lifetime credit columns
ALTER TABLE public.users 
  DROP COLUMN IF EXISTS credits_analyze,
  DROP COLUMN IF EXISTS credits_generate;

-- Add daily usage tracking columns
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS daily_analyze_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_generate_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_reset_date DATE DEFAULT CURRENT_DATE;

-- Update handle_new_user trigger to include new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id, email, full_name, persona_complete,
    daily_analyze_count, daily_generate_count, daily_reset_date
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    false, 0, 0, CURRENT_DATE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Check and increment daily analyze usage
-- Returns: { allowed: boolean, used: number, limit: number }
CREATE OR REPLACE FUNCTION check_and_increment_analyze(p_user_id UUID, p_plan TEXT)
RETURNS JSON AS $$
DECLARE
  v_limit INT;
  v_current_count INT;
  v_reset_date DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Set limit based on plan
  v_limit := CASE p_plan
    WHEN 'pro'     THEN 15
    WHEN 'starter' THEN 5
    ELSE 2  -- free
  END;

  -- Get current usage
  SELECT daily_analyze_count, daily_reset_date
  INTO v_current_count, v_reset_date
  FROM public.users
  WHERE id = p_user_id;

  -- Reset if new day
  IF v_reset_date < v_today THEN
    UPDATE public.users
    SET daily_analyze_count = 0,
        daily_generate_count = 0,
        daily_reset_date = v_today
    WHERE id = p_user_id;
    v_current_count := 0;
  END IF;

  -- Check limit
  IF v_current_count >= v_limit THEN
    RETURN json_build_object('allowed', false, 'used', v_current_count, 'limit', v_limit);
  END IF;

  -- Increment and allow
  UPDATE public.users
  SET daily_analyze_count = daily_analyze_count + 1
  WHERE id = p_user_id;

  RETURN json_build_object('allowed', true, 'used', v_current_count + 1, 'limit', v_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Check and increment daily generate usage
CREATE OR REPLACE FUNCTION check_and_increment_generate(p_user_id UUID, p_plan TEXT)
RETURNS JSON AS $$
DECLARE
  v_limit INT;
  v_current_count INT;
  v_reset_date DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Set limit based on plan
  v_limit := CASE p_plan
    WHEN 'pro'     THEN 10
    WHEN 'starter' THEN 5
    ELSE 1  -- free
  END;

  -- Get current usage
  SELECT daily_generate_count, daily_reset_date
  INTO v_current_count, v_reset_date
  FROM public.users
  WHERE id = p_user_id;

  -- Reset if new day (might already be reset by analyze call, that's fine)
  IF v_reset_date < v_today THEN
    UPDATE public.users
    SET daily_analyze_count = 0,
        daily_generate_count = 0,
        daily_reset_date = v_today
    WHERE id = p_user_id;
    v_current_count := 0;
  END IF;

  -- Check limit
  IF v_current_count >= v_limit THEN
    RETURN json_build_object('allowed', false, 'used', v_current_count, 'limit', v_limit);
  END IF;

  -- Increment and allow
  UPDATE public.users
  SET daily_generate_count = daily_generate_count + 1
  WHERE id = p_user_id;

  RETURN json_build_object('allowed', true, 'used', v_current_count + 1, 'limit', v_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
