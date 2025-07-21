
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface EnrollButtonProps {
  courseId: string;
  isEnrolled?: boolean;
  className?: string;
}

const EnrollButton: React.FC<EnrollButtonProps> = ({ 
  courseId, 
  isEnrolled = false, 
  className = "" 
}) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [inCart, setInCart] = useState(false);

  // Correct UUID that exists in the database
  const MBTI_COURSE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  React.useEffect(() => {
    if (isAuthenticated && user?.id && !isEnrolled) {
      checkIfInCart();
    }
  }, [isAuthenticated, user?.id, courseId, isEnrolled]);

  const checkIfInCart = async () => {
    if (!user?.id) {
      console.log('No user ID found for cart check');
      return;
    }

    try {
      console.log('Checking if course is in cart:', { userId: user.id, courseId });
      
      const { data, error } = await supabase
        .from('cart_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) {
        console.error('Error checking cart:', error);
        return;
      }

      console.log('Cart check result:', data);
      setInCart(!!data);
    } catch (error) {
      console.error('Error checking cart:', error);
    }
  };

  const handleEnroll = async () => {
    console.log('Handle enroll clicked:', { isAuthenticated, isEnrolled, inCart, courseId });

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add courses to cart.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (isEnrolled) {
      // Check if this is the MBTI test course
      if (courseId === MBTI_COURSE_ID) {
        console.log('Navigating to MBTI test for Assessment course');
        navigate('/mbti-test');
      } else {
        console.log('Navigating to enrolled courses for non-Assessment course');
        navigate('/enrolled-courses');
      }
      return;
    }

    if (inCart) {
      navigate('/cart');
      return;
    }

    if (!user?.id) {
      console.error('No user ID found');
      toast({
        title: "Error",
        description: "Please log in to add courses to cart.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Adding to cart:', { userId: user.id, courseId });

      // First verify the course exists
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, title')
        .eq('id', courseId)
        .maybeSingle();

      if (courseError) {
        console.error('Error checking course:', courseError);
        throw new Error('Failed to verify course exists');
      }

      if (!courseData) {
        console.error('Course not found:', courseId);
        toast({
          title: "Error",
          description: "Course not found.",
          variant: "destructive",
        });
        return;
      }

      // Check if already in cart (double-check)
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing cart item:', checkError);
        throw checkError;
      }

      if (existingItem) {
        console.log('Item already in cart:', existingItem);
        setInCart(true);
        toast({
          title: "Already in Cart",
          description: "This course is already in your cart.",
        });
        return;
      }

      // Add to cart
      const { data: insertData, error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          course_id: courseId,
        })
        .select();

      if (insertError) {
        console.error('Error adding to cart:', insertError);
        throw insertError;
      }

      console.log('Successfully added to cart:', insertData);
      setInCart(true);
      // The real-time subscription in useCartCount will automatically update the cart count
      toast({
        title: "Added to Cart",
        description: `${courseData.title} has been added to your cart.`,
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: `Failed to add course to cart: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If the user is enrolled, always show the "Start Test" button
  if (isEnrolled) {
    return (
      <Button 
        onClick={handleEnroll}
        className={`bg-green-600 hover:bg-green-700 ${className}`}
      >
        <Check className="w-4 h-4 mr-2" />
        {courseId === MBTI_COURSE_ID ? 'Start Test' : 'Continue Course'}
      </Button>
    );
  }

  // If not enrolled but in cart, show "View Cart" button
  if (inCart) {
    return (
      <Button 
        onClick={handleEnroll}
        variant="outline"
        className={`border-kiki-purple-600 text-kiki-purple-600 hover:bg-kiki-purple-50 ${className}`}
      >
        <ShoppingCart className="w-4 w-4 mr-2" />
        View Cart
      </Button>
    );
  }

  // If not enrolled and not in cart, show "Add to Cart" button
  return (
    <Button 
      onClick={handleEnroll}
      disabled={loading}
      className={`bg-kiki-purple-600 hover:bg-kiki-purple-700 ${className}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Adding...
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
};

export default EnrollButton;
