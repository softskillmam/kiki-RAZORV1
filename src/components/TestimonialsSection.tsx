
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Parent",
      content: "My daughter discovered her passion for coding through KIKI's programs. The personalized approach and expert guidance helped her build confidence and skills.",
      rating: 5,
      avatar: "PS"
    },
    {
      id: 2,
      name: "Rahul Gupta",
      role: "Student",
      content: "The career guidance session was a game-changer for me. I finally found clarity about my future goals and the steps needed to achieve them.",
      rating: 5,
      avatar: "RG"
    },
    {
      id: 3,
      name: "Sneha Patel",
      role: "Professional",
      content: "The certification program helped me upskill and advance in my career. The instructors were knowledgeable and the content was relevant to industry needs.",
      rating: 5,
      avatar: "SP"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Learners Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our community of learners has to say about their experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-0 card-shadow hover:card-shadow-hover transition-all duration-300 hover-scale rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-kiki-purple-300 mr-2" />
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
