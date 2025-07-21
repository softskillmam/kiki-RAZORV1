import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Plus, Edit, Trash2, GripVertical, Link, Video, FileText, Image } from 'lucide-react';
import AdminSearchableTab from './AdminSearchableTab';

interface Course {
  id: string;
  title: string;
  description: string;
}

interface Section {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface Content {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  type: string;
  content_url: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface SectionWithContents extends Section {
  contents: Content[];
}

const AdminSectionManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [sections, setSections] = useState<SectionWithContents[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string>('');
  const [draggedSection, setDraggedSection] = useState<Section | null>(null);
  const { toast } = useToast();

  // Form states
  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: ''
  });

  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    type: 'video',
    content_url: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchSections();
    }
  }, [selectedCourse]);

  useEffect(() => {
    setFilteredCourses(courses);
  }, [courses]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredCourses(courses);
      return;
    }
    
    const filtered = courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description')
        .eq('status', 'active')
        .order('title');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch courses.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSections = async () => {
    if (!selectedCourse) return;

    try {
      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', selectedCourse)
        .order('order_index');

      if (sectionsError) throw sectionsError;

      // Fetch contents for all sections
      const sectionIds = sectionsData?.map(s => s.id) || [];
      let contentsData = [];
      
      if (sectionIds.length > 0) {
        const { data, error: contentsError } = await supabase
          .from('course_contents')
          .select('*')
          .in('section_id', sectionIds)
          .order('order_index');

        if (contentsError) throw contentsError;
        contentsData = data || [];
      }

      // Combine sections with their contents
      const sectionsWithContents = sectionsData?.map(section => ({
        ...section,
        contents: contentsData.filter(content => content.section_id === section.id)
      })) || [];

      setSections(sectionsWithContents);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sections.",
        variant: "destructive",
      });
    }
  };

  const handleSectionSubmit = async () => {
    if (!selectedCourse || !sectionForm.title.trim()) return;

    try {
      if (editingSection) {
        const { error } = await supabase
          .from('course_sections')
          .update({
            title: sectionForm.title,
            description: sectionForm.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSection.id);

        if (error) throw error;
        toast({ title: "Success", description: "Section updated successfully." });
      } else {
        const maxOrderIndex = Math.max(...sections.map(s => s.order_index), 0);
        const { error } = await supabase
          .from('course_sections')
          .insert({
            course_id: selectedCourse,
            title: sectionForm.title,
            description: sectionForm.description,
            order_index: maxOrderIndex + 1
          });

        if (error) throw error;
        toast({ title: "Success", description: "Section created successfully." });
      }

      setSectionForm({ title: '', description: '' });
      setEditingSection(null);
      setIsSectionDialogOpen(false);
      fetchSections();
    } catch (error) {
      console.error('Error saving section:', error);
      toast({
        title: "Error",
        description: "Failed to save section.",
        variant: "destructive",
      });
    }
  };

  const handleContentSubmit = async () => {
    if (!currentSectionId || !contentForm.title.trim()) return;

    try {
      // Log the data being submitted for debugging
      console.log('Submitting content:', {
        title: contentForm.title,
        type: contentForm.type,
        content_url: contentForm.content_url || null,
        description: contentForm.description || null
      });

      if (editingContent) {
        const { error } = await supabase
          .from('course_contents')
          .update({
            title: contentForm.title,
            description: contentForm.description || null,
            type: contentForm.type,
            content_url: contentForm.content_url || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingContent.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast({ title: "Success", description: "Content updated successfully." });
      } else {
        const currentSection = sections.find(s => s.id === currentSectionId);
        const maxOrderIndex = Math.max(...(currentSection?.contents.map(c => c.order_index) || [0]), 0);
        
        const insertData = {
          section_id: currentSectionId,
          title: contentForm.title,
          description: contentForm.description || null,
          type: contentForm.type,
          content_url: contentForm.content_url || null,
          order_index: maxOrderIndex + 1
        };

        console.log('Insert data:', insertData);

        const { error } = await supabase
          .from('course_contents')
          .insert(insertData);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        toast({ title: "Success", description: "Content created successfully." });
      }

      setContentForm({ title: '', description: '', type: 'video', content_url: '' });
      setEditingContent(null);
      setIsContentDialogOpen(false);
      fetchSections();
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: `Failed to save content: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section and all its contents?')) return;

    try {
      const { error } = await supabase
        .from('course_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      toast({ title: "Success", description: "Section deleted successfully." });
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({
        title: "Error",
        description: "Failed to delete section.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const { error } = await supabase
        .from('course_contents')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
      toast({ title: "Success", description: "Content deleted successfully." });
      fetchSections();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete content.",
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (section: Section) => {
    setDraggedSection(section);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetSection: Section) => {
    e.preventDefault();
    if (!draggedSection || draggedSection.id === targetSection.id) return;

    try {
      // Swap order indexes
      const updates = [
        supabase
          .from('course_sections')
          .update({ order_index: targetSection.order_index })
          .eq('id', draggedSection.id),
        supabase
          .from('course_sections')
          .update({ order_index: draggedSection.order_index })
          .eq('id', targetSection.id)
      ];

      const results = await Promise.all(updates);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error('Failed to reorder sections');
      }

      toast({ title: "Success", description: "Sections reordered successfully." });
      fetchSections();
    } catch (error) {
      console.error('Error reordering sections:', error);
      toast({
        title: "Error",
        description: "Failed to reorder sections.",
        variant: "destructive",
      });
    } finally {
      setDraggedSection(null);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'link':
        return <Link className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const isEmbeddedUrl = (url: string) => {
    return url.includes('embed') || url.includes('iframe') || url.startsWith('<iframe');
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

  const isValidGoogleDriveUrl = (url: string) => {
    return url.includes('drive.google.com') && url.includes('/file/d/');
  };

  const isValidPdfUrl = (url: string) => {
    return url.toLowerCase().includes('.pdf') || url.includes('drive.google.com');
  };

  const getUrlTypeInfo = (url: string, type: string) => {
    if (!url) return null;
    
    if (type === 'video' && isValidGoogleDriveUrl(url)) {
      return { isValid: true, info: 'Google Drive Video' };
    }
    
    if (type === 'document' && isValidPdfUrl(url)) {
      return { isValid: true, info: 'PDF Document' };
    }
    
    if (type === 'video' && (url.includes('youtube.com') || url.includes('youtu.be'))) {
      return { isValid: true, info: 'YouTube Video' };
    }
    
    return { isValid: true, info: 'External Link' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Section & Content Management
        </CardTitle>
        <CardDescription>
          Manage course sections and their content. Support for PDF documents and Google Drive videos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AdminSearchableTab 
          onSearch={handleSearch}
          placeholder="Search courses..."
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="course-select">Select Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course to manage" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCourse && (
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Course Sections</h3>
                <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingSection(null);
                      setSectionForm({ title: '', description: '' });
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingSection ? 'Edit Section' : 'Add New Section'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingSection ? 'Update section details' : 'Create a new section for the course'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="section-title">Title</Label>
                        <Input
                          id="section-title"
                          value={sectionForm.title}
                          onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                          placeholder="Section title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="section-description">Description</Label>
                        <Textarea
                          id="section-description"
                          value={sectionForm.description}
                          onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                          placeholder="Section description (optional)"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsSectionDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSectionSubmit}>
                        {editingSection ? 'Update' : 'Create'} Section
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {selectedCourse && sections.length > 0 && (
              <Accordion type="multiple" className="space-y-4">
                {sections.map((section) => (
                  <AccordionItem 
                    key={section.id} 
                    value={section.id}
                    className="border rounded-lg"
                    draggable
                    onDragStart={() => handleDragStart(section)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, section)}
                  >
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{section.title}</div>
                          {section.description && (
                            <div className="text-sm text-gray-600">{section.description}</div>
                          )}
                        </div>
                        <Badge variant="secondary">
                          {section.contents.length} content{section.contents.length !== 1 ? 's' : ''}
                        </Badge>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingSection(section);
                              setSectionForm({
                                title: section.title,
                                description: section.description || ''
                              });
                              setIsSectionDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSection(section.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Section Contents</h4>
                          <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setCurrentSectionId(section.id);
                                  setEditingContent(null);
                                  setContentForm({ title: '', description: '', type: 'video', content_url: '' });
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Content
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  {editingContent ? 'Edit Content' : 'Add New Content'}
                                </DialogTitle>
                                <DialogDescription>
                                  {editingContent ? 'Update content details' : 'Add new content to this section'}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="content-title">Title</Label>
                                  <Input
                                    id="content-title"
                                    value={contentForm.title}
                                    onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                                    placeholder="Content title"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="content-type">Content Type</Label>
                                  <Select
                                    value={contentForm.type}
                                    onValueChange={(value) => setContentForm({ ...contentForm, type: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="video">Video</SelectItem>
                                      <SelectItem value="document">Document (PDF)</SelectItem>
                                      <SelectItem value="text">Text</SelectItem>
                                      <SelectItem value="image">Image</SelectItem>
                                      <SelectItem value="link">External Link</SelectItem>
                                      <SelectItem value="quiz">Quiz</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="content-url">
                                    {contentForm.type === 'video' ? 'Video URL (Google Drive or YouTube)' : 
                                     contentForm.type === 'document' ? 'PDF Document URL (Google Drive or direct link)' :
                                     contentForm.type === 'link' ? 'External Link URL' : 
                                     'Content URL'}
                                  </Label>
                                  <Textarea
                                    id="content-url"
                                    value={contentForm.content_url}
                                    onChange={(e) => setContentForm({ ...contentForm, content_url: e.target.value })}
                                    placeholder={
                                      contentForm.type === 'video' ? 
                                      'https://drive.google.com/file/d/YOUR_FILE_ID/view or https://youtube.com/watch?v=...' :
                                      contentForm.type === 'document' ? 
                                      'https://drive.google.com/file/d/YOUR_FILE_ID/view or direct PDF URL' :
                                      contentForm.type === 'link' ? 'https://example.com' :
                                      'URL to your content'
                                    }
                                    rows={2}
                                  />
                                  <div className="text-xs text-gray-500 mt-1">
                                    {contentForm.type === 'video' && (
                                      <>
                                        <strong>For Google Drive videos:</strong> Share the file → Copy link → Paste here<br/>
                                        <strong>For YouTube:</strong> Copy the video URL from browser
                                      </>
                                    )}
                                    {contentForm.type === 'document' && (
                                      <>
                                        <strong>For Google Drive PDFs:</strong> Share the file → Copy link → Paste here<br/>
                                        <strong>For direct PDFs:</strong> Use any publicly accessible PDF URL
                                      </>
                                    )}
                                  </div>
                                  {contentForm.content_url && (
                                    <div className="mt-2">
                                      {(() => {
                                        const urlInfo = getUrlTypeInfo(contentForm.content_url, contentForm.type);
                                        return urlInfo ? (
                                          <Badge variant={urlInfo.isValid ? "default" : "destructive"} className="text-xs">
                                            {urlInfo.info}
                                          </Badge>
                                        ) : null;
                                      })()}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <Label htmlFor="content-description">Description</Label>
                                  <Textarea
                                    id="content-description"
                                    value={contentForm.description}
                                    onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                                    placeholder="Content description (optional)"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsContentDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleContentSubmit}>
                                  {editingContent ? 'Update' : 'Create'} Content
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        
                        {section.contents.length > 0 ? (
                          <div className="space-y-2">
                            {section.contents.map((content) => (
                              <div key={content.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {getContentIcon(content.type)}
                                  <div>
                                    <div className="font-medium">{content.title}</div>
                                    {content.description && (
                                      <div className="text-sm text-gray-600">{content.description}</div>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {content.type}
                                      </Badge>
                                      {content.content_url && isEmbeddedUrl(content.content_url) && (
                                        <Badge variant="secondary" className="text-xs">
                                          Embedded
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setCurrentSectionId(section.id);
                                      setEditingContent(content);
                                      setContentForm({
                                        title: content.title,
                                        description: content.description || '',
                                        type: content.type,
                                        content_url: content.content_url || ''
                                      });
                                      setIsContentDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteContent(content.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-4">
                            No content added yet
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            {selectedCourse && sections.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No sections created yet. Add your first section to get started.
              </div>
            )}
          </div>
        </AdminSearchableTab>
      </CardContent>
    </Card>
  );
};

export default AdminSectionManagement;
