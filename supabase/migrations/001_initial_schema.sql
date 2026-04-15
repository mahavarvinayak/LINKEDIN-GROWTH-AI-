-- 1. Create tables
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro')),
  credits_analyze INT DEFAULT 3,
  credits_generate INT DEFAULT 2,
  streak_count INT DEFAULT 0,
  last_posted_at DATE,
  persona_complete BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('student', 'founder', 'freelancer', 'job_seeker')),
  topics TEXT[],
  goal TEXT CHECK (goal IN ('followers', 'leads', 'job', 'brand')),
  tone TEXT CHECK (tone IN ('bold', 'story', 'educational', 'casual')),
  audience TEXT CHECK (audience IN ('students', 'founders', 'recruiters')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('analyzed', 'generated', 'draft')),
  original_content TEXT,
  improved_content TEXT,
  topic TEXT,
  hook_score INT,
  readability_score INT,
  engagement_score INT,
  structure_score INT,
  overall_score FLOAT,
  top_problems TEXT[],
  improvement_summary TEXT,
  is_saved BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  posts_created INT DEFAULT 0,
  posts_analyzed INT DEFAULT 0,
  avg_score_before FLOAT,
  avg_score_after FLOAT,
  streak_at_end INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage their own persona" ON public.personas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own posts" ON public.posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own reports" ON public.weekly_reports FOR SELECT USING (auth.uid() = user_id);

-- 4. Create Indexes
CREATE INDEX users_email_idx ON public.users(email);
CREATE INDEX personas_user_id_idx ON public.personas(user_id);
CREATE INDEX posts_user_id_idx ON public.posts(user_id);
CREATE INDEX weekly_reports_user_id_idx ON public.weekly_reports(user_id);

-- 5. Auto-create User Trigger (Sync Auth to Public Users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, persona_complete)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
