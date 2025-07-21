
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Tag, Loader2 } from 'lucide-react';
import CouponForm from './CouponForm';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_amount: number;
  course_restrictions: string[] | null;
  is_active: boolean;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

interface Course {
  id: string;
  title: string;
}

const CouponManagement = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      console.log('Fetching coupons...');
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coupons:', error);
        throw error;
      }
      
      console.log('Coupons fetched:', data);
      setCoupons(data || []);
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch coupons",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchCourses = useCallback(async () => {
    try {
      console.log('Fetching courses...');
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }
      
      console.log('Courses fetched:', data);
      setCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch courses",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCoupons(), fetchCourses()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchCoupons, fetchCourses]);

  const handleOpenDialog = (coupon?: Coupon) => {
    console.log('Opening dialog with coupon:', coupon);
    setEditingCoupon(coupon || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    console.log('Closing dialog');
    setIsDialogOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (formData: any) => {
    console.log('Submitting form with data:', formData);
    setIsSubmitting(true);
    
    try {
      const couponData = {
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discount_type,
        discount_amount: parseFloat(formData.discount_amount),
        course_restrictions: formData.course_restrictions.length > 0 ? formData.course_restrictions : null,
        is_active: formData.is_active,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_until: formData.valid_until || null,
      };

      console.log('Coupon data to save:', couponData);

      if (editingCoupon) {
        console.log('Updating existing coupon:', editingCoupon.id);
        const { error } = await supabase
          .from('coupons')
          .update({ ...couponData, updated_at: new Date().toISOString() })
          .eq('id', editingCoupon.id);

        if (error) {
          console.error('Error updating coupon:', error);
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Coupon updated successfully",
        });
      } else {
        console.log('Creating new coupon');
        const { error } = await supabase
          .from('coupons')
          .insert([couponData]);

        if (error) {
          console.error('Error creating coupon:', error);
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Coupon created successfully",
        });
      }

      handleCloseDialog();
      await fetchCoupons();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save coupon",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      console.log('Deleting coupon:', couponId);
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) {
        console.error('Error deleting coupon:', error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
      
      await fetchCoupons();
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      console.log('Toggling coupon status:', couponId, 'from', currentStatus, 'to', !currentStatus);
      const { error } = await supabase
        .from('coupons')
        .update({ 
          is_active: !currentStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', couponId);

      if (error) {
        console.error('Error updating coupon status:', error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      
      await fetchCoupons();
    } catch (error: any) {
      console.error('Error updating coupon status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Coupon Management
              </CardTitle>
              <CardDescription>
                Create and manage discount coupons for courses
              </CardDescription>
            </div>
            <Button 
              onClick={() => handleOpenDialog()} 
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Coupon
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No coupons created yet
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((coupon) => {
                    const assignedCourse = coupon.course_restrictions && coupon.course_restrictions.length > 0 
                      ? courses.find(c => c.id === coupon.course_restrictions![0])
                      : null;
                    
                    return (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-mono font-medium">
                          {coupon.code}
                        </TableCell>
                        <TableCell>
                          {coupon.discount_type === 'fixed' ? 'Fixed' : 'Percentage'}
                        </TableCell>
                        <TableCell>
                          {coupon.discount_type === 'fixed' 
                            ? `₹${coupon.discount_amount}` 
                            : `${coupon.discount_amount}%`
                          }
                        </TableCell>
                        <TableCell>
                          {assignedCourse ? (
                            <Badge variant="secondary" className="text-xs">
                              {assignedCourse.title}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-500">All Courses</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {coupon.used_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''}
                        </TableCell>
                        <TableCell>
                          <Badge variant={coupon.is_active ? "default" : "secondary"}>
                            {coupon.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {coupon.valid_until 
                            ? new Date(coupon.valid_until).toLocaleDateString()
                            : 'No expiry'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(coupon)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                            >
                              {coupon.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(coupon.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon ? 'Update coupon details' : 'Fill in the details to create a new coupon'}
            </DialogDescription>
          </DialogHeader>
          
          <CouponForm
            coupon={editingCoupon}
            courses={courses}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponManagement;
