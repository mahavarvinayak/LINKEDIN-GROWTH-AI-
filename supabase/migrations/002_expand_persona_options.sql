-- 1. Drop existing strict constraints
ALTER TABLE public.personas DROP CONSTRAINT IF EXISTS personas_role_check;
ALTER TABLE public.personas DROP CONSTRAINT IF EXISTS personas_goal_check;
ALTER TABLE public.personas DROP CONSTRAINT IF EXISTS personas_tone_check;
ALTER TABLE public.personas DROP CONSTRAINT IF EXISTS personas_audience_check;

-- 2. Add expanded constraints (allowing more variety + 'other')
ALTER TABLE public.personas ADD CONSTRAINT personas_role_check 
  CHECK (role IN ('student', 'founder', 'freelancer', 'job_seeker', 'influencer', 'product_manager', 'marketing_expert', 'sales_professional', 'creative', 'other'));

ALTER TABLE public.personas ADD CONSTRAINT personas_goal_check 
  CHECK (goal IN ('followers', 'leads', 'job', 'brand', 'networking', 'leadership', 'insights', 'growth', 'other'));

ALTER TABLE public.personas ADD CONSTRAINT personas_tone_check 
  CHECK (tone IN ('bold', 'story', 'educational', 'casual', 'witty', 'data_driven', 'inspirational', 'controversial', 'other'));

ALTER TABLE public.personas ADD CONSTRAINT personas_audience_check 
  CHECK (audience IN ('students', 'founders', 'recruiters', 'engineers', 'executives', 'creatives', 'other'));
