
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { BookOpen, Plus, Edit, Trash2, Users, Settings } from 'lucide-react';
import AdminSearchableTab from './AdminSearchableTab';
import AdminSectionManagement from './AdminSectionManagement';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  category: string;
  duration: string;
  age_range: string;
  mode: string;
  image_url: string | null;
  status: string;
  total_lessons: number;
  created_at: string;
  updated_at: string;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    category: '',
    duration: '',
    age_range: '',
    mode: '',
    image_url: '',
    status: 'active',
    total_lessons: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

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
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

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

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.price) return;

    try {
      const courseData = {
        title: formData.title,
        description: formData.description || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category: formData.category || null,
        duration: formData.duration || null,
        age_range: formData.age_range || null,
        mode: formData.mode || null,
        image_url: formData.image_url || null,
        status: formData.status as 'active' | 'inactive' | 'archived',
        total_lessons: formData.total_lessons ? parseInt(formData.total_lessons) : 0,
        updated_at: new Date().toISOString()
      };

      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);

        if (error) throw error;
        toast({ title: "Success", description: "Course updated successfully." });
      } else {
        const { error } = await supabase
          .from('courses')
          .insert(courseData);

        if (error) throw error;
        toast({ title: "Success", description: "Course created successfully." });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "Failed to save course.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
      toast({ title: "Success", description: "Course deleted successfully." });
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      original_price: '',
      category: '',
      duration: '',
      age_range: '',
      mode: '',
      image_url: '',
      status: 'active',
      total_lessons: ''
    });
    setEditingCourse(null);
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || '',
      price: course.price.toString(),
      original_price: course.original_price?.toString() || '',
      category: course.category || '',
      duration: course.duration || '',
      age_range: course.age_range || '',
      mode: course.mode || '',
      image_url: course.image_url || '',
      status: course.status,
      total_lessons: course.total_lessons?.toString() || ''
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      archived: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Management
          </CardTitle>
          <CardDescription>
            Manage courses and their content sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="courses" className="space-y-4">
            <TabsList>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="sections" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Sections & Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
              <AdminSearchableTab 
                onSearch={handleSearch}
                placeholder="Search courses..."
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">All Courses</h3>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Course
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            {editingCourse ? 'Edit Course' : 'Add New Course'}
                          </DialogTitle>
                          <DialogDescription>
                            {editingCourse ? 'Update course details' : 'Create a new course'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              placeholder="Course title"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              placeholder="Course description"
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="original_price">Original Price (₹)</Label>
                            <Input
                              id="original_price"
                              type="number"
                              value={formData.original_price}
                              onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Input
                              id="category"
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              placeholder="e.g., Programming, Design"
                            />
                          </div>
                          <div>
                            <Label htmlFor="duration">Duration</Label>
                            <Input
                              id="duration"
                              value={formData.duration}
                              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                              placeholder="e.g., 8 weeks"
                            />
                          </div>
                          <div>
                            <Label htmlFor="age_range">Age Range</Label>
                            <Input
                              id="age_range"
                              value={formData.age_range}
                              onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                              placeholder="e.g., 12-18 years"
                            />
                          </div>
                          <div>
                            <Label htmlFor="mode">Mode</Label>
                            <Select value={formData.mode} onValueChange={(value) => setFormData({ ...formData, mode: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="offline">Offline</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="total_lessons">Total Lessons</Label>
                            <Input
                              id="total_lessons"
                              type="number"
                              value={formData.total_lessons}
                              onChange={(e) => setFormData({ ...formData, total_lessons: e.target.value })}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="image_url">Image URL</Label>
                            <Input
                              id="image_url"
                              value={formData.image_url}
                              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSubmit}>
                            {editingCourse ? 'Update' : 'Create'} Course
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid gap-4">
                    {filteredCourses.map((course) => (
                      <Card key={course.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                {course.title}
                                {getStatusBadge(course.status)}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {course.description}
                              </CardDescription>
                              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                <span>₹{course.price}</span>
                                {course.original_price && (
                                  <span className="line-through text-gray-400">₹{course.original_price}</span>
                                )}
                                <span>{course.category}</span>
                                <span>{course.duration}</span>
                                <span>{course.total_lessons} lessons</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(course)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(course.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>

                  {filteredCourses.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No courses found. Create your first course to get started.
                    </div>
                  )}
                </div>
              </AdminSearchableTab>
            </TabsContent>

            <TabsContent value="sections">
              <AdminSectionManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseManagement;
