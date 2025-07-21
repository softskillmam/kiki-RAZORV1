
-- Create a table for homepage content management
CREATE TABLE public.homepage_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on homepage_content
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;

-- Create policies for homepage_content
CREATE POLICY "Anyone can view active homepage content" 
    ON public.homepage_content 
    FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Admins can manage homepage content" 
    ON public.homepage_content 
    FOR ALL 
    USING (is_admin(auth.uid()));

-- Insert some sample homepage content
INSERT INTO public.homepage_content (section_name, title, description, image_url, link_url, order_index) VALUES
('hero', 'Transform Your Future with KIKI', 'Master essential soft skills through our comprehensive programs designed for students and professionals.', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', '/programs', 1),
('featured', 'Communication Excellence', 'Develop confident communication skills that open doors to new opportunities.', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '/programs', 2),
('featured', 'Leadership Development', 'Build leadership capabilities that inspire teams and drive success.', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '/programs', 3),
('testimonial', 'Student Success Story', '"KIKI transformed my confidence and helped me land my dream job!"', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', null, 4);
