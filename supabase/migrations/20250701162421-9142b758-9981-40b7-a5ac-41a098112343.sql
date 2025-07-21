
-- Create enum types for better data consistency
CREATE TYPE public.course_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE public.enrollment_status AS ENUM ('enrolled', 'completed', 'dropped', 'pending');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.user_role AS ENUM ('student', 'admin', 'instructor');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role user_role DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  duration TEXT,
  instructor_id UUID REFERENCES public.profiles(id),
  status course_status DEFAULT 'active',
  category TEXT,
  age_range TEXT,
  mode TEXT, -- 'online', 'offline', 'hybrid'
  total_lessons INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enrollments table for student course enrollments
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  status enrollment_status DEFAULT 'enrolled',
  progress INTEGER DEFAULT 0, -- 0-100 percentage
  completed_lessons INTEGER DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  next_class_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

-- Create payments table for UPI transactions
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT DEFAULT 'UPI',
  upi_transaction_id TEXT,
  payment_status payment_status DEFAULT 'pending',
  payment_gateway TEXT, -- 'razorpay', 'phonepe', 'googlepay', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for courses
CREATE POLICY "Anyone can view active courses" ON public.courses
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage all courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for enrollments
CREATE POLICY "Students can view their own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can manage all enrollments" ON public.enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for payments
CREATE POLICY "Students can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enable realtime for tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.courses REPLICA IDENTITY FULL;
ALTER TABLE public.enrollments REPLICA IDENTITY FULL;
ALTER TABLE public.payments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;

-- Insert sample courses data
INSERT INTO public.courses (title, description, image_url, price, original_price, duration, category, age_range, mode, total_lessons) VALUES
('Spoken English Class', 'Master fluent English communication and build confidence in speaking', '/lovable-uploads/ab749e7b-7e24-4d9e-b411-43bc73b0ed39.png', 1999.00, 2999.00, '8 weeks', 'Language', '10+ years', 'Hybrid', 20),
('Personality Development', 'Transform your personality and build lasting confidence', '/lovable-uploads/8b5de2fa-aca2-40f2-9170-0af6794ef7fc.png', 3999.00, 5499.00, '6 weeks', 'Personal', '15+ years', 'Hybrid', 12),
('Public Speaking', 'Overcome stage fear and become a confident public speaker', '/lovable-uploads/9a4c6801-fcf4-4a3e-958c-116d313d908d.png', 2499.00, 3499.00, '3 weeks', 'Communication', '12+ years', 'Offline', 8),
('Art & Craft Classes', 'Express creativity through various art forms and hands-on craft projects', 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=400&q=80', 2999.00, 3999.00, '6 weeks', 'Arts', '6-16 years', 'Offline', 15),
('Soft Skill Training', 'Develop essential soft skills for personal and professional success', '/lovable-uploads/d25e1c5a-1fb9-4781-add1-43899f865741.png', 3499.00, 4999.00, '4 weeks', 'Professional', '15+ years', 'Online', 10);
