
-- First, let's check what content types are currently allowed and update them
-- Drop the existing check constraint if it exists
ALTER TABLE public.course_contents DROP CONSTRAINT IF EXISTS course_contents_type_check;

-- Add a more flexible check constraint for content types
ALTER TABLE public.course_contents ADD CONSTRAINT course_contents_type_check 
  CHECK (type IN ('video', 'document', 'quiz', 'text', 'image', 'link'));

-- Update the validate_file_url function to be more flexible
CREATE OR REPLACE FUNCTION public.validate_file_url(url TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if URL is not null and has valid format
  IF url IS NULL OR url = '' THEN
    RETURN TRUE; -- Allow empty URLs since content_url is nullable
  END IF;
  
  -- Check if URL starts with http or https
  IF NOT (url ILIKE 'http://%' OR url ILIKE 'https://%') THEN
    RETURN FALSE;
  END IF;
  
  -- Check for supported file extensions and platforms
  IF url ILIKE '%.pdf' OR 
     url ILIKE '%.ppt' OR 
     url ILIKE '%.pptx' OR 
     url ILIKE '%.doc' OR 
     url ILIKE '%.docx' OR
     url ILIKE '%.mp4' OR
     url ILIKE '%.avi' OR
     url ILIKE '%.mov' OR
     url ILIKE '%.wmv' OR
     url ILIKE '%.jpg' OR
     url ILIKE '%.jpeg' OR
     url ILIKE '%.png' OR
     url ILIKE '%.gif' OR
     url ILIKE '%youtube.com%' OR
     url ILIKE '%youtu.be%' OR
     url ILIKE '%drive.google.com%' OR
     url ILIKE '%dropbox.com%' OR
     url ILIKE '%onedrive.live.com%' OR
     url ILIKE '%sharepoint.com%' OR
     url ILIKE '%view.officeapps.live.com%' THEN
    RETURN TRUE;
  END IF;
  
  -- For any other URL, allow it (more permissive approach)
  RETURN TRUE;
END;
$$;
