
-- Create a storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-screenshots', 'payment-screenshots', true);

-- Create storage policies for payment screenshots
CREATE POLICY "Users can upload their own payment screenshots" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'payment-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own payment screenshots" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'payment-screenshots' 
  AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin(auth.uid()))
);

CREATE POLICY "Users can update their own payment screenshots" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'payment-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all payment screenshots" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'payment-screenshots' AND is_admin(auth.uid()));

-- Create notifications table for admin alerts
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'enrollment_request', 'payment_submitted', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  order_id UUID REFERENCES public.orders(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (is_admin(auth.uid()));

-- Create function to create notification when order is submitted
CREATE OR REPLACE FUNCTION public.create_enrollment_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile profiles%ROWTYPE;
BEGIN
  -- Get user profile information
  SELECT * INTO user_profile 
  FROM profiles 
  WHERE id = NEW.user_id;
  
  -- Create notification for admins
  INSERT INTO notifications (
    type,
    title,
    message,
    user_id,
    order_id
  ) VALUES (
    'enrollment_request',
    'New Enrollment Request',
    'New enrollment request from ' || COALESCE(user_profile.full_name, user_profile.email) || ' for amount ₹' || NEW.total_amount,
    NEW.user_id,
    NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for enrollment notifications
CREATE TRIGGER on_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_enrollment_notification();
