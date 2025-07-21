import React, { useState, useEffect } from 'react';
import EnrollButton from '@/components/EnrollButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, Lightbulb, TrendingUp } from 'lucide-react';

const CareerTest = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [careerTestCourse, setCareerTestCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Correct UUID that exists in the database
  const MBTI_COURSE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  useEffect(() => {
    fetchCareerTestCourse();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && careerTestCourse) {
      checkEnrollmentStatus();
    }
  }, [isAuthenticated, user, careerTestCourse]);

  const fetchCareerTestCourse = async () => {
    try {
      console.log('Fetching Career Test course with ID:', MBTI_COURSE_ID);
      
      // Fetch the specific MBTI course
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', MBTI_COURSE_ID)
        .eq('status', 'active')
        .maybeSingle();

      console.log('Career test course query result:', { data, error });

      if (error) {
        console.error('Error fetching career test course:', error);
        toast({
          title: "Error",
          description: "Failed to load career test course details.",
          variant: "destructive",
        });
      } else if (data) {
        console.log('Career test course found:', data);
        setCareerTestCourse(data);
      } else {
        console.log('No MBTI course found with ID:', MBTI_COURSE_ID);
        toast({
          title: "Course Not Found",
          description: "The MBTI Personality Test course is not available at the moment.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching career test course:', error);
      toast({
        title: "Error",
        description: "Failed to load course details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!user?.id || !careerTestCourse?.id) return;

    try {
      console.log('Checking enrollment status:', { userId: user.id, courseId: careerTestCourse.id });
      
      // Check for confirmed orders with this course
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          order_items!inner (
            course_id
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .eq('order_items.course_id', careerTestCourse.id);

      if (orderError) {
        console.error('Error checking order status:', orderError);
      }

      const hasConfirmedOrder = orderData && orderData.length > 0;
      console.log('Has confirmed order:', hasConfirmedOrder);

      // Also check direct enrollment
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('student_id', user.id)
        .eq('course_id', careerTestCourse.id)
        .eq('status', 'enrolled');

      if (enrollmentError) {
        console.error('Error checking enrollment status:', enrollmentError);
      }

      const hasEnrollment = enrollmentData && enrollmentData.length > 0;
      console.log('Has enrollment:', hasEnrollment);

      // User is enrolled if they have either confirmed order or direct enrollment
      const enrolled = hasConfirmedOrder || hasEnrollment;
      console.log('Final enrollment status:', enrolled);
      
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error('Error checking enrollment status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kiki-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-kiki-purple-50 via-white to-kiki-blue-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Discover Your <span className="bg-gradient-to-r from-kiki-purple-600 to-kiki-blue-600 bg-clip-text text-transparent">Perfect Career</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Take our comprehensive MBTI personality assessment to find the career path that aligns with your strengths, interests, and aspirations
            </p>
            
            {/* Career Test Card */}
            {careerTestCourse ? (
              <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8">
                <img
                  src={careerTestCourse.image_url || '/placeholder.svg'}
                  alt="Career Personality Test"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{careerTestCourse.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{careerTestCourse.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-kiki-purple-600">₹{careerTestCourse.price}</span>
                    {careerTestCourse.original_price && careerTestCourse.original_price !== careerTestCourse.price && (
                      <span className="text-sm text-gray-500 line-through">₹{careerTestCourse.original_price}</span>
                    )}
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {careerTestCourse.duration}
                  </Badge>
                </div>

                <div className="mb-4">
                  <Badge variant="secondary" className="mr-2 mb-2">48 Questions</Badge>
                  <Badge variant="secondary" className="mr-2 mb-2">Instant Results</Badge>
                  <Badge variant="secondary" className="mb-2">Career Recommendations</Badge>
                </div>

                <EnrollButton
                  courseId={careerTestCourse.id}
                  isEnrolled={isEnrolled}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="text-center">
                  <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Career Personality Test</h3>
                  <p className="text-gray-600 text-sm mb-4">Course not available at the moment.</p>
                  <Button
                    onClick={() => navigate('/programs')}
                    variant="outline"
                    className="w-full"
                  >
                    Browse Other Courses
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="text-center p-6 border-0 card-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-kiki-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-kiki-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Personality Analysis</h3>
                  <p className="text-gray-600 text-sm">Understand your unique traits and work style preferences</p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-0 card-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Skills Assessment</h3>
                  <p className="text-gray-600 text-sm">Identify your strengths and areas for development</p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-0 card-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Interest Matching</h3>
                  <p className="text-gray-600 text-sm">Find careers that align with your passions and interests</p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-0 card-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Growth Roadmap</h3>
                  <p className="text-gray-600 text-sm">Get a personalized plan for your career development</p>
                </CardContent>
              </Card>
            </div>

            {/* What You'll Get */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">What You'll Receive</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-kiki-purple-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-kiki-purple-800 mb-3">Detailed Report</h3>
                  <p className="text-kiki-purple-700">Comprehensive analysis of your personality, skills, and career matches</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">Career Recommendations</h3>
                  <p className="text-blue-700">Top career options ranked by compatibility with your profile</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-800 mb-3">Learning Path</h3>
                  <p className="text-green-700">Skill development recommendations based on your personality type</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            {careerTestCourse && (
              <div className="text-center bg-gradient-to-r from-kiki-purple-600 to-kiki-blue-600 rounded-2xl p-12 text-white">
                <h2 className="text-3xl font-bold mb-4">Ready to Discover Your Future?</h2>
                <p className="text-xl mb-8 opacity-90">The test takes about 15-20 minutes to complete</p>
                <div className="flex justify-center gap-2 mb-6">
                  <Badge className="bg-white/20 text-white">15-20 minutes</Badge>
                  <Badge className="bg-white/20 text-white">Science-based</Badge>
                  <Badge className="bg-white/20 text-white">Personalized results</Badge>
                </div>
                
                <EnrollButton
                  courseId={careerTestCourse.id}
                  isEnrolled={isEnrolled}
                  className={`${
                    isEnrolled 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-white text-kiki-purple-600 hover:bg-gray-100'
                  }`}
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CareerTest;
