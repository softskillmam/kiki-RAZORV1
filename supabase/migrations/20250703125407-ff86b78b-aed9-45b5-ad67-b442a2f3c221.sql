
-- Add admin policies to orders table so admins can view all orders
CREATE POLICY "Admins can view all orders" 
  ON public.orders 
  FOR SELECT 
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all orders" 
  ON public.orders 
  FOR UPDATE 
  USING (is_admin(auth.uid()));

-- Add admin policies to order_items table so admins can view all order items
CREATE POLICY "Admins can view all order items" 
  ON public.order_items 
  FOR SELECT 
  USING (is_admin(auth.uid()));
