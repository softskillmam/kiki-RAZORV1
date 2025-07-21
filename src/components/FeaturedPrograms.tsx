
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import EnrollButton from '@/components/EnrollButton';

interface FeaturedProgram {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  original_price: number;
  duration: string;
  mode: string;
  age_range: string;
  category: string;
}

const FeaturedPrograms = () => {
  const [featuredPrograms, setFeaturedPrograms] = useState<FeaturedProgram[]>([]);

  useEffect(() => {
    fetchFeaturedPrograms();
  }, []);

  const fetchFeaturedPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'active')
        .limit(3)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching featured programs:', error);
      } else {
        setFeaturedPrograms(data || []);
      }
    } catch (error) {
      console.error('Error fetching featured programs:', error);
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Programs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Our most popular programs designed to unlock potential and foster personal & professional growth
          </p>
          <Link to="/programs">
            <Button variant="outline" className="border-kiki-purple-600 text-kiki-purple-600 hover:bg-kiki-purple-50">
              View All Programs
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {featuredPrograms.map((program) => (
            <Card key={program.id} className="group overflow-hidden border-0 card-shadow hover:card-shadow-hover transition-all duration-300 hover-scale rounded-2xl">
              <div className="relative overflow-hidden">
                <img
                  src={program.image_url}
                  alt={program.title}
                  className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <Badge className={`text-xs ${
                    program.mode === 'Online' ? 'bg-green-100 text-green-800' :
                    program.mode === 'Offline' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {program.mode}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs">
                    {program.category}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium text-gray-700">4.8</span>
                  </div>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{program.age_range}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-kiki-purple-600 transition-colors line-clamp-2">
                  {program.title}
                </h3>
                
                <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                  {program.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>150+</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-kiki-purple-600">₹{program.price}</span>
                    {program.original_price && (
                      <span className="text-xs text-gray-500 line-through">₹{program.original_price}</span>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <EnrollButton 
                  courseId={program.id}
                  className="w-full text-sm"
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPrograms;
