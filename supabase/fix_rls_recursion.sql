-- =============================================
-- Fix: Infinite recursion in profiles RLS policies
-- Run this in your Supabase SQL Editor
-- =============================================

-- Step 1: Create a SECURITY DEFINER function to check admin status
-- This bypasses RLS, breaking the infinite recursion loop
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Step 2: Drop the old recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all wins" ON public.winners;
DROP POLICY IF EXISTS "Admins can insert wins" ON public.winners;
DROP POLICY IF EXISTS "Admins can insert draws" ON public.draws;

-- Step 3: Recreate policies using the safe function
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all wins" ON public.winners
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert wins" ON public.winners
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can insert draws" ON public.draws
  FOR INSERT WITH CHECK (public.is_admin());
