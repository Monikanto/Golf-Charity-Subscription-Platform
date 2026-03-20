-- =============================================
-- Golf Charity Subscription Platform - Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Charities table
CREATE TABLE IF NOT EXISTS public.charities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'cancelled')),
  charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
  charity_percentage INTEGER DEFAULT 0 CHECK (charity_percentage >= 0 AND charity_percentage <= 100),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Scores table
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Draws table
CREATE TABLE IF NOT EXISTS public.draws (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numbers INTEGER[] NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Winners table
CREATE TABLE IF NOT EXISTS public.winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
  matched_numbers INTEGER[] NOT NULL,
  match_count INTEGER NOT NULL,
  reward_tier TEXT CHECK (reward_tier IN ('jackpot', 'mid', 'small')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Helper function for admin checks (avoids RLS recursion)
-- =============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Profiles: admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Scores: users can CRUD their own scores
CREATE POLICY "Users can view own scores" ON public.scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON public.scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores" ON public.scores
  FOR DELETE USING (auth.uid() = user_id);

-- Draws: everyone can view draws
CREATE POLICY "Anyone can view draws" ON public.draws
  FOR SELECT USING (true);

-- Draws: only admins can insert draws
CREATE POLICY "Admins can insert draws" ON public.draws
  FOR INSERT WITH CHECK (public.is_admin());

-- Winners: users can view their own wins
CREATE POLICY "Users can view own wins" ON public.winners
  FOR SELECT USING (auth.uid() = user_id);

-- Winners: admins can view all wins
CREATE POLICY "Admins can view all wins" ON public.winners
  FOR SELECT USING (public.is_admin());

-- Winners: admins can insert wins
CREATE POLICY "Admins can insert wins" ON public.winners
  FOR INSERT WITH CHECK (public.is_admin());

-- Charities: everyone can view charities
CREATE POLICY "Anyone can view charities" ON public.charities
  FOR SELECT USING (true);

-- =============================================
-- Auto-create profile on signup (trigger)
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Seed charities
-- =============================================

INSERT INTO public.charities (name, description, image_url) VALUES
  ('Golf for Good', 'Supporting underprivileged youth through golf programs and scholarships.', '/charities/golf-for-good.jpg'),
  ('Green Earth Foundation', 'Preserving golf course ecosystems and promoting sustainable land management.', '/charities/green-earth.jpg'),
  ('Swing for Hope', 'Providing mental health support and wellness programs through sports.', '/charities/swing-hope.jpg'),
  ('Fairway Dreams', 'Building golf facilities in underserved communities worldwide.', '/charities/fairway-dreams.jpg'),
  ('The First Tee', 'Introducing golf and its values to young people across the globe.', '/charities/first-tee.jpg');
