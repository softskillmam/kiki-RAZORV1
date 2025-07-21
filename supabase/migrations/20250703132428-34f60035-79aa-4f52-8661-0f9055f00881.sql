
-- Create course_sections table
CREATE TABLE public.course_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_contents table
CREATE TABLE public.course_contents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES public.course_sections(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'document', 'quiz')),
  content_url TEXT,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for course_sections
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view course sections" 
  ON public.course_sections 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage course sections" 
  ON public.course_sections 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Add RLS policies for course_contents
ALTER TABLE public.course_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view course contents" 
  ON public.course_contents 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage course contents" 
  ON public.course_contents 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_course_sections_course_id ON public.course_sections(course_id);
CREATE INDEX idx_course_sections_order ON public.course_sections(course_id, order_index);
CREATE INDEX idx_course_contents_section_id ON public.course_contents(section_id);
CREATE INDEX idx_course_contents_order ON public.course_contents(section_id, order_index);
