
-- Insert comprehensive career recommendations for all 16 MBTI personality types
INSERT INTO public.career_recommendations (mbti_type, career_title, description, industry) VALUES

-- ESFJ (The Consul) - People-focused, supportive, organized
('ESFJ', 'Human Resources Manager', 'Manage employee relations, recruitment, and workplace culture development', 'Human Resources'),
('ESFJ', 'Elementary School Teacher', 'Educate and nurture young children in foundational subjects', 'Education'),
('ESFJ', 'Registered Nurse', 'Provide patient care and support in healthcare settings', 'Healthcare'),
('ESFJ', 'Social Worker', 'Help individuals and families navigate social services and support systems', 'Social Services'),
('ESFJ', 'Event Coordinator', 'Plan and organize corporate events, weddings, and social gatherings', 'Event Management'),
('ESFJ', 'Customer Service Manager', 'Lead customer support teams and ensure excellent service delivery', 'Customer Service'),

-- ESFP (The Entertainer) - Enthusiastic, creative, people-oriented
('ESFP', 'Marketing Coordinator', 'Create engaging marketing campaigns and coordinate promotional activities', 'Marketing'),
('ESFP', 'Recreation Therapist', 'Use activities and games to help people recover from illness or injury', 'Healthcare'),
('ESFP', 'Fashion Designer', 'Design clothing and accessories, focusing on current trends and aesthetics', 'Fashion'),
('ESFP', 'Tour Guide', 'Lead groups on educational or recreational tours of various locations', 'Tourism'),
('ESFP', 'Child Care Worker', 'Provide care and educational activities for children in various settings', 'Education'),
('ESFP', 'Restaurant Manager', 'Oversee restaurant operations and ensure excellent customer experience', 'Hospitality'),

-- ESTP (The Entrepreneur) - Action-oriented, adaptable, practical
('ESTP', 'Sales Manager', 'Lead sales teams and develop strategies to meet revenue targets', 'Sales'),
('ESTP', 'Emergency Medical Technician', 'Provide emergency medical care and transport patients to hospitals', 'Healthcare'),
('ESTP', 'Real Estate Agent', 'Help clients buy, sell, and rent properties', 'Real Estate'),
('ESTP', 'Police Officer', 'Maintain public safety and enforce laws in communities', 'Law Enforcement'),
('ESTP', 'Restaurant Owner', 'Manage all aspects of restaurant business operations', 'Hospitality'),
('ESTP', 'Personal Trainer', 'Help clients achieve fitness goals through personalized exercise programs', 'Fitness'),

-- ESTJ (The Executive) - Organized, decisive, leadership-focused
('ESTJ', 'Operations Manager', 'Oversee daily business operations and ensure efficiency across departments', 'Operations'),
('ESTJ', 'Bank Manager', 'Manage bank branch operations and customer financial services', 'Finance'),
('ESTJ', 'Military Officer', 'Lead military units and manage strategic operations', 'Military'),
('ESTJ', 'Construction Manager', 'Oversee construction projects from planning to completion', 'Construction'),
('ESTJ', 'School Principal', 'Lead educational institutions and manage academic programs', 'Education'),
('ESTJ', 'Supply Chain Manager', 'Manage logistics and supply chain operations for organizations', 'Logistics'),

-- ISFJ (The Protector) - Caring, detail-oriented, supportive
('ISFJ', 'School Counselor', 'Provide academic and emotional support to students', 'Education'),
('ISFJ', 'Medical Assistant', 'Support healthcare providers and assist with patient care', 'Healthcare'),
('ISFJ', 'Librarian', 'Manage library resources and help patrons find information', 'Education'),
('ISFJ', 'Occupational Therapist', 'Help patients develop or recover skills needed for daily living', 'Healthcare'),
('ISFJ', 'Administrative Assistant', 'Provide organizational and clerical support to executives', 'Administration'),
('ISFJ', 'Veterinary Technician', 'Assist veterinarians in animal care and medical procedures', 'Veterinary'),

-- ISFP (The Adventurer) - Creative, flexible, value-driven
('ISFP', 'Graphic Designer', 'Create visual concepts and designs for various media platforms', 'Design'),
('ISFP', 'Photographer', 'Capture and edit photographs for various purposes and clients', 'Creative Arts'),
('ISFP', 'Physical Therapist', 'Help patients recover from injuries through exercise and treatment', 'Healthcare'),
('ISFP', 'Interior Designer', 'Design and decorate interior spaces for homes and businesses', 'Design'),
('ISFP', 'Chef', 'Create and prepare culinary dishes in restaurants or catering services', 'Culinary Arts'),
('ISFP', 'Art Therapist', 'Use creative arts to help people express emotions and heal', 'Healthcare'),

-- ISTP (The Virtuoso) - Practical, hands-on, problem-solving
('ISTP', 'Mechanical Engineer', 'Design and develop mechanical systems and machinery', 'Engineering'),
('ISTP', 'Computer Programmer', 'Write and test code for software applications and systems', 'Technology'),
('ISTP', 'Electrician', 'Install and maintain electrical systems in buildings and equipment', 'Skilled Trades'),
('ISTP', 'Automotive Technician', 'Diagnose and repair vehicle mechanical and electrical issues', 'Automotive'),
('ISTP', 'Forensic Scientist', 'Analyze physical evidence from crime scenes using scientific methods', 'Science'),
('ISTP', 'Pilot', 'Operate aircraft for commercial, private, or military purposes', 'Aviation'),

-- INFJ (The Advocate) - Insightful, idealistic, purpose-driven
('INFJ', 'Clinical Psychologist', 'Provide therapy and counseling to help people with mental health issues', 'Healthcare'),
('INFJ', 'Writer/Author', 'Create written content including books, articles, and creative works', 'Creative Arts'),
('INFJ', 'Nonprofit Director', 'Lead organizations focused on social causes and community impact', 'Nonprofit'),
('INFJ', 'University Professor', 'Teach and conduct research in academic institutions', 'Education'),
('INFJ', 'Career Counselor', 'Help individuals explore career options and plan professional development', 'Counseling'),
('INFJ', 'Environmental Scientist', 'Study environmental problems and develop solutions for sustainability', 'Environmental Science'),

-- INFP (The Mediator) - Creative, empathetic, value-driven
('INFP', 'Creative Writer', 'Write novels, poetry, screenplays, and other creative content', 'Creative Arts'),
('INFP', 'Mental Health Counselor', 'Provide therapy and support to individuals with emotional challenges', 'Healthcare'),
('INFP', 'Museum Curator', 'Manage and organize museum collections and exhibitions', 'Arts & Culture'),
('INFP', 'Music Therapist', 'Use music to help people heal and express emotions', 'Healthcare'),
('INFP', 'Translator', 'Convert written or spoken content from one language to another', 'Languages'),
('INFP', 'Social Media Manager', 'Manage online presence and create engaging content for brands', 'Marketing'),

-- INTP (The Thinker) - Analytical, innovative, independent
('INTP', 'Data Scientist', 'Analyze complex data sets to identify patterns and insights', 'Technology'),
('INTP', 'Research Scientist', 'Conduct experiments and studies in various scientific fields', 'Science & Research'),
('INTP', 'Philosophy Professor', 'Teach philosophical concepts and conduct academic research', 'Education'),
('INTP', 'Computer Systems Analyst', 'Analyze computer systems and recommend improvements', 'Technology'),
('INTP', 'Technical Writer', 'Create documentation and manuals for technical products', 'Technology'),
('INTP', 'Economist', 'Study economic trends and analyze market behavior', 'Economics'),

-- INTJ (Already exists, adding more)
('INTJ', 'Chief Technology Officer', 'Lead technology strategy and innovation in organizations', 'Technology'),
('INTJ', 'Investment Analyst', 'Analyze financial markets and investment opportunities', 'Finance'),
('INTJ', 'Architect', 'Design buildings and structures with focus on functionality and aesthetics', 'Architecture'),

-- ENFJ (The Protagonist) - Inspiring, empathetic, leadership-focused
('ENFJ', 'School Principal', 'Lead educational institutions and inspire academic excellence', 'Education'),
('ENFJ', 'Corporate Trainer', 'Develop and deliver training programs for employee development', 'Training & Development'),
('ENFJ', 'Public Relations Manager', 'Manage public image and communications for organizations', 'Public Relations'),
('ENFJ', 'Life Coach', 'Help individuals achieve personal and professional goals', 'Coaching'),
('ENFJ', 'Organizational Development Consultant', 'Help companies improve culture and effectiveness', 'Consulting'),
('ENFJ', 'Speech-Language Pathologist', 'Help people with communication and swallowing disorders', 'Healthcare'),

-- ENFP (Already exists, adding more)
('ENFP', 'Social Media Influencer', 'Create engaging content and build online communities', 'Social Media'),
('ENFP', 'Event Planner', 'Design and coordinate memorable events and experiences', 'Event Management'),
('ENFP', 'Journalist', 'Research and report on news stories and current events', 'Media'),

-- ENTP (The Debater) - Innovative, adaptable, entrepreneurial
('ENTP', 'Entrepreneur', 'Start and manage innovative business ventures', 'Business'),
('ENTP', 'Product Manager', 'Guide product development from concept to market launch', 'Technology'),
('ENTP', 'Management Consultant', 'Advise organizations on business strategy and operations', 'Consulting'),
('ENTP', 'Lawyer', 'Represent clients in legal matters and court proceedings', 'Legal'),
('ENTP', 'Advertising Executive', 'Develop creative advertising campaigns and strategies', 'Advertising'),
('ENTP', 'Political Scientist', 'Study political systems and analyze government policies', 'Political Science'),

-- ENTJ (The Commander) - Already exists, adding more
('ENTJ', 'Chief Executive Officer', 'Lead organizations and make high-level strategic decisions', 'Executive Leadership'),
('ENTJ', 'Investment Banking Director', 'Manage complex financial transactions and client relationships', 'Finance'),
('ENTJ', 'Business Development Manager', 'Identify growth opportunities and develop strategic partnerships', 'Business Development');
