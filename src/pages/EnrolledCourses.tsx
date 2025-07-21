import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Calendar, Clock, Eye, FileText, Download, Loader2, RefreshCw } from 'lucide-react';
import ExploreButton from '@/components/ExploreButton';

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number;
  duration: string | null;
  category: string | null;
}

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
  course: Course;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_method: string | null;
  payment_screenshot_url: string | null;
  created_at: string;
  order_items: {
    course: Course;
    price: number;
  }[];
}

const EnrolledCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('enrolled');

  // MBTI course ID to exclude from enrollments listing
  const MBTI_COURSE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  useEffect(() => {
    if (user) {
      fetchEnrollments();
      fetchOrders();
      
      // Set up real-time subscriptions
      const cleanup = setupRealtimeSubscriptions();
      
      // Return cleanup function for useEffect
      return cleanup;
    }
  }, [user]);

  const setupRealtimeSubscriptions = () => {
    if (!user?.id) return () => {};

    console.log('Setting up real-time subscriptions for user:', user.id);

    // Subscribe to enrollment changes
    const enrollmentChannel = supabase
      .channel('user-enrollments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enrollments',
          filter: `student_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Enrollment change detected:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
            const oldStatus = payload.old.status;
            const newStatus = payload.new.status;
            
            if (oldStatus !== newStatus) {
              toast({
                title: "Enrollment Status Updated",
                description: `Your enrollment status has been changed to ${newStatus}`,
              });
            }
          }
          
          // Refresh data
          fetchEnrollments();
        }
      )
      .subscribe();

    // Subscribe to order changes
    const orderChannel = supabase
      .channel('user-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Order change detected:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
            const oldStatus = payload.old.status;
            const newStatus = payload.new.status;
            
            if (oldStatus !== newStatus) {
              toast({
                title: "Order Status Updated",
                description: `Your order status has been changed to ${newStatus}`,
              });
            }
          }
          
          // Refresh data
          fetchOrders();
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(enrollmentChannel);
      supabase.removeChannel(orderChannel);
    };
  };

  const fetchEnrollments = async () => {
    if (!user?.id) return;

    try {
      console.log('Fetching enrollments for user:', user.id);
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (*)
        `)
        .eq('student_id', user.id)
        .neq('course_id', MBTI_COURSE_ID)
        .order('enrolled_at', { ascending: false });

      if (error) {
        console.error('Error fetching enrollments:', error);
        toast({
          title: "Error",
          description: "Failed to fetch your enrolled courses.",
          variant: "destructive",
        });
        return;
      }

      const enrollmentsData = data?.map(enrollment => ({
        ...enrollment,
        course: enrollment.courses
      })) as Enrollment[];

      console.log('Enrollments fetched:', enrollmentsData);
      setEnrollments(enrollmentsData || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const fetchOrders = async () => {
    if (!user?.id) return;

    try {
      console.log('Fetching orders for user:', user.id);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            price,
            courses (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      const ordersData = data?.map(order => ({
        ...order,
        order_items: order.order_items?.filter(item => 
          item.courses?.id !== MBTI_COURSE_ID
        ).map(item => ({
          course: item.courses,
          price: item.price
        })) || []
      })).filter(order => order.order_items.length > 0) as Order[];

      console.log('Orders fetched:', ordersData);
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchEnrollments(), fetchOrders()]);
    setRefreshing(false);
    toast({
      title: "Success",
      description: "Data refreshed successfully.",
    });
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
        return 'outline';
    }
  };

  const getOrderStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kiki-purple-50 to-kiki-blue-50 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-kiki-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiki-purple-50 to-kiki-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Dashboard</h1>
            <p className="text-gray-600">Track your progress and manage your enrolled courses</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enrolled">Enrolled Courses ({enrollments.length})</TabsTrigger>
            <TabsTrigger value="orders">Payment History ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="enrolled" className="space-y-6 mt-6">
            {enrollments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Enrolled Courses</h3>
                  <p className="text-gray-600 mb-6">You haven't enrolled in any courses yet.</p>
                  <Button onClick={() => navigate('/programs')}>
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrollments.map((enrollment) => (
                  <Card key={enrollment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      {enrollment.course.image_url ? (
                        <img
                          src={enrollment.course.image_url}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-kiki-purple-100 to-kiki-blue-100 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-kiki-purple-400" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge variant={getStatusBadgeVariant(enrollment.status)}>
                          {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{enrollment.course.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {enrollment.course.description || 'No description available'}
                      </p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{enrollment.progress || 0}%</span>
                        </div>
                        <Progress value={enrollment.progress || 0} className="h-2" />
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>{enrollment.completed_lessons || 0} lessons completed</span>
                          </div>
                          {enrollment.course.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{enrollment.course.duration}</span>
                            </div>
                          )}
                        </div>
                        
                        {enrollment.next_class_at && (
                          <div className="flex items-center gap-1 text-xs text-kiki-purple-600">
                            <Calendar className="h-3 w-3" />
                            <span>Next class: {new Date(enrollment.next_class_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <ExploreButton 
                        courseId={enrollment.course.id} 
                        courseName={enrollment.course.title}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6 mt-6">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment History</h3>
                  <p className="text-gray-600">You haven't made any payments yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                          <CardDescription>
                            {new Date(order.created_at).toLocaleDateString()} • 
                            {order.payment_method || 'UPI'}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-kiki-purple-600">
                            ₹{order.total_amount}
                          </div>
                          <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium">Courses:</h4>
                        {order.order_items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <span className="text-sm">{item.course.title}</span>
                            <span className="text-sm font-medium">₹{item.price}</span>
                          </div>
                        ))}
                      </div>
                      
                      {order.payment_screenshot_url && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <Button variant="outline" size="sm" asChild>
                            <a href={order.payment_screenshot_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-2" />
                              View Payment Screenshot
                            </a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnrolledCourses;
