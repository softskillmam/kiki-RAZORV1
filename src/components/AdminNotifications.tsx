
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  BookOpen, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Activity,
  Bell,
  Eye,
  UserCheck,
  BookCheck,
  CreditCard
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalOrders: number;
  totalRevenue: number;
  recentUsers: number;
  activeEnrollments: number;
}

const AdminNotifications = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentUsers: 0,
    activeEnrollments: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch all stats in parallel
      const [
        { count: totalUsers },
        { count: totalCourses },
        { count: totalOrders },
        { data: orders },
        { count: activeEnrollments }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount'),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'enrolled')
      ]);

      // Calculate total revenue
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Get recent users (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: recentUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalOrders: totalOrders || 0,
        totalRevenue: totalRevenue,
        recentUsers: recentUsers || 0,
        activeEnrollments: activeEnrollments || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: `+${stats.recentUsers} this week`,
      changeType: 'positive'
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses.toLocaleString(),
      icon: BookOpen,
      color: 'bg-green-500',
      change: 'Active courses',
      changeType: 'neutral'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'bg-purple-500',
      change: 'All time orders',
      changeType: 'neutral'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-red-500',
      change: 'Gross revenue',
      changeType: 'positive'
    }
  ];

  const quickStats = [
    {
      label: 'Active Enrollments',
      value: stats.activeEnrollments,
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      label: 'Recent Signups',
      value: stats.recentUsers,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      label: 'Course Completion',
      value: '85%',
      icon: BookCheck,
      color: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
            <p className="text-red-100">Monitor and manage your learning platform</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Activity className="w-4 h-4 mr-1" />
              Live Dashboard
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm mt-1 ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Quick Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Icon className={`w-8 h-8 ${stat.color}`} />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
              onClick={() => window.location.href = '/admin/users'}
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => window.location.href = '/admin/courses'}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Add New Course
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => window.location.href = '/admin/enrollments'}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-800 font-medium">Database</span>
              <Badge className="bg-green-500 text-white">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-800 font-medium">Authentication</span>
              <Badge className="bg-green-500 text-white">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-800 font-medium">File Storage</span>
              <Badge className="bg-green-500 text-white">Operational</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;
