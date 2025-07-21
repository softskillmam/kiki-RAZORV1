
-- Create MBTI enum type for the 16 personality types
CREATE TYPE mbti_type AS ENUM (
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP', 
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
);

-- Create table to store MBTI quiz results
CREATE TABLE public.mbti_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  mbti_type mbti_type NOT NULL,
  extraversion_score INTEGER NOT NULL DEFAULT 0,
  sensing_score INTEGER NOT NULL DEFAULT 0,
  thinking_score INTEGER NOT NULL DEFAULT 0,
  judging_score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 48,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for career recommendations based on MBTI types
CREATE TABLE public.career_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mbti_type mbti_type NOT NULL,
  career_title TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for course recommendations based on MBTI types
CREATE TABLE public.course_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mbti_type mbti_type NOT NULL,
  skill_title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for MBTI results
ALTER TABLE public.mbti_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own MBTI results" 
  ON public.mbti_results 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MBTI results" 
  ON public.mbti_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MBTI results" 
  ON public.mbti_results 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add RLS policies for career recommendations (public read access)
ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view career recommendations" 
  ON public.career_recommendations 
  FOR SELECT 
  USING (true);

-- Add RLS policies for course recommendations (public read access)
ALTER TABLE public.course_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view course recommendations" 
  ON public.course_recommendations 
  FOR SELECT 
  USING (true);

-- Insert sample career recommendations for different MBTI types
INSERT INTO public.career_recommendations (mbti_type, career_title, description, industry) VALUES
-- INTJ recommendations
('INTJ', 'Software Architect', 'Design and oversee complex software systems', 'Technology'),
('INTJ', 'Strategic Consultant', 'Provide high-level business strategy advice', 'Consulting'),
('INTJ', 'Research Scientist', 'Conduct independent research in specialized fields', 'Science & Research'),

-- ENFP recommendations
('ENFP', 'Marketing Manager', 'Create engaging campaigns and brand strategies', 'Marketing'),
('ENFP', 'Human Resources Manager', 'Foster positive workplace culture and employee development', 'Human Resources'),
('ENFP', 'Creative Director', 'Lead creative teams and innovative projects', 'Creative Industries'),

-- ISTJ recommendations
('ISTJ', 'Project Manager', 'Plan and execute projects with attention to detail', 'Various Industries'),
('ISTJ', 'Accountant', 'Manage financial records and ensure compliance', 'Finance'),
('ISTJ', 'Operations Manager', 'Oversee daily business operations efficiently', 'Operations');

-- Insert sample course recommendations
INSERT INTO public.course_recommendations (mbti_type, skill_title, description, category) VALUES
-- INTJ recommendations
('INTJ', 'Strategic Planning', 'Learn to develop long-term business strategies', 'Business Strategy'),
('INTJ', 'System Design', 'Master the art of designing scalable systems', 'Technology'),

-- ENFP recommendations
('ENFP', 'Creative Writing', 'Enhance your storytelling and communication skills', 'Creative Skills'),
('ENFP', 'Digital Marketing', 'Learn modern marketing techniques and tools', 'Marketing'),

-- ISTJ recommendations
('ISTJ', 'Project Management', 'Master project planning and execution methodologies', 'Management'),
('ISTJ', 'Data Analysis', 'Learn to analyze and interpret business data', 'Analytics');

-- Update profiles table to track MBTI quiz completion
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mbti_quiz_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_mbti_reminder BOOLEAN DEFAULT TRUE;

-- Add a special course for MBTI personality test
INSERT INTO public.courses (
  id,
  title,
  description, 
  price,
  original_price,
  duration,
  category,
  age_range,
  mode,
  image_url,
  status
) VALUES (
  gen_random_uuid(),
  'MBTI Personality Test',
  'Discover your personality type with our comprehensive 48-question MBTI assessment. Get personalized career and course recommendations based on your results.',
  500.00,
  500.00,
  '30 minutes',
  'Assessment',
  '16+ years', 
  'Online',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80',
  'active'
) ON CONFLICT DO NOTHING;
