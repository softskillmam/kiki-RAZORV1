import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, BookOpen, Calendar, Award, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Enrollment {
  id: string;
  progress: number;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  next_class_at: string | null;
  course: {
    title: string;
    description: string;
  };
}

interface UserProfileData {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // MBTI course ID to exclude from profile enrollments
  const MBTI_COURSE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      fetchUserProfile();
      fetchUserEnrollments();
    }
  }, [isOpen, isAuthenticated, user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserEnrollments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(title, description)
        `)
        .eq('student_id', user.id)
        .neq('course_id', MBTI_COURSE_ID) // Exclude MBTI course
        .order('enrolled_at', { ascending: false });

      if (error) {
        console.error('Error fetching enrollments:', error);
      } else {
        setEnrollments(data || []);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (profileData?.full_name) return profileData.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserEmail = () => {
    return profileData?.email || user?.email || '';
  };

  const getMemberSince = () => {
    const date = profileData?.created_at || user?.created_at;
    if (!date) return 'Recently';
    return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getAverageProgress = () => {
    if (enrollments.length === 0) return 0;
    const totalProgress = enrollments.reduce((sum, enrollment) => sum + (enrollment.progress || 0), 0);
    return Math.round(totalProgress / enrollments.length);
  };

  const getCompletedCourses = () => {
    return enrollments.filter(enrollment => enrollment.status === 'completed').length;
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
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500 rounded-full flex items-center justify-center">
            {profileData?.avatar_url || user?.user_metadata?.avatar_url ? (
              <img 
                src={profileData?.avatar_url || user?.user_metadata?.avatar_url} 
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="text-white w-10 h-10" />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Student Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {getUserDisplayName()}</p>
              <p><span className="font-medium">Email:</span> {getUserEmail()}</p>
              {profileData?.phone && (
                <p><span className="font-medium">Phone:</span> {profileData.phone}</p>
              )}
              <p><span className="font-medium">Member Since:</span> {getMemberSince()}</p>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Enrolled Courses ({enrollments.length})
            </h3>
            {enrollments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="mx-auto w-12 h-12 text-gray-300 mb-4" />
                <p>No courses enrolled yet</p>
                <p className="text-sm">Start your learning journey by enrolling in a course!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{enrollment.course.title}</h4>
                      <Badge variant={enrollment.status === 'completed' ? 'default' : 'secondary'}>
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Progress</span>
                        <span>{enrollment.progress || 0}%</span>
                      </div>
                      <Progress value={enrollment.progress || 0} className="h-2" />
                      {enrollment.status === 'enrolled' && enrollment.next_class_at && (
                        <div className="flex items-center gap-1 text-sm text-kiki-purple-600">
                          <Calendar className="w-4 h-4" />
                          <span>Next Class: {new Date(enrollment.next_class_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      {enrollment.status === 'completed' && enrollment.completed_at && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <Award className="w-4 h-4" />
                          <span>Completed: {new Date(enrollment.completed_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-kiki-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-kiki-purple-600">{enrollments.length}</div>
              <div className="text-sm text-kiki-purple-800">Courses Enrolled</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{getAverageProgress()}%</div>
              <div className="text-sm text-blue-800">Average Progress</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
