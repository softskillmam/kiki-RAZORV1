
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import CouponInput from '@/components/CouponInput';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCartUpdate?: () => void;
}

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
  };
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, onCartUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      fetchCartItems();
    }
  }, [isOpen, isAuthenticated, user]);

  const fetchCartItems = async () => {
    if (!user?.id) {
      console.log('No user ID for fetching cart items');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching cart items for user:', user.id);

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
            original_price
          )
        `)
        .eq('user_id', user.id);

      if (cartError) {
        console.error('Error fetching cart items:', cartError);
        toast({
          title: "Error",
          description: `Failed to load cart items: ${cartError.message}`,
          variant: "destructive",
        });
        setCartItems([]);
      } else {
        console.log('Cart data fetched successfully:', cartData);
        setCartItems(cartData || []);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: "Error",
        description: "Failed to load cart items.",
        variant: "destructive",
      });
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user?.id) {
      console.error('No user ID for removing cart item');
      return;
    }

    try {
      console.log('Removing cart item:', { cartItemId, userId: user.id });

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing from cart:', error);
        toast({
          title: "Error",
          description: `Failed to remove item from cart: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Successfully removed from cart');
        toast({
          title: "Removed",
          description: "Course removed from cart.",
        });
        await fetchCartItems();
        onCartUpdate?.();
        
        // Reset coupon if cart becomes empty or doesn't contain restricted courses
        if (appliedCoupon) {
          const updatedItems = cartItems.filter(item => item.id !== cartItemId);
          if (updatedItems.length === 0) {
            handleCouponRemove();
          } else {
            // Check if applied coupon is still valid for remaining items
            validateCouponAfterRemoval(updatedItems);
          }
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  const validateCouponAfterRemoval = async (updatedItems: CartItem[]) => {
    if (!appliedCoupon) return;
    
    try {
      // Fetch the applied coupon details
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', appliedCoupon)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !coupon) {
        handleCouponRemove();
        return;
      }

      // Check if coupon restrictions are still met
      if (coupon.course_restrictions && coupon.course_restrictions.length > 0) {
        const hasRestrictedCourse = updatedItems.some(item => 
          coupon.course_restrictions.includes(item.course.id)
        );

        if (!hasRestrictedCourse) {
          handleCouponRemove();
          toast({
            title: "Coupon Removed",
            description: "Coupon was removed because it's no longer applicable to your cart items.",
          });
        }
      }
    } catch (error) {
      console.error('Error validating coupon after removal:', error);
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

  const handleViewFullCart = () => {
    onClose();
    navigate('/cart');
  };

  const handleCheckout = () => {
    // Store coupon information in sessionStorage for checkout
    const checkoutData = {
      items: cartItems,
      subtotal: getSubtotal(),
      couponCode: appliedCoupon,
      couponDiscount: couponDiscount,
      total: getTotal()
    };
    
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    onClose();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-2xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-kiki-purple-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500 rounded-full flex items-center justify-center">
            <ShoppingCart className="text-white w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            My Cart ({cartItems.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="mx-auto w-12 h-12 text-gray-300 mb-4" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add some courses to get started!</p>
            </div>
          ) : (
            <>
              {cartItems.slice(0, 3).map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.course?.image_url || '/placeholder.svg'}
                        alt={item.course?.title || 'Course'}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.course?.title || 'Unknown Course'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {item.course?.description || 'No description available'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-kiki-purple-600">
                              ₹{item.course?.price || 0}
                            </span>
                            {item.course?.original_price && (
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

              {cartItems.length > 3 && (
                <div className="text-center text-sm text-gray-500">
                  ... and {cartItems.length - 3} more items
                </div>
              )}

              {/* Coupon Section */}
              <div className="pt-4">
                <CouponInput
                  onCouponApply={handleCouponApply}
                  onCouponRemove={handleCouponRemove}
                  appliedCoupon={appliedCoupon}
                  totalAmount={getSubtotal()}
                  cartItems={cartItems}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{getSubtotal()}</span>
                </div>
                
                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span className="text-sm">Discount ({appliedCoupon}):</span>
                    <span className="font-medium">-₹{couponDiscount}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-kiki-purple-600">
                    ₹{getTotal()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-kiki-purple-600 hover:bg-kiki-purple-700"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
                <Button
                  onClick={handleViewFullCart}
                  variant="outline"
                  className="w-full"
                >
                  View Full Cart
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Cart;
