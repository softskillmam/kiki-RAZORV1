
-- Remove referral-related columns from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS referral_code;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS referred_by;

-- Drop referrals table completely
DROP TABLE IF EXISTS public.referrals CASCADE;

-- Drop the problematic trigger and function
DROP TRIGGER IF EXISTS on_profile_created_referral ON public.profiles;
DROP FUNCTION IF EXISTS handle_referral_signup();
DROP FUNCTION IF EXISTS generate_referral_code();
DROP FUNCTION IF EXISTS handle_referral_purchase();
DROP TRIGGER IF EXISTS on_order_confirmed_referral ON public.orders;

-- Ensure we have a clean handle_new_user function
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a simple user profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url,
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    'student'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
