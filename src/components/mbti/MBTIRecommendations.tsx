
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap } from 'lucide-react';
import ExploreButton from '@/components/ExploreButton';

interface Career {
  career_title: string;
  description: string;
  industry: string;
}

interface CourseRecommendation {
  skill_title: string;
  description: string;
  category: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  original_price?: number;
  duration: string;
  image_url?: string;
}

interface MBTIRecommendationsProps {
  mbtiType: string;
  careers: Career[];
  courses: CourseRecommendation[];
  matchingCourses: Course[];
  loadingRecommendations: boolean;
}

const MBTIRecommendations: React.FC<MBTIRecommendationsProps> = ({
  mbtiType,
  careers,
  courses,
  matchingCourses,
  loadingRecommendations
}) => {
  if (loadingRecommendations) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kiki-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your personalized recommendations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Career Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Career Recommendations for {mbtiType}
            <Badge variant="secondary" className="ml-2">{careers.length} found</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {careers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {careers.map((career, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-blue-50 hover:from-blue-50 hover:to-blue-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{career.career_title}</h3>
                      {career.industry && (
                        <Badge variant="outline" className="text-xs mb-2">{career.industry}</Badge>
                      )}
                    </div>
                  </div>
                  {career.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">{career.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No Career Recommendations Found</h3>
              <p className="text-sm">We're continuously updating our database with more career recommendations for {mbtiType} types.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matching Courses from Database */}
      {matchingCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              Recommended Courses for {mbtiType}
              <Badge variant="secondary" className="ml-2">{matchingCourses.length} found</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchingCourses.map((course, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-purple-50 hover:from-purple-50 hover:to-purple-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                      {course.category && (
                        <Badge variant="outline" className="text-xs mb-2">{course.category}</Badge>
                      )}
                    </div>
                  </div>
                  {course.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{course.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-500">{course.duration}</span>
                    <div className="flex items-center gap-2">
                      {course.original_price && course.original_price > course.price && (
                        <span className="text-gray-400 line-through">₹{course.original_price}</span>
                      )}
                      <span className="font-semibold text-purple-600">₹{course.price}</span>
                    </div>
                  </div>
                  <ExploreButton 
                    courseId={course.id} 
                    courseName={course.title}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MBTIRecommendations;
