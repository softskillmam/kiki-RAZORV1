
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface ExploreButtonProps {
  courseId: string;
  courseName?: string;
}

const ExploreButton = ({ courseId, courseName }: ExploreButtonProps) => {
  const navigate = useNavigate();

  const handleExplore = () => {
    console.log('Navigating to course:', courseId);
    navigate(`/course/${courseId}`);
  };

  return (
    <Button
      onClick={handleExplore}
      className="w-full bg-kiki-purple-600 hover:bg-kiki-purple-700 text-white"
      size="sm"
    >
      <BookOpen className="w-4 h-4 mr-2" />
      Explore Now
    </Button>
  );
};

export default ExploreButton;
