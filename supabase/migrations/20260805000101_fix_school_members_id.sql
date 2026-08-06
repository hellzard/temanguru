-- Fix migration: Add id column to school_members, create alias for trigger function
-- This migration must run BEFORE events_and_meetings, operations, and portfolios_connect

-- 1. Add a surrogate `id` column to school_members so FK references work
ALTER TABLE public.school_members
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() UNIQUE;

-- Backfill any existing rows that might have NULL id
UPDATE public.school_members SET id = gen_random_uuid() WHERE id IS NULL;

-- Make id NOT NULL after backfill
ALTER TABLE public.school_members ALTER COLUMN id SET NOT NULL;

-- 2. Create alias function so Wave 7-9 triggers work
-- The initial schema defines touch_updated_at(), but Wave 7-9 migrations call update_updated_at_column()
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
