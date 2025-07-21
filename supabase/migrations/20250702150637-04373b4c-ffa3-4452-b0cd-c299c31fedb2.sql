
-- Drop the problematic admin policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a new admin policy using a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Create new admin policies using the security definer function
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Also fix the courses admin policy
DROP POLICY IF EXISTS "Admins can manage all courses" ON public.courses;
CREATE POLICY "Admins can manage all courses" ON public.courses
  FOR ALL USING (public.is_admin(auth.uid()));

-- Fix the enrollments admin policy
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON public.enrollments;
CREATE POLICY "Admins can manage all enrollments" ON public.enrollments
  FOR ALL USING (public.is_admin(auth.uid()));

-- Fix the payments admin policy
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (public.is_admin(auth.uid()));
