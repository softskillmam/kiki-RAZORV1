
-- Add referral_code and referred_by columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN referral_code TEXT UNIQUE,
ADD COLUMN referred_by UUID REFERENCES public.profiles(id);

-- Create index for better performance on referral code lookups
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by);

-- Create referrals table to track referral statistics
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES public.profiles(id) NOT NULL,
  referred_user_id UUID REFERENCES public.profiles(id) NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  referral_bonus NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_user_id)
);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for referrals table
CREATE POLICY "Users can view their own referrals" 
  ON public.referrals 
  FOR SELECT 
  USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referrals" 
  ON public.referrals 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can manage all referrals" 
  ON public.referrals 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a 8-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to handle referral creation when a user signs up
CREATE OR REPLACE FUNCTION handle_referral_signup()
RETURNS TRIGGER AS $$
DECLARE
  referrer_profile_id UUID;
  ref_code TEXT;
BEGIN
  -- Generate referral code for new user
  NEW.referral_code := generate_referral_code();
  
  -- If user was referred, find the referrer and create referral record
  IF NEW.referred_by IS NOT NULL THEN
    -- Create referral record
    INSERT INTO public.referrals (referrer_id, referred_user_id, status)
    VALUES (NEW.referred_by, NEW.id, 'pending');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to generate referral code and handle referrals on profile creation
CREATE TRIGGER on_profile_created_referral
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_signup();

-- Function to update referral status when referred user makes first purchase
CREATE OR REPLACE FUNCTION handle_referral_purchase()
RETURNS TRIGGER AS $$
DECLARE
  referral_record RECORD;
BEGIN
  -- Only process when order status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Check if this user was referred and if this is their first purchase
    SELECT r.* INTO referral_record
    FROM public.referrals r
    WHERE r.referred_user_id = NEW.user_id 
      AND r.status = 'pending'
      AND r.order_id IS NULL;
    
    IF FOUND THEN
      -- Update referral record with order info and mark as completed
      UPDATE public.referrals 
      SET 
        order_id = NEW.id,
        status = 'completed',
        referral_bonus = NEW.total_amount * 0.1, -- 10% referral bonus
        updated_at = now()
      WHERE id = referral_record.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update referral when referred user makes purchase
CREATE TRIGGER on_order_confirmed_referral
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_purchase();
