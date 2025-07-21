
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, X, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CouponInputProps {
  onCouponApply: (discount: number, couponCode: string) => void;
  onCouponRemove: () => void;
  appliedCoupon?: string;
  totalAmount: number;
  cartItems: Array<{ course: { id: string; title: string; price: number } }>;
}

const CouponInput: React.FC<CouponInputProps> = ({
  onCouponApply,
  onCouponRemove,
  appliedCoupon,
  totalAmount,
  cartItems
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  // MBTI Career Test Course ID
  const MBTI_COURSE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  const validateAndApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Invalid Coupon",
        description: "Please enter a coupon code.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      console.log('Validating coupon:', couponCode.trim());
      
      // Fetch coupon from database
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', couponCode.trim()) // Case-insensitive match
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching coupon:', error);
        toast({
          title: "Error",
          description: "Failed to validate coupon. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!coupon) {
        toast({
          title: "Invalid Coupon",
          description: "This coupon code is not valid or is inactive.",
          variant: "destructive",
        });
        return;
      }

      console.log('Coupon found:', coupon);

      // Check if coupon has expired
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        toast({
          title: "Expired Coupon",
          description: "This coupon code has expired.",
          variant: "destructive",
        });
        return;
      }

      // Check if coupon has usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        toast({
          title: "Coupon Limit Reached",
          description: "This coupon has reached its usage limit.",
          variant: "destructive",
        });
        return;
      }

      // Check course restrictions
      if (coupon.course_restrictions && coupon.course_restrictions.length > 0) {
        console.log('Checking course restrictions:', coupon.course_restrictions);
        console.log('Cart items:', cartItems.map(item => ({ id: item.course.id, title: item.course.title })));
        
        const hasRestrictedCourse = cartItems.some(item => 
          coupon.course_restrictions.includes(item.course.id)
        );

        if (!hasRestrictedCourse) {
          // Find which courses the coupon applies to
          const restrictedCourseIds = coupon.course_restrictions;
          console.log('Coupon restricted to course IDs:', restrictedCourseIds);
          
          if (restrictedCourseIds.includes(MBTI_COURSE_ID)) {
            toast({
              title: "Course Restriction",
              description: "This coupon is only valid for the MBTI Personality Test course. Please add it to your cart first.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Course Restriction",
              description: "This coupon is not applicable to the courses in your cart.",
              variant: "destructive",
            });
          }
          return;
        }
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (coupon.discount_type === 'fixed') {
        discountAmount = Math.min(coupon.discount_amount, totalAmount);
      } else if (coupon.discount_type === 'percentage') {
        discountAmount = Math.min((totalAmount * coupon.discount_amount) / 100, totalAmount);
      }

      console.log('Discount calculated:', discountAmount);

      // Apply the coupon
      onCouponApply(discountAmount, coupon.code);
      setCouponCode('');
      
      toast({
        title: "Coupon Applied!",
        description: `You saved ₹${discountAmount} with coupon ${coupon.code.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Error validating coupon:', error);
      toast({
        title: "Error",
        description: "Failed to validate coupon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemove();
    toast({
      title: "Coupon Removed",
      description: "Coupon has been removed from your order.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateAndApplyCoupon();
    }
  };

  return (
    <div className="space-y-4">
      {appliedCoupon ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {appliedCoupon}
            </Badge>
            <span className="text-sm text-green-700 font-medium">Applied</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="text-green-700 hover:text-green-800 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Have a coupon code?</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isValidating}
            />
            <Button
              onClick={validateAndApplyCoupon}
              disabled={isValidating || !couponCode.trim()}
              className="whitespace-nowrap"
            >
              {isValidating ? "Validating..." : "Apply"}
            </Button>
          </div>
          {couponCode.toUpperCase() === 'TEST495' && (
            <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>This coupon is only valid for the MBTI Personality Test course.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponInput;
