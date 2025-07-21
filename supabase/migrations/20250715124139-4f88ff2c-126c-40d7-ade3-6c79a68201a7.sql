
-- Update the foreign key constraint on orders table to CASCADE on delete
-- This will automatically delete orders when a user is deleted
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.orders ADD CONSTRAINT orders_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also update other tables that might reference users
-- Update referrals table constraints
ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey;
ALTER TABLE public.referrals ADD CONSTRAINT referrals_referrer_id_fkey 
  FOREIGN KEY (referrer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_referred_user_id_fkey;
ALTER TABLE public.referrals ADD CONSTRAINT referrals_referred_user_id_fkey 
  FOREIGN KEY (referred_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
