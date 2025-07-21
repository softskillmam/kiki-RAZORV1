
-- Create coupons table to store coupon information
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_amount NUMERIC NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'fixed', -- 'fixed' or 'percentage'
  course_restrictions TEXT[], -- Array of course IDs this coupon applies to
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_limit INTEGER DEFAULT NULL, -- NULL means unlimited
  used_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view active coupons
CREATE POLICY "Users can view active coupons" ON public.coupons
FOR SELECT
USING (is_active = true);

-- Create policy for admins to manage coupons
CREATE POLICY "Admins can manage coupons" ON public.coupons
FOR ALL
USING (is_admin(auth.uid()));

-- Insert the TEST495 coupon for MBTI test
INSERT INTO public.coupons (
  code,
  discount_amount,
  discount_type,
  course_restrictions,
  is_active,
  usage_limit,
  valid_from,
  valid_until
) VALUES (
  'TEST495',
  495,
  'fixed',
  ARRAY['a1b2c3d4-e5f6-7890-abcd-ef1234567890'], -- MBTI course ID
  true,
  NULL, -- Unlimited usage for now
  now(),
  NULL -- No expiry date
);
