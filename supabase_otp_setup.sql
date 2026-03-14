-- =============================================
-- CoreInventory IMS: Password Reset OTP Setup
-- Run this ONCE in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- =============================================

-- 1. Enable pgcrypto (usually already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create OTP storage table
CREATE TABLE IF NOT EXISTS public.password_reset_otps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- 4. Allow anonymous access (needed for forgot password flow)
CREATE POLICY "Allow anon insert" ON public.password_reset_otps
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select" ON public.password_reset_otps
  FOR SELECT USING (true);
CREATE POLICY "Allow anon update" ON public.password_reset_otps
  FOR UPDATE USING (true);

-- 5. Create the password reset function (runs with elevated privileges)
CREATE OR REPLACE FUNCTION public.handle_password_reset(
  user_email TEXT,
  new_pass TEXT,
  otp_code TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  valid_otp RECORD;
BEGIN
  -- Verify OTP exists and is valid
  SELECT * INTO valid_otp
  FROM public.password_reset_otps
  WHERE email = user_email
    AND otp = otp_code
    AND used = false
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF valid_otp IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired OTP');
  END IF;

  -- Mark OTP as used
  UPDATE public.password_reset_otps SET used = true WHERE id = valid_otp.id;

  -- Find the user
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Update password securely
  UPDATE auth.users
  SET encrypted_password = crypt(new_pass, gen_salt('bf'))
  WHERE id = target_user_id;

  -- Clean up expired OTPs
  DELETE FROM public.password_reset_otps
  WHERE expires_at < now() OR used = true;

  RETURN json_build_object('success', true);
END;
$$;
