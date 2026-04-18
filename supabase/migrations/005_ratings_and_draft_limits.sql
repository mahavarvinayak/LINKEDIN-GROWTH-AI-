-- Ratings table (one rating per user)
CREATE TABLE IF NOT EXISTS public.user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  opinion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS user_ratings_created_at_idx ON public.user_ratings(created_at DESC);

ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_ratings'
      AND policyname = 'Authenticated users can read ratings'
  ) THEN
    CREATE POLICY "Authenticated users can read ratings"
      ON public.user_ratings FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_ratings'
      AND policyname = 'Users can insert own rating'
  ) THEN
    CREATE POLICY "Users can insert own rating"
      ON public.user_ratings FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_ratings'
      AND policyname = 'Users can update own rating'
  ) THEN
    CREATE POLICY "Users can update own rating"
      ON public.user_ratings FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Draft storage enforcement by plan
CREATE OR REPLACE FUNCTION public.enforce_draft_limit()
RETURNS trigger AS $$
DECLARE
  v_plan TEXT;
  v_limit INT;
  v_count INT;
BEGIN
  IF NEW.type <> 'draft' THEN
    RETURN NEW;
  END IF;

  SELECT plan INTO v_plan
  FROM public.users
  WHERE id = NEW.user_id;

  IF v_plan IS NULL THEN
    RAISE EXCEPTION 'user_plan_not_found';
  END IF;

  v_limit := CASE v_plan
    WHEN 'pro' THEN 30
    WHEN 'starter' THEN 10
    ELSE 0
  END;

  SELECT COUNT(*) INTO v_count
  FROM public.posts
  WHERE user_id = NEW.user_id
    AND type = 'draft';

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'draft_limit_reached';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_draft_limit ON public.posts;
CREATE TRIGGER trg_enforce_draft_limit
  BEFORE INSERT ON public.posts
  FOR EACH ROW EXECUTE PROCEDURE public.enforce_draft_limit();
