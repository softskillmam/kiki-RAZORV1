
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Trash2, Loader2, ArrowRight } from 'lucide-react';
import CouponInput from '@/components/CouponInput';

interface CartItem {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
  course: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    price: number;
    original_price: number;
    category: string;
  };
}

const Cart = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchCartItems = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select(`
          id,
          user_id,
          course_id,
          created_at,
          course:courses (
            id,
            title,
            description,
            image_url,
            price,
            original_price,
            category
          )
        `)
        .eq('user_id', user.id);

      if (cartError) {
        console.error('Error fetching cart items:', cartError);
        toast({
          title: "Error",
          description: "Failed to load cart items.",
          variant: "destructive",
        });
        setCartItems([]);
      } else {
        setCartItems(cartData || []);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove item from cart.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Removed",
          description: "Course removed from cart.",
        });
        await fetchCartItems();
        // Reset coupon if cart becomes empty or doesn't contain restricted courses
        if (appliedCoupon) {
          const updatedItems = cartItems.filter(item => item.id !== cartItemId);
          if (updatedItems.length === 0) {
            handleCouponRemove();
          }
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handleCouponApply = (discount: number, couponCode: string) => {
    setAppliedCoupon(couponCode);
    setCouponDiscount(discount);
  };

  const handleCouponRemove = () => {
    setAppliedCoupon('');
    setCouponDiscount(0);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.course?.price || 0), 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    return Math.max(0, subtotal - couponDiscount);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add some courses to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }
    
    // Pass data to checkout including coupon information
    const checkoutData = {
      items: cartItems,
      subtotal: getSubtotal(),
      couponCode: appliedCoupon,
      couponDiscount: couponDiscount,
      total: getTotal()
    };
    
    // Store in sessionStorage for checkout page
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Login Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">Please log in to view your cart.</p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Login
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-kiki-purple-600" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          {cartItems.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Browse our courses to get started!</p>
                <Button onClick={() => navigate('/programs')}>
                  Browse Programs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <img
                          src={item.course?.image_url || '/placeholder.svg'}
                          alt={item.course?.title || 'Course'}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.course?.title || 'Unknown Course'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {item.course?.description || 'No description available'}
                          </p>
                          {item.course?.category && (
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mb-2">
                              {item.course.category}
                            </span>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-kiki-purple-600">
                                ₹{item.course?.price || 0}
                              </span>
                              {item.course?.original_price && item.course.original_price !== item.course.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{item.course.original_price}
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Coupon Input */}
                    <CouponInput
                      onCouponApply={handleCouponApply}
                      onCouponRemove={handleCouponRemove}
                      appliedCoupon={appliedCoupon}
                      totalAmount={getSubtotal()}
                      cartItems={cartItems}
                    />

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">₹{getSubtotal()}</span>
                      </div>
                      
                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Coupon Discount ({appliedCoupon})</span>
                          <span>-₹{couponDiscount}</span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-kiki-purple-600">₹{getTotal()}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-kiki-purple-600 hover:bg-kiki-purple-700"
                      size="lg"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    <Button
                      onClick={() => navigate('/programs')}
                      variant="outline"
                      className="w-full"
                    >
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cart;
