
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface Course {
  id: string;
  title: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_amount: number;
  course_restrictions: string[] | null;
  is_active: boolean;
  usage_limit: number | null;
  valid_until: string | null;
}

interface CouponFormProps {
  coupon?: Coupon | null;
  courses: Course[];
  isSubmitting: boolean;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

const CouponForm = ({ coupon, courses, isSubmitting, onSubmit, onCancel }: CouponFormProps) => {
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    discount_type: coupon?.discount_type || 'fixed',
    discount_amount: coupon?.discount_amount?.toString() || '',
    course_restrictions: coupon?.course_restrictions || [],
    is_active: coupon?.is_active ?? true,
    usage_limit: coupon?.usage_limit?.toString() || '',
    valid_until: coupon?.valid_until ? coupon.valid_until.split('T')[0] : ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      alert('Coupon code is required');
      return;
    }
    
    if (!formData.discount_amount || parseFloat(formData.discount_amount) <= 0) {
      alert('Discount amount must be greater than 0');
      return;
    }

    onSubmit(formData);
  };

  const handleCourseRestrictionChange = (value: string) => {
    if (value === 'all-courses') {
      setFormData({ 
        ...formData, 
        course_restrictions: [] 
      });
    } else {
      setFormData({ 
        ...formData, 
        course_restrictions: [value] 
      });
    }
  };

  const getCurrentCourseValue = () => {
    if (!formData.course_restrictions || formData.course_restrictions.length === 0) {
      return 'all-courses';
    }
    return formData.course_restrictions[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">Coupon Code</Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., SAVE20"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discount_type">Discount Type</Label>
          <Select
            value={formData.discount_type}
            onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount_amount">
            {formData.discount_type === 'fixed' ? 'Amount (₹)' : 'Percentage (%)'}
          </Label>
          <Input
            id="discount_amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.discount_amount}
            onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
            placeholder={formData.discount_type === 'fixed' ? '500' : '20'}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="course_restrictions">Course Restrictions (Optional)</Label>
        <Select
          value={getCurrentCourseValue()}
          onValueChange={handleCourseRestrictionChange}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select course (leave empty for all courses)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-courses">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="usage_limit">Usage Limit (Optional)</Label>
          <Input
            id="usage_limit"
            type="number"
            min="1"
            value={formData.usage_limit}
            onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
            placeholder="Unlimited"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valid_until">Valid Until (Optional)</Label>
          <Input
            id="valid_until"
            type="date"
            value={formData.valid_until}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          disabled={isSubmitting}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {coupon ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {coupon ? 'Update' : 'Create'} Coupon
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CouponForm;
