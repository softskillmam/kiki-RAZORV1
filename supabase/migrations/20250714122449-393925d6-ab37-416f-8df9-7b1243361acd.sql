
-- Add trusted partners/institutions to the homepage_content table
-- We'll use a new section_name called 'trusted_partners'
INSERT INTO public.homepage_content (section_name, title, description, image_url, link_url, order_index) VALUES
('trusted_partners', 'Madurai Kamaraj University', 'Leading University in Tamil Nadu', 'https://raw.githubusercontent.com/softskillmam/kiki-learn-grow-21/main/public/lovable-uploads/b39e0e16-a383-4d82-ab0f-0e9a52835b1d.png', 'https://mkuniversity.ac.in/', 1),
('trusted_partners', 'Kalasalingam University', 'Excellence in Engineering & Technology', 'https://raw.githubusercontent.com/softskillmam/kiki-learn-grow-21/main/public/lovable-uploads/b39e0e16-a383-4d82-ab0f-0e9a52835b1d.png', 'https://kalasalingam.ac.in/', 2),
('trusted_partners', 'Tamil Nadu Skill Development', 'Government Skills Initiative', 'https://raw.githubusercontent.com/softskillmam/kiki-learn-grow-21/main/public/lovable-uploads/b39e0e16-a383-4d82-ab0f-0e9a52835b1d.png', 'https://www.skillmissiontn.gov.in/', 3);

-- Add a section header for trusted partners
INSERT INTO public.homepage_content (section_name, title, description, order_index) VALUES
('trusted_partners_header', 'Globally Trusted Partners', 'Globally trusted for delivering impactful learning outcomes', 0);
