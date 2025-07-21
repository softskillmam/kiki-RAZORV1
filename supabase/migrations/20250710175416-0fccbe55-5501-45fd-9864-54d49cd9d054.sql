
-- Ensure proper RLS policies for course_contents table
ALTER TABLE public.course_contents ENABLE ROW LEVEL SECURITY;

-- Policy for students to view course content they're enrolled in
CREATE POLICY "Students can view content of enrolled courses" 
  ON public.course_contents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.course_sections cs ON cs.course_id = e.course_id
      WHERE cs.id = course_contents.section_id
      AND e.student_id = auth.uid()
      AND e.status = 'enrolled'
    )
  );

-- Policy for admins and instructors to view all content
CREATE POLICY "Admins and instructors can view all content" 
  ON public.course_contents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'instructor')
    )
  );

-- Policy for admins and instructors to insert content
CREATE POLICY "Admins and instructors can insert content" 
  ON public.course_contents 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'instructor')
    )
  );

-- Policy for admins and instructors to update content
CREATE POLICY "Admins and instructors can update content" 
  ON public.course_contents 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'instructor')
    )
  );

-- Policy for admins and instructors to delete content
CREATE POLICY "Admins and instructors can delete content" 
  ON public.course_contents 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'instructor')
    )
  );

-- Ensure course_sections has proper RLS policies
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;

-- Policy for students to view sections of enrolled courses
CREATE POLICY "Students can view sections of enrolled courses" 
  ON public.course_sections 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = course_sections.course_id
      AND e.student_id = auth.uid()
      AND e.status = 'enrolled'
    )
  );

-- Policy for admins and instructors to view all sections
CREATE POLICY "Admins and instructors can view all sections" 
  ON public.course_sections 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'instructor')
    )
  );

-- Policy for admins and instructors to manage sections
CREATE POLICY "Admins and instructors can manage sections" 
  ON public.course_sections 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'instructor')
    )
  );

-- Function to validate file URLs
CREATE OR REPLACE FUNCTION public.validate_file_url(url TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if URL is not null and has valid format
  IF url IS NULL OR url = '' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if URL starts with http or https
  IF NOT (url ILIKE 'http://%' OR url ILIKE 'https://%') THEN
    RETURN FALSE;
  END IF;
  
  -- Check for supported file extensions
  IF url ILIKE '%.pdf' OR 
     url ILIKE '%.ppt' OR 
     url ILIKE '%.pptx' OR 
     url ILIKE '%.doc' OR 
     url ILIKE '%.docx' OR
     url ILIKE '%youtube.com%' OR
     url ILIKE '%youtu.be%' OR
     url ILIKE '%drive.google.com%' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Add trigger to validate content URLs before insert/update
CREATE OR REPLACE FUNCTION public.validate_content_url()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Skip validation if content_url is null (optional content)
  IF NEW.content_url IS NOT NULL THEN
    IF NOT public.validate_file_url(NEW.content_url) THEN
      RAISE EXCEPTION 'Invalid file URL format or unsupported file type';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for URL validation
DROP TRIGGER IF EXISTS validate_content_url_trigger ON public.course_contents;
CREATE TRIGGER validate_content_url_trigger
  BEFORE INSERT OR UPDATE ON public.course_contents
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_content_url();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_contents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_sections TO authenticated;
GRANT SELECT ON public.courses TO authenticated;
GRANT SELECT ON public.enrollments TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;

-- Grant execute permission on validation function
GRANT EXECUTE ON FUNCTION public.validate_file_url(TEXT) TO authenticated;
