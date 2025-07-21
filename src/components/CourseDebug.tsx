
import React from 'react';
import { supabase } from '@/integrations/supabase/client';

const CourseDebug: React.FC = () => {
  const [courses, setCourses] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, title')
          .limit(10);
        
        if (error) {
          console.error('Error fetching courses:', error);
        } else {
          console.log('Available courses:', data);
          setCourses(data || []);
        }
      } catch (error) {
        console.error('Error in fetchCourses:', error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Course Debug Info</h3>
      <p>Available courses in database:</p>
      <ul className="text-sm">
        {courses.map((course) => (
          <li key={course.id} className="mb-1">
            <strong>ID:</strong> {course.id} <br />
            <strong>Title:</strong> {course.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseDebug;
