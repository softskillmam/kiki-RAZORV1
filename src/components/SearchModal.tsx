
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, Users, Star } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const programs = [
    {
      id: 1,
      title: "Art & Craft Classes",
      description: "Express creativity through various art forms and hands-on craft projects",
      price: "₹2,999",
      duration: "6 weeks",
      students: 124,
      rating: 4.8,
      category: "Arts"
    },
    {
      id: 2,
      title: "Spoken English Class",
      description: "Master fluent English communication and build confidence in speaking",
      price: "₹1,999",
      duration: "8 weeks",
      students: 189,
      rating: 4.9,
      category: "Language"
    },
    {
      id: 3,
      title: "Spoken Hindi Class",
      description: "Learn to speak Hindi fluently with proper pronunciation and grammar",
      price: "₹1,799",
      duration: "8 weeks",
      students: 95,
      rating: 4.7,
      category: "Language"
    },
    {
      id: 4,
      title: "Soft Skill Training",
      description: "Develop essential soft skills for personal and professional success",
      price: "₹3,499",
      duration: "4 weeks",
      students: 267,
      rating: 4.8,
      category: "Professional"
    },
    {
      id: 5,
      title: "Public Speaking",
      description: "Overcome stage fear and become a confident public speaker",
      price: "₹2,499",
      duration: "3 weeks",
      students: 156,
      rating: 4.9,
      category: "Communication"
    },
    {
      id: 6,
      title: "Personality Development Class",
      description: "Transform your personality and build lasting confidence",
      price: "₹3,999",
      duration: "6 weeks",
      students: 198,
      rating: 4.8,
      category: "Personal"
    },
    {
      id: 7,
      title: "Career Counseling",
      description: "Discover your perfect career path with expert guidance and assessment",
      price: "₹1,499",
      duration: "2 sessions",
      students: 89,
      rating: 4.9,
      category: "Career"
    },
    {
      id: 8,
      title: "Health Insurance",
      description: "Comprehensive health insurance consultation and planning services",
      price: "₹999",
      duration: "1 session",
      students: 76,
      rating: 4.6,
      category: "Insurance"
    },
    {
      id: 9,
      title: "Tarot Reading",
      description: "Gain insights into your life journey through professional tarot readings",
      price: "₹599",
      duration: "1 session",
      students: 134,
      rating: 4.7,
      category: "Spiritual"
    },
    {
      id: 10,
      title: "Business Consulting",
      description: "Strategic business guidance to grow and scale your venture",
      price: "₹4,999",
      duration: "4 sessions",
      students: 45,
      rating: 4.9,
      category: "Business"
    }
  ];

  const filteredPrograms = useMemo(() => {
    if (!searchQuery.trim()) return programs;
    
    return programs.filter(program => 
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-white border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-6 h-6" />
            Search Courses
          </DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search for courses, skills, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">No courses found matching your search.</p>
              <p className="text-sm text-gray-500 mt-1">Try searching with different keywords.</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-4">
                Found {filteredPrograms.length} course{filteredPrograms.length !== 1 ? 's' : ''}
                {searchQuery && ` for "${searchQuery}"`}
              </div>
              
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {filteredPrograms.map((program) => (
                  <div key={program.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{program.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {program.category}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3 text-sm">{program.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{program.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{program.students}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{program.rating}</span>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-kiki-purple-600">{program.price}</span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-kiki-purple-600 hover:bg-kiki-purple-700"
                      onClick={() => {
                        // Handle course selection
                        console.log('Selected course:', program.title);
                        onClose();
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
