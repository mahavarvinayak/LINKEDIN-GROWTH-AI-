-- Increase free tier generation limit from 1/day to 2/day.
-- Keeps starter/pro limits unchanged.
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
    ELSE 2  -- free
  END;

  -- Get current usage
  SELECT daily_generate_count, daily_reset_date
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
  SET daily_generate_count = daily_generate_count + 1
  WHERE id = p_user_id;

  RETURN json_build_object('allowed', true, 'used', v_current_count + 1, 'limit', v_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
