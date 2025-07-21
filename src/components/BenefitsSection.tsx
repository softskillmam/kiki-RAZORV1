
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Users, Trophy, Heart, Target, Sparkles } from 'lucide-react';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Brain,
      title: "Personalized Learning",
      description: "AI-powered recommendations tailored to your learning style and pace"
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from industry professionals and certified educators"
    },
    {
      icon: Trophy,
      title: "Certification",
      description: "Earn recognized certificates upon successful completion"
    },
    {
      icon: Heart,
      title: "Mental Wellness",
      description: "Holistic approach focusing on emotional and mental well-being"
    },
    {
      icon: Target,
      title: "Career Guidance",
      description: "Professional counseling to help you find your ideal career path"
    },
    {
      icon: Sparkles,
      title: "Skill Development",
      description: "Future-ready skills that prepare you for tomorrow's challenges"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-kiki-purple-50 to-kiki-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose KIKI's Learning Hub?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to providing the best learning experience with proven methodologies and cutting-edge technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="group border-0 bg-white/60 backdrop-blur-sm hover:bg-white transition-all duration-300 hover-scale rounded-2xl card-shadow hover:card-shadow-hover">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
