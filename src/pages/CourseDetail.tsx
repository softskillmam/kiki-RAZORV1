
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Star, Play, Download, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import EnrollButton from '@/components/EnrollButton';
import CourseSections from '@/components/CourseSections';

interface Program {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  original_price: number;
  duration: string;
  mode: string;
  age_range: string;
  category: string;
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) {
      console.log('CourseDetail: courseId from params:', courseId);
      fetchCourse();
    }
  }, [courseId]);

  useEffect(() => {
    if (isAuthenticated && user?.id && courseId) {
      checkEnrollmentStatus();
    } else {
      setEnrollmentLoading(false);
    }
  }, [courseId, user, isAuthenticated]);

  const checkEnrollmentStatus = async () => {
    if (!user?.id || !courseId) {
      setEnrollmentLoading(false);
      return;
    }

    try {
      console.log('Checking enrollment status for:', { userId: user.id, courseId });
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('student_id', user.id)
        .eq('course_id', courseId)
        .eq('status', 'enrolled')
        .maybeSingle();

      if (error) {
        console.error('Error checking enrollment:', error);
        setIsEnrolled(false);
      } else {
        console.log('Enrollment check result:', data);
        setIsEnrolled(!!data);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
      setIsEnrolled(false);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const fetchCourse = async () => {
    if (!courseId) {
      toast({
        title: "Error",
        description: "Course ID is missing.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching course with ID:', courseId);
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) {
        console.error('Error fetching course:', courseError);
        toast({
          title: "Error",
          description: "Failed to load course details. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!courseData) {
        toast({
          title: "Error",
          description: "Course not found.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('Course data fetched:', courseData);
      setCourse(courseData);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: "Error",
        description: "Failed to load course details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || enrollmentLoading) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kiki-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/programs')}>
              Back to Programs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-kiki-purple-900 via-kiki-purple-800 to-kiki-blue-800">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="text-white hover:text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  {course.category}
                </Badge>
                <Badge className={`${
                  course.mode === 'Online' 
                    ? 'bg-green-100 text-green-800' 
                    : course.mode === 'Offline' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {course.mode}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {course.title}
              </h1>

              <p className="text-lg text-white/90 mb-6">
                {course.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-white/80 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8 (250+ reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>1,200+ students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="text-2xl font-bold">₹{course.price}</div>
                {course.original_price && (
                  <div className="text-lg text-white/60 line-through">₹{course.original_price}</div>
                )}
                {course.original_price && (
                  <Badge className="bg-red-500 text-white">
                    {Math.round((1 - course.price / course.original_price) * 100)}% OFF
                  </Badge>
                )}
              </div>

              <EnrollButton 
                courseId={course.id}
                isEnrolled={isEnrolled}
                className="bg-white text-kiki-purple-600 hover:bg-white/90"
              />
            </div>

            <div className="relative">
              <img 
                src={course.image_url} 
                alt={course.title} 
                className="rounded-lg shadow-2xl w-full h-64 object-cover" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-kiki-purple-600 hover:bg-white/90 rounded-full w-16 h-16"
                >
                  <Play className="w-6 h-6 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content - Full Width Layout */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {course.description}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">What You'll Learn</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Comprehensive understanding of the subject</li>
                      <li>• Practical skills and real-world applications</li>
                      <li>• Industry best practices and techniques</li>
                      <li>• Hands-on projects and exercises</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Course Details</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Duration: {course.duration}</li>
                      <li>• Mode: {course.mode}</li>
                      <li>• Age Range: {course.age_range}</li>
                      <li>• Category: {course.category}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum" className="mt-6">
            <CourseSections courseId={course.id} isEnrolled={isEnrolled} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Reviews</CardTitle>
                <CardDescription>
                  See what our students have to say about this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map(review => (
                    <div key={review} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="font-medium">Student {review}</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        This course exceeded my expectations. The content is well-structured and the instructor explains concepts clearly.
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseDetail;
