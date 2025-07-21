
-- Create coupons table for admin to manage discount coupons
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'fixed', -- 'fixed' or 'percentage'
  discount_amount NUMERIC NOT NULL,
  course_restrictions TEXT[] DEFAULT NULL, -- Array of course IDs that this coupon applies to (NULL means all courses)
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_limit INTEGER DEFAULT NULL, -- NULL means unlimited usage
  used_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- NULL means no expiry
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on coupons table
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage coupons
CREATE POLICY "Admins can manage coupons" 
  ON public.coupons 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Allow users to view active coupons (for validation)
CREATE POLICY "Users can view active coupons" 
  ON public.coupons 
  FOR SELECT 
  USING (is_active = true);

-- Create index for faster coupon code lookups
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(is_active);
