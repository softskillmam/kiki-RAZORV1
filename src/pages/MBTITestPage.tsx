import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MBTIQuiz from '@/components/MBTIQuiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Lock, CheckCircle, ArrowLeft } from 'lucide-react';

interface MBTIResult {
  type: string;
  scores: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
}

const MBTITestPage = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previousResult, setPreviousResult] = useState<any>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Correct UUID that exists in the database
  const MBTI_COURSE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  useEffect(() => {
    checkAccess();
  }, [user, isAuthenticated]);

  const checkAccess = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Checking access for course ID:', MBTI_COURSE_ID);
      console.log('User ID:', user.id);
      
      // Check if user has confirmed order for the MBTI test
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
        .eq('order_items.course_id', MBTI_COURSE_ID);

      if (orderError) {
        console.error('Error checking order access:', orderError);
      }

      const hasConfirmedOrder = orderData && orderData.length > 0;
      console.log('Has confirmed order:', hasConfirmedOrder, orderData);

      // Also check direct enrollment
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('student_id', user.id)
        .eq('course_id', MBTI_COURSE_ID)
        .eq('status', 'enrolled');

      if (enrollmentError) {
        console.error('Error checking enrollment:', enrollmentError);
      }

      const hasEnrollment = enrollmentData && enrollmentData.length > 0;
      console.log('Has enrollment:', hasEnrollment, enrollmentData);

      // Check if user has already completed the test
      const { data: resultData, error: resultError } = await supabase
        .from('mbti_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1);

      if (resultError) {
        console.error('Error checking previous results:', resultError);
      }

      const hasPreviousResult = resultData && resultData.length > 0;
      console.log('Has previous result:', hasPreviousResult, resultData);
      
      if (hasPreviousResult) {
        setPreviousResult(resultData[0]);
      }

      // User has access if they have confirmed order or enrollment
      const userHasAccess = hasConfirmedOrder || hasEnrollment;
      console.log('Final access decision:', userHasAccess);
      setHasAccess(userHasAccess);

    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (result: MBTIResult) => {
    const message = previousResult 
      ? `Your personality type has been updated to ${result.type}. Your personalized recommendations are displayed below.`
      : `Your personality type is ${result.type}. Check out your personalized recommendations below.`;
      
    toast({
      title: previousResult ? "Test Updated!" : "Test Completed!",
      description: message,
    });
    
    // Update the previous result state
    setPreviousResult({
      mbti_type: result.type,
      extraversion_score: result.scores.E,
      sensing_score: result.scores.S,
      thinking_score: result.scores.T,
      judging_score: result.scores.J,
      completed_at: new Date().toISOString()
    });
  };

  const handlePurchaseTest = () => {
    // Navigate to career test page to purchase
    navigate('/career-test');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kiki-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/career-test')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Career Test
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              MBTI Personality Test
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover your unique personality type with our comprehensive 48-question assessment
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          // Not logged in
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <CardTitle>Login Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Please log in to access the MBTI personality test.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Login to Continue
              </Button>
            </CardContent>
          </Card>
        ) : !hasAccess ? (
          // No access - need to purchase
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <CardTitle>Purchase Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                You need to purchase the MBTI Personality Test to access this assessment.
              </p>
              <div className="bg-kiki-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-kiki-purple-600 mb-1">₹500</div>
                <div className="text-sm text-gray-600">One-time purchase</div>
                <Badge className="mt-2 bg-green-100 text-green-800">
                  Use coupon TEST495 for ₹5 off
                </Badge>
              </div>
              <Button 
                onClick={handlePurchaseTest} 
                className="w-full bg-kiki-purple-600 hover:bg-kiki-purple-700"
              >
                Purchase Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Has access - show quiz or results
          <MBTIQuiz 
            onComplete={handleQuizComplete} 
            existingResult={previousResult}
          />
        )}
      </main>
    </div>
  );
};

export default MBTITestPage;
