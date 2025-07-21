
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
}

interface Course {
  id: string;
  title: string;
}

interface ManualEnrollmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEnrollmentAdded: () => void;
}

const ManualEnrollmentDialog = ({ isOpen, onClose, onEnrollmentAdded }: ManualEnrollmentDialogProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // MBTI Career Test Course ID to filter out
  const MBTI_COURSE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  useEffect(() => {
    if (isOpen) {
      fetchUsersAndCourses();
    }
  }, [isOpen]);

  const fetchUsersAndCourses = async () => {
    setIsLoading(true);
    try {
      // Fetch users (students only)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('role', 'student')
        .order('full_name');

      if (usersError) throw usersError;

      // Fetch courses (excluding MBTI test)
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title')
        .eq('status', 'active')
        .neq('id', MBTI_COURSE_ID)
        .order('title');

      if (coursesError) throw coursesError;

      setUsers(usersData || []);
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users and courses.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser || !selectedCourse) {
      toast({
        title: "Error",
        description: "Please select both a user and a course.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if enrollment already exists
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', selectedUser)
        .eq('course_id', selectedCourse)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingEnrollment) {
        toast({
          title: "Error",
          description: "User is already enrolled in this course.",
          variant: "destructive",
        });
        return;
      }

      // Create new enrollment
      const { error: insertError } = await supabase
        .from('enrollments')
        .insert({
          student_id: selectedUser,
          course_id: selectedCourse,
          status: 'enrolled',
          progress: 0,
          completed_lessons: 0,
          enrolled_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "User has been enrolled successfully.",
      });

      setSelectedUser('');
      setSelectedCourse('');
      onEnrollmentAdded();
      onClose();
    } catch (error) {
      console.error('Error creating enrollment:', error);
      toast({
        title: "Error",
        description: "Failed to enroll user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Manual Enrollment
          </DialogTitle>
          <DialogDescription>
            Manually enroll a user in a course. This will create an active enrollment.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="user-select">Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user to enroll" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course-select">Select Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isLoading || !selectedUser || !selectedCourse}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Enrolling...
              </>
            ) : (
              'Enroll User'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualEnrollmentDialog;
