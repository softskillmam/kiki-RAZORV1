import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CreditCard, ArrowLeft, Loader2, Tag, AlertTriangle } from 'lucide-react';
import { loadRazorpayScript, createRazorpayOrder, initializeRazorpay } from '@/utils/razorpay';

interface CartItem {
  id: string;
  course: {
    id: string;
    title: string;
    price: number;
    image_url: string | null;
  };
}

interface CheckoutData {
  items: CartItem[];
  subtotal: number;
  couponCode?: string;
  couponDiscount?: number;
  total: number;
}

const Checkout = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // MBTI Career Test Course ID
  const MBTI_COURSE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Try to get checkout data from sessionStorage first
    const storedCheckoutData = sessionStorage.getItem('checkoutData');
    if (storedCheckoutData) {
      try {
        const parsed = JSON.parse(storedCheckoutData);
        setCheckoutData(parsed);
        setCartItems(parsed.items || []);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing stored checkout data:', error);
      }
    }
    
    // Fallback to fetching from database
    fetchCartItems();
  }, [isAuthenticated, navigate]);

  const fetchCartItems = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching cart items for user:', user.id);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          course:courses (
            id,
            title,
            price,
            image_url
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart items:', error);
        toast({
          title: "Error",
          description: "Failed to load cart items.",
          variant: "destructive",
        });
        return;
      }

      console.log('Cart items fetched:', data);
      setCartItems(data || []);
      
      // Create checkout data from fetched items
      const subtotal = (data || []).reduce((sum, item) => sum + item.course.price, 0);
      setCheckoutData({
        items: data || [],
        subtotal,
        total: subtotal
      });
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEnrollment = async (courseId: string) => {
    if (!user?.id) return;

    try {
      console.log('Creating enrollment for course:', courseId);
      
      // Check if enrollment already exists
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing enrollment:', checkError);
        throw checkError;
      }

      if (existingEnrollment) {
        console.log('Enrollment already exists:', existingEnrollment);
        return;
      }

      // Create new enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: courseId,
          status: 'enrolled',
          progress: 0,
          completed_lessons: 0,
          enrolled_at: new Date().toISOString()
        })
        .select()
        .single();

      if (enrollmentError) {
        console.error('Error creating enrollment:', enrollmentError);
        throw enrollmentError;
      }

      console.log('Enrollment created successfully:', enrollment);
    } catch (error) {
      console.error('Error in createEnrollment:', error);
      throw error;
    }
  };

  const handleRazorpayPayment = async () => {
    if (!user || cartItems.length === 0 || !checkoutData) return;

    setProcessingPayment(true);
    setPaymentError(null);

    try {
      console.log('Starting Razorpay payment process...');
      
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      console.log('Razorpay script loaded successfully');

      // Create order first in our database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: checkoutData.total,
          status: 'pending',
          payment_method: 'Razorpay',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      console.log('Order created:', order);

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        course_id: item.course.id,
        price: item.course.price,
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (orderItemsError) {
        console.error('Error creating order items:', orderItemsError);
        throw orderItemsError;
      }

      console.log('Order items created successfully');

      // Create Razorpay order
      console.log('Creating Razorpay order...');
      const razorpayOrder = await createRazorpayOrder(checkoutData.total);
      console.log('Razorpay order created:', razorpayOrder);

      // Initialize Razorpay payment
      const options = {
        key: razorpayOrder.key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "KiKi Education",
        description: `Payment for ${cartItems.length} course(s)`,
        order_id: razorpayOrder.order_id,
        handler: async (response: any) => {
          try {
            console.log('Payment response received:', response);
            
            // Always try to verify payment even if Razorpay shows success
            const { data: verificationResult, error: verificationError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: order.id
              }
            });

            console.log('Verification result:', verificationResult);
            console.log('Verification error:', verificationError);

            // Handle verification success
            if (verificationResult && verificationResult.success) {
              console.log('Payment verified successfully!');

              // Create enrollments automatically
              for (const item of cartItems) {
                try {
                  await createEnrollment(item.course.id);
                } catch (enrollmentError) {
                  console.error(`Error creating enrollment for course ${item.course.id}:`, enrollmentError);
                }
              }

              // Clear cart
              await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id);

              // Clear checkout data from sessionStorage
              sessionStorage.removeItem('checkoutData');

              toast({
                title: "Payment Successful!",
                description: "You have been enrolled in your courses and can access them immediately.",
              });

              // Navigate based on cart contents
              const hasMBTITest = cartItems.some(item => item.course.id === MBTI_COURSE_ID);
              if (hasMBTITest) {
                navigate('/career-test');
              } else {
                navigate('/enrolled-courses');
              }
              
              setProcessingPayment(false);
              return;
            }

            // Handle verification failure
            console.error('Payment verification failed or returned error');
            
            // Show specific error message for failed verification
            const errorMsg = verificationResult?.error || verificationError?.message || 'Payment verification failed';
            
            setPaymentError(`Payment verification failed: ${errorMsg}. Payment ID: ${response.razorpay_payment_id}. Please contact our support team immediately with this payment ID if money was debited from your account.`);
            
            toast({
              title: "Payment Verification Failed",
              description: `Verification failed. If money was debited, please contact support immediately with Payment ID: ${response.razorpay_payment_id}`,
              variant: "destructive",
            });
            
            setProcessingPayment(false);

          } catch (error) {
            console.error('Error in payment handler:', error);
            setProcessingPayment(false);
            setPaymentError(`Payment processing error. Payment ID: ${response.razorpay_payment_id}. If money was debited, please contact support immediately with this payment ID.`);
            toast({
              title: "Payment Processing Error",
              description: `Processing error. If money was debited, contact support with Payment ID: ${response.razorpay_payment_id}`,
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email,
          email: user.email,
        },
        theme: {
          color: "#8B5CF6"
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            toast({
              title: "Payment Cancelled",
              description: "Your payment was cancelled. Please try again when you're ready.",
              variant: "destructive",
            });
          }
        }
      };

      console.log('Initializing Razorpay with options:', options);
      initializeRazorpay(options);

    } catch (error) {
      console.error('Error initializing Razorpay payment:', error);
      setPaymentError(`Failed to initialize payment: ${error.message}`);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setProcessingPayment(false);
    }
  };

  const hasMBTITest = cartItems.some(item => item.course.id === MBTI_COURSE_ID);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-kiki-purple-600" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-4">Add some courses to get started!</p>
              <Button onClick={() => navigate('/programs')}>
                Browse Programs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          {paymentError && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800">Payment Issue</h3>
                    <p className="text-red-700 text-sm mt-1">{paymentError}</p>
                    <p className="text-red-600 text-xs mt-2">
                      If money was debited from your account, please contact our support team immediately with the payment ID mentioned above.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-kiki-purple-100 to-kiki-blue-100 rounded-lg flex items-center justify-center">
                        {item.course.image_url ? (
                          <img 
                            src={item.course.image_url} 
                            alt={item.course.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-2xl">📚</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.course.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold text-kiki-purple-600">
                            ₹{item.course.price}
                          </span>
                          {item.course.id === MBTI_COURSE_ID && (
                            <Badge className="bg-green-100 text-green-800">
                              Instant Access
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{checkoutData?.subtotal || 0}</span>
                    </div>
                    
                    {checkoutData?.couponCode && checkoutData?.couponDiscount && (
                      <div className="flex items-center justify-between text-green-600">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          <span>Coupon ({checkoutData.couponCode}):</span>
                        </div>
                        <span>-₹{checkoutData.couponDiscount}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-kiki-purple-600">₹{checkoutData?.total || 0}</span>
                    </div>
                  </div>

                  {hasMBTITest && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">MBTI Test - Instant Access</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        You'll get immediate access to the MBTI test after payment.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Secure Payment with Razorpay
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Razorpay Secure Payment:</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>• Secure payment gateway with instant processing</p>
                      <p>• Supports Credit/Debit Cards, UPI, Net Banking & Wallets</p>
                      <p>• Amount: <strong>₹{checkoutData?.total || 0}</strong></p>
                      <p>• Automatic enrollment upon successful payment</p>
                      {hasMBTITest && (
                        <p>• MBTI test access is granted immediately</p>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={handleRazorpayPayment}
                    className="w-full" 
                    disabled={processingPayment}
                    size="lg"
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay ₹{checkoutData?.total || 0} with Razorpay
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    Powered by Razorpay • Your payment information is secure and encrypted
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
