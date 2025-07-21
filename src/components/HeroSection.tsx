
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleExplorePrograms = () => {
    navigate('/programs');
  };

  const handleTakeCareerTest = () => {
    navigate('/career-test');
  };

  return <section className="relative overflow-hidden bg-gradient-to-br from-kiki-purple-50 via-white to-kiki-blue-50 py-20 lg:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-kiki-purple-200 to-kiki-blue-200 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-kiki-blue-200 to-kiki-purple-200 opacity-20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-kiki-purple-100 px-4 py-2 text-sm font-medium text-kiki-purple-800">
              <Star className="h-4 w-4" />
              Trusted by 10,000+ learners
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-kiki-purple-600 to-kiki-blue-600 bg-clip-text text-transparent">
                KIKI's Learning Hub
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              <span className="font-semibold text-kiki-purple-700">Know thyself, Grow thyself</span>
              <br />
              Discover your potential with our comprehensive programs for kids, teens, parents, and professionals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg" 
                className="bg-kiki-purple-600 hover:bg-kiki-purple-700 hover-scale"
                onClick={handleExplorePrograms}
              >
                Explore Programs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-kiki-purple-600 text-kiki-purple-600 hover:bg-kiki-purple-50 hover-scale"
                onClick={handleTakeCareerTest}
              >
                Take Career Test
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-kiki-purple-600" />
                <span>10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-kiki-blue-600" />
                <span>500+ Programs</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </div>

          {/* Right content - Hero image */}
          <div className="flex-1 animate-slide-up">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden card-shadow-hover">
                <img src="https://raw.githubusercontent.com/softskillmam/kiki-learn-grow-21/main/public/lovable-uploads/b39e0e16-a383-4d82-ab0f-0e9a52835b1d.png" alt="Speaker presenting to audience" className="w-full h-auto" />
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 bg-white rounded-2xl p-4 card-shadow animate-bounce">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Live Session</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 card-shadow">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-kiki-purple-600" />
                  <span className="text-sm font-medium">15+ Courses</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};

export default HeroSection;
