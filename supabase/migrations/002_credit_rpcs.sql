-- RPC to decrement analyze credits and return new count
CREATE OR REPLACE FUNCTION decrement_analyze_credits(user_id UUID)
RETURNS INT AS $$
DECLARE
  new_credits INT;
BEGIN
  UPDATE public.users
  SET credits_analyze = GREATEST(0, credits_analyze - 1)
  WHERE id = user_id
  RETURNING credits_analyze INTO new_credits;
  
  RETURN COALESCE(new_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to decrement generate credits and return new count
CREATE OR REPLACE FUNCTION decrement_generate_credits(user_id UUID)
RETURNS INT AS $$
DECLARE
  new_credits INT;
BEGIN
  UPDATE public.users
  SET credits_generate = GREATEST(0, credits_generate - 1)
  WHERE id = user_id
  RETURNING credits_generate INTO new_credits;
  
  RETURN COALESCE(new_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
