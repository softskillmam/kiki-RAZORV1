import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserCheck, Calendar, BookOpen, RefreshCw, RotateCcw, UserPlus, Trash2, Loader2 } from 'lucide-react';
import PaymentScreenshotViewer from './PaymentScreenshotViewer';
import AdminSearchableTab from './AdminSearchableTab';
import ManualEnrollmentDialog from './ManualEnrollmentDialog';

interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: 'enrolled' | 'completed' | 'dropped' | 'pending';
  progress: number;
  completed_lessons: number;
  enrolled_at: string;
  completed_at: string | null;
  next_class_at: string | null;
  student: {
    full_name: string | null;
    email: string;
  };
  course: {
    title: string;
    total_lessons: number | null;
  };
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_screenshot_url: string | null;
  created_at: string;
  user_profile: {
    full_name: string | null;
    email: string;
  } | null;
  order_items: {
    course: {
      id: string;
      title: string;
    };
  }[];
}

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enrollments' | 'requests'>('requests');
  const [showManualEnrollmentDialog, setShowManualEnrollmentDialog] = useState(false);
  const [deletingEnrollmentId, setDeletingEnrollmentId] = useState<string | null>(null);
  const { toast } = useToast();

  // MBTI Career Test Course ID
  const MBTI_COURSE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredEnrollments(enrollments);
  }, [enrollments]);

  useEffect(() => {
    setFilteredOrders(pendingOrders);
  }, [pendingOrders]);

  const handleEnrollmentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredEnrollments(enrollments);
      return;
    }
    
    const filtered = enrollments.filter(enrollment =>
      enrollment.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEnrollments(filtered);
  };

  const handleOrderSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredOrders(pendingOrders);
      return;
    }
    
    const filtered = pendingOrders.filter(order =>
      order.user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_items.some(item => 
        item.course.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredOrders(filtered);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchEnrollments(),
        fetchPendingOrders()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch enrollment data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      console.log('Fetching pending orders...');
      
      // Get all pending orders, excluding MBTI test orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      console.log('Orders data:', ordersData);

      if (!ordersData || ordersData.length === 0) {
        console.log('No pending orders found');
        setPendingOrders([]);
        return;
      }

      // Get user profiles for these orders
      const userIds = [...new Set(ordersData.map(order => order.user_id))];
      console.log('User IDs for orders:', userIds);

      let profilesData = [];
      if (userIds.length > 0) {
        const { data, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching user profiles:', profilesError);
        } else {
          profilesData = data || [];
        }
      }

      console.log('Profiles data:', profilesData);

      // Get order items and courses for all orders
      const orderIds = ordersData.map(order => order.id);
      console.log('Order IDs:', orderIds);

      let orderItemsData = [];
      if (orderIds.length > 0) {
        const { data, error: orderItemsError } = await supabase
          .from('order_items')
          .select('order_id, course_id')
          .in('order_id', orderIds);

        if (orderItemsError) {
          console.error('Error fetching order items:', orderItemsError);
        } else {
          orderItemsData = data || [];
        }
      }

      console.log('Order items data:', orderItemsData);

      // Get course details for the items
      const courseIds = [...new Set(orderItemsData.map(item => item.course_id))];
      console.log('Course IDs from order items:', courseIds);

      let coursesData = [];
      if (courseIds.length > 0) {
        const { data, error: coursesError } = await supabase
          .from('courses')
          .select('id, title')
          .in('id', courseIds);

        if (coursesError) {
          console.error('Error fetching courses:', coursesError);
        } else {
          coursesData = data || [];
        }
      }

      console.log('Courses data for orders:', coursesData);

      // Combine all the data and filter out MBTI test orders
      const combinedOrders: Order[] = ordersData
        .map(order => {
          const userProfile = profilesData.find(p => p.id === order.user_id) || null;
          const items = orderItemsData.filter(item => item.order_id === order.id);
          
          const orderItems = items.map(item => {
            const course = coursesData.find(c => c.id === item.course_id);
            return {
              course: {
                id: item.course_id,
                title: course?.title || 'Unknown Course'
              }
            };
          });
          
          return {
            ...order,
            user_profile: userProfile,
            order_items: orderItems
          };
        })
        .filter(order => 
          // Filter out orders that contain only MBTI test
          !order.order_items.every(item => item.course.id === MBTI_COURSE_ID)
        );

      console.log('Final combined orders (excluding MBTI):', combinedOrders);
      setPendingOrders(combinedOrders);
    } catch (error) {
      console.error('Error in fetchPendingOrders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending orders.",
        variant: "destructive",
      });
    }
  };

  const fetchEnrollments = async () => {
    try {
      console.log('Fetching enrollments...');
      
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .order('enrolled_at', { ascending: false });

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        throw enrollmentsError;
      }

      console.log('Raw enrollments data:', enrollmentsData);

      if (!enrollmentsData || enrollmentsData.length === 0) {
        console.log('No enrollments found');
        setEnrollments([]);
        return;
      }

      // Get unique student IDs and course IDs
      const studentIds = [...new Set(enrollmentsData.map(e => e.student_id).filter(Boolean))];
      const courseIds = [...new Set(enrollmentsData.map(e => e.course_id).filter(Boolean))];

      console.log('Student IDs:', studentIds);
      console.log('Course IDs:', courseIds);

      // Fetch student profiles
      let studentsData = [];
      if (studentIds.length > 0) {
        const { data, error: studentsError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);

        if (studentsError) {
          console.error('Error fetching students:', studentsError);
        } else {
          studentsData = data || [];
        }
      }

      // Fetch courses
      let coursesData = [];
      if (courseIds.length > 0) {
        const { data, error: coursesError } = await supabase
          .from('courses')
          .select('id, title, total_lessons')
          .in('id', courseIds);

        if (coursesError) {
          console.error('Error fetching courses:', coursesError);
        } else {
          coursesData = data || [];
        }
      }

      console.log('Students data:', studentsData);
      console.log('Courses data:', coursesData);

      // Combine the data and filter out MBTI test enrollments
      const enrichedEnrollments = enrollmentsData
        .filter(enrollment => enrollment.course_id !== MBTI_COURSE_ID)
        .map(enrollment => {
          const student = studentsData.find(s => s.id === enrollment.student_id);
          const course = coursesData.find(c => c.id === enrollment.course_id);
          
          return {
            ...enrollment,
            student: student || { full_name: null, email: 'Unknown' },
            course: course || { title: 'Unknown Course', total_lessons: 0 }
          };
        });

      console.log('Enriched enrollments (excluding MBTI):', enrichedEnrollments);
      setEnrollments(enrichedEnrollments as Enrollment[]);
    } catch (error) {
      console.error('Error in fetchEnrollments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch enrollments.",
        variant: "destructive",
      });
    }
  };

  const updateEnrollmentStatus = async (enrollmentId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'completed') {
        const currentEnrollment = enrollments.find(e => e.id === enrollmentId);
        if (!currentEnrollment?.completed_at) {
          updateData.completed_at = new Date().toISOString();
          updateData.progress = 100;
        }
      }

      const { error } = await supabase
        .from('enrollments')
        .update(updateData)
        .eq('id', enrollmentId);

      if (error) {
        console.error('Error updating enrollment status:', error);
        toast({
          title: "Error",
          description: "Failed to update enrollment status.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Enrollment status updated successfully.",
      });

      fetchEnrollments();
    } catch (error) {
      console.error('Error in updateEnrollmentStatus:', error);
    }
  };

  const resetProgress = async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .update({
          progress: 0,
          completed_lessons: 0,
          status: 'enrolled',
          completed_at: null
        })
        .eq('id', enrollmentId);

      if (error) {
        console.error('Error resetting progress:', error);
        toast({
          title: "Error",
          description: "Failed to reset progress.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Student progress has been reset to 0%.",
      });

      fetchEnrollments();
    } catch (error) {
      console.error('Error in resetProgress:', error);
    }
  };

  const approveEnrollment = async (order: Order) => {
    try {
      console.log('Approving enrollment for order:', order.id);
      
      // Create enrollments for all courses in the order
      const enrollmentPromises = order.order_items.map(async (item) => {
        console.log('Creating enrollment for course:', item.course.id);
        
        // Check if enrollment already exists
        const { data: existingEnrollment, error: checkError } = await supabase
          .from('enrollments')
          .select('id')
          .eq('student_id', order.user_id)
          .eq('course_id', item.course.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing enrollment:', checkError);
          throw checkError;
        }

        if (existingEnrollment) {
          console.log('Enrollment already exists for user:', order.user_id, 'course:', item.course.id);
          return { data: existingEnrollment, error: null };
        }

        // Create new enrollment
        return supabase
          .from('enrollments')
          .insert({
            student_id: order.user_id,
            course_id: item.course.id,
            status: 'enrolled',
            progress: 0,
            completed_lessons: 0,
            enrolled_at: new Date().toISOString()
          })
          .select()
          .single();
      });

      const results = await Promise.all(enrollmentPromises);
      
      // Check if any enrollment creation failed
      const errors = results.filter(result => result.error && result.error.code !== '23505'); // Ignore duplicate key errors
      
      if (errors.length > 0) {
        console.error('Enrollment creation errors:', errors);
        toast({
          title: "Warning",
          description: "Some enrollments may already exist. Please check the enrollments tab.",
          variant: "default",
        });
      }

      // Update order status to completed
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', order.id);

      if (orderError) {
        console.error('Error updating order status:', orderError);
        throw orderError;
      }

      toast({
        title: "Success",
        description: "Enrollment approved and student has been enrolled.",
      });

      fetchData();
    } catch (error) {
      console.error('Error approving enrollment:', error);
      toast({
        title: "Error",
        description: "Failed to approve enrollment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const rejectEnrollment = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Enrollment request has been rejected.",
      });

      fetchPendingOrders();
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
      toast({
        title: "Error",
        description: "Failed to reject enrollment.",
        variant: "destructive",
      });
    }
  };

  const deleteEnrollment = async (enrollmentId: string, studentName: string, courseName: string) => {
    setDeletingEnrollmentId(enrollmentId);
    
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) {
        console.error('Error deleting enrollment:', error);
        toast({
          title: "Error",
          description: "Failed to remove enrollment.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Removed ${studentName} from ${courseName}.`,
      });

      fetchEnrollments();
    } catch (error) {
      console.error('Error in deleteEnrollment:', error);
      toast({
        title: "Error",
        description: "Failed to remove enrollment.",
        variant: "destructive",
      });
    } finally {
      setDeletingEnrollmentId(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'enrolled':
        return 'secondary';
      case 'dropped':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <div>Loading enrollment data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Enrollment Management
          </CardTitle>
          <CardDescription>
            Manage student enrollments and approve new requests (MBTI test orders are auto-approved)
          </CardDescription>
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === 'requests' ? 'default' : 'outline'}
              onClick={() => setActiveTab('requests')}
              size="sm"
            >
              Pending Requests ({filteredOrders.length})
            </Button>
            <Button
              variant={activeTab === 'enrollments' ? 'default' : 'outline'}
              onClick={() => setActiveTab('enrollments')}
              size="sm"
            >
              Active Enrollments ({filteredEnrollments.length})
            </Button>
            <Button
              variant="outline"
              onClick={fetchData}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {activeTab === 'enrollments' && (
              <Button
                onClick={() => setShowManualEnrollmentDialog(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Enrollment
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'requests' ? (
            <AdminSearchableTab 
              onSearch={handleOrderSearch}
              placeholder="Search by student name, email, or course..."
            >
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Screenshot</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {order.user_profile?.full_name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.user_profile?.email || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.order_items.map((item, index) => (
                              <div key={index} className="text-sm">
                                {item.course.title}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">₹{order.total_amount}</div>
                        </TableCell>
                        <TableCell>
                          <PaymentScreenshotViewer orderId={order.id} isAdmin={true} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3" />
                            {formatDate(order.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveEnrollment(order)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectEnrollment(order.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          No pending enrollment requests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </AdminSearchableTab>
          ) : (
            <AdminSearchableTab 
              onSearch={handleEnrollmentSearch}
              placeholder="Search by student name, email, or course..."
            >
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Enrolled Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {enrollment.student?.full_name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {enrollment.student?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{enrollment.course?.title}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {enrollment.completed_lessons || 0}/{enrollment.course?.total_lessons || 0} lessons
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(enrollment.status)}>
                            {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">{enrollment.progress || 0}%</div>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-600 h-2 rounded-full" 
                                style={{ width: `${enrollment.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3" />
                            {formatDate(enrollment.enrolled_at)}
                          </div>
                          {enrollment.completed_at && (
                            <div className="text-xs text-green-600">
                              Completed: {formatDate(enrollment.completed_at)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <Select
                              value={enrollment.status}
                              onValueChange={(value) => updateEnrollmentStatus(enrollment.id, value)}
                              disabled={enrollment.status === 'completed'}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="enrolled">Enrolled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="dropped">Dropped</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resetProgress(enrollment.id)}
                                className="flex-1 text-xs"
                                disabled={enrollment.progress === 0}
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Reset
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="px-2"
                                    disabled={deletingEnrollmentId === enrollment.id}
                                  >
                                    {deletingEnrollmentId === enrollment.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Enrollment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {enrollment.student?.full_name || enrollment.student?.email} from "{enrollment.course?.title}"? 
                                      This action cannot be undone and will remove all their progress.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteEnrollment(
                                        enrollment.id, 
                                        enrollment.student?.full_name || enrollment.student?.email || 'User',
                                        enrollment.course?.title || 'Course'
                                      )}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Remove Enrollment
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            {enrollment.status === 'completed' && (
                              <div className="text-xs text-gray-500">
                                Status locked
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredEnrollments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          No enrollments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </AdminSearchableTab>
          )}
        </CardContent>
      </Card>

      <ManualEnrollmentDialog 
        isOpen={showManualEnrollmentDialog}
        onClose={() => setShowManualEnrollmentDialog(false)}
        onEnrollmentAdded={fetchEnrollments}
      />
    </>
  );
};

export default EnrollmentManagement;
