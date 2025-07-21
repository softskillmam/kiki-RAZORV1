import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, PlayCircle, FileText, HelpCircle, CheckCircle, ExternalLink, Image, Link } from 'lucide-react';
import FileViewer from '@/components/FileViewer';

interface CourseContent {
  id: string;
  section_id: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'text' | 'image' | 'link';
  content_url: string | null;
  description: string | null;
  order_index: number;
  created_at: string;
}

interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  course_contents: CourseContent[];
}

interface CourseSectionsProps {
  courseId: string;
  isEnrolled?: boolean;
}

interface ContentProgress {
  contentId: string;
  completed: boolean;
}

const CourseSections = ({ courseId, isEnrolled = false }: CourseSectionsProps) => {
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);
  const [contentProgress, setContentProgress] = useState<ContentProgress[]>([]);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (courseId) {
      fetchCourseSections();
      if (isEnrolled && user) {
        fetchContentProgress();
      }
    }
  }, [courseId, isEnrolled, user]);

  const fetchCourseSections = async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching course sections for courseId:', courseId);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('course_sections')
        .select(`
          *,
          course_contents (*)
        `)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching course sections:', error);
        toast({
          title: "Error",
          description: "Failed to fetch course sections.",
          variant: "destructive",
        });
        setSections([]);
        return;
      }

      console.log('Fetched sections data:', data);

      const sectionsWithSortedContents = (data || []).map(section => ({
        ...section,
        course_contents: (section.course_contents || []).sort((a, b) => a.order_index - b.order_index)
      }));

      setSections(sectionsWithSortedContents as CourseSection[]);
      
      // Auto-expand the first section if there are sections
      if (sectionsWithSortedContents.length > 0) {
        setOpenSections(new Set([sectionsWithSortedContents[0].id]));
      }
    } catch (error) {
      console.error('Error fetching course sections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch course sections.",
        variant: "destructive",
      });
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContentProgress = async () => {
    if (!user?.id) return;

    try {
      const savedProgress = localStorage.getItem(`course_progress_${courseId}_${user.id}`);
      if (savedProgress) {
        setContentProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error('Error fetching content progress:', error);
    }
  };

  const toggleContentCompletion = (contentId: string) => {
    if (!user?.id) return;

    const newProgress = [...contentProgress];
    const existingIndex = newProgress.findIndex(p => p.contentId === contentId);
    
    if (existingIndex >= 0) {
      newProgress[existingIndex].completed = !newProgress[existingIndex].completed;
    } else {
      newProgress.push({ contentId, completed: true });
    }

    setContentProgress(newProgress);
    localStorage.setItem(`course_progress_${courseId}_${user.id}`, JSON.stringify(newProgress));

    updateCourseProgress(newProgress);
  };

  const updateCourseProgress = async (progress: ContentProgress[]) => {
    if (!user?.id) return;

    const totalContent = sections.reduce((acc, section) => acc + section.course_contents.length, 0);
    const completedContent = progress.filter(p => p.completed).length;
    const progressPercentage = totalContent > 0 ? Math.round((completedContent / totalContent) * 100) : 0;

    try {
      await supabase
        .from('enrollments')
        .update({
          progress: progressPercentage,
          completed_lessons: completedContent
        })
        .eq('student_id', user.id)
        .eq('course_id', courseId);
    } catch (error) {
      console.error('Error updating course progress:', error);
    }
  };

  const isContentCompleted = (contentId: string) => {
    return contentProgress.some(p => p.contentId === contentId && p.completed);
  };

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="h-4 w-4 text-red-600" />;
      case 'document':
      case 'text':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4 text-green-600" />;
      case 'image':
        return <Image className="h-4 w-4 text-purple-600" />;
      case 'link':
        return <Link className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getContentTypeBadge = (type: string) => {
    const variants = {
      video: 'destructive',
      document: 'default',
      text: 'default',
      quiz: 'secondary',
      image: 'outline',
      link: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'} className="text-xs">
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;

    if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
      const videoId = url.includes('youtube.com/watch?v=') 
        ? url.split('v=')[1]?.split('&')[0]
        : url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes('drive.google.com')) {
      if (url.includes('/file/d/')) {
        const fileId = url.split('/file/d/')[1]?.split('/')[0];
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      if (url.includes('id=')) {
        const fileId = url.split('id=')[1]?.split('&')[0];
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    return url;
  };

  const renderContentViewer = (content: CourseContent) => {
    if (!content.content_url) return null;

    const getFileExtension = (url: string): string => {
      try {
        const urlObject = new URL(url);
        const pathname = urlObject.pathname;
        return pathname.split('.').pop()?.toLowerCase() || '';
      } catch {
        return '';
      }
    };

    const extension = getFileExtension(content.content_url);
    const documentExtensions = ['pdf', 'ppt', 'pptx', 'doc', 'docx'];

    if (content.type === 'document' || documentExtensions.includes(extension)) {
      return (
        <FileViewer 
          fileUrl={content.content_url} 
          title={content.title}
          className="w-full"
        />
      );
    }

    if (content.type === 'video') {
      const embedUrl = getEmbedUrl(content.content_url);
      
      if (!embedUrl) {
        return (
          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
            <div className="text-center">
              <ExternalLink className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-4">External video content</p>
              <Button variant="outline" size="sm" asChild>
                <a href={content.content_url} target="_blank" rel="noopener noreferrer">
                  Open in new tab
                </a>
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className="flex justify-center">
          <div className="relative w-full max-w-4xl mx-auto" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full rounded-lg border shadow-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={content.title}
            />
          </div>
        </div>
      );
    }

    const embedUrl = getEmbedUrl(content.content_url);
    
    if (!embedUrl) {
      return (
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
          <div className="text-center">
            <ExternalLink className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-4">External content</p>
            <Button variant="outline" size="sm" asChild>
              <a href={content.content_url} target="_blank" rel="noopener noreferrer">
                Open in new tab
              </a>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full rounded-lg border"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={content.title}
        />
      </div>
    );
  };

  const getTotalProgress = () => {
    const totalContent = sections.reduce((acc, section) => acc + section.course_contents.length, 0);
    const completedContent = contentProgress.filter(p => p.completed).length;
    return totalContent > 0 ? Math.round((completedContent / totalContent) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No course sections available yet.</p>
          {!isEnrolled && (
            <p className="text-sm text-gray-400 mt-2">
              Enroll in this course to access the content.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {isEnrolled && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Course Progress</span>
              <span className="text-sm text-gray-600">{getTotalProgress()}%</span>
            </div>
            <Progress value={getTotalProgress()} className="h-2" />
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id} className="overflow-hidden">
              <Collapsible
                open={openSections.has(section.id)}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {openSections.has(section.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          Section {section.order_index}: {section.title}
                        </CardTitle>
                        {section.description && (
                          <CardDescription className="mt-1">
                            {section.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {section.course_contents?.length || 0} items
                      </Badge>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {section.course_contents && section.course_contents.length > 0 ? (
                      <div className="space-y-3">
                        {section.course_contents.map((content) => (
                          <div
                            key={content.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                              selectedContent?.id === content.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedContent(content)}
                          >
                            {getContentIcon(content.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                  {content.title}
                                </h4>
                                {getContentTypeBadge(content.type)}
                                {isEnrolled && isContentCompleted(content.id) && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              {content.description && (
                                <p className="text-xs text-gray-600">
                                  {content.description}
                                </p>
                              )}
                            </div>
                            {isEnrolled && (
                              <Button
                                size="sm"
                                variant={isContentCompleted(content.id) ? "default" : "outline"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleContentCompletion(content.id);
                                }}
                              >
                                {isContentCompleted(content.id) ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  "Mark Complete"
                                )}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No content available in this section yet.</p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
        
        <div className="lg:sticky lg:top-4">
          {selectedContent && (isEnrolled || selectedContent.type === 'text') ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getContentIcon(selectedContent.type)}
                  {selectedContent.title}
                </CardTitle>
                {selectedContent.description && (
                  <CardDescription>{selectedContent.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {renderContentViewer(selectedContent)}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isEnrolled ? "Select Content" : "Preview Mode"}
                </h3>
                <p className="text-gray-600">
                  {isEnrolled 
                    ? "Click on any content item to view it here" 
                    : "Enroll in this course to access the content"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseSections;
