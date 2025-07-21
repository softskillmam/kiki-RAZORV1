-- Insert the TEST495 coupon for MBTI test if it doesn't exist
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
)
ON CONFLICT (code) DO UPDATE SET
  discount_amount = EXCLUDED.discount_amount,
  discount_type = EXCLUDED.discount_type,
  course_restrictions = EXCLUDED.course_restrictions,
  is_active = EXCLUDED.is_active,
  valid_from = EXCLUDED.valid_from,
  valid_until = EXCLUDED.valid_until,
  updated_at = now();