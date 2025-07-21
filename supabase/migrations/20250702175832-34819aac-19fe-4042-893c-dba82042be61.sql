
-- Create orders table to track cart purchases
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
  payment_method TEXT DEFAULT 'UPI',
  upi_app TEXT, -- googlepay, phonepe, paytm, bhim
  payment_screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table to track individual courses in an order
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" 
  ON public.orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
  ON public.orders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add RLS policies for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items" 
  ON public.order_items 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own order items" 
  ON public.order_items 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-screenshots', 'payment-screenshots', true);

-- Create storage policy for payment screenshots
CREATE POLICY "Users can upload payment screenshots" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'payment-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view payment screenshots" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'payment-screenshots');

CREATE POLICY "Users can update their payment screenshots" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'payment-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
