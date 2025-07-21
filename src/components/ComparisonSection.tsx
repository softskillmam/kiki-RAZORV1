
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

const ComparisonSection = () => {
  const comparisonData = [
    {
      skill: "Social & Emotional Learning",
      harvard: false,
      kiki: true
    },
    {
      skill: "Presentation Skills",
      harvard: false,
      kiki: true
    },
    {
      skill: "Confidence Building",
      harvard: true,
      kiki: true
    },
    {
      skill: "Critical Thinking",
      harvard: true,
      kiki: true
    },
    {
      skill: "Thought Structuring",
      harvard: false,
      kiki: true
    },
    {
      skill: "Quick and Fluent Thinking",
      harvard: false,
      kiki: true
    },
    {
      skill: "Convergence and Divergence",
      harvard: true,
      kiki: true
    },
    {
      skill: "Mind & Concept Mapping",
      harvard: false,
      kiki: true
    },
    {
      skill: "Business Vocabulary",
      harvard: false,
      kiki: true
    },
    {
      skill: "Public Speaking",
      harvard: false,
      kiki: true
    },
    {
      skill: "Goal Mapping",
      harvard: true,
      kiki: true
    },
    {
      skill: "Change Leadership",
      harvard: true,
      kiki: true
    },
    {
      skill: "Conflict Management",
      harvard: true,
      kiki: true
    },
    {
      skill: "Handling Difficult Conversations",
      harvard: true,
      kiki: true
    },
    {
      skill: "Delegation",
      harvard: true,
      kiki: true
    },
    {
      skill: "Informed Decision Making",
      harvard: true,
      kiki: true
    },
    {
      skill: "Networking",
      harvard: true,
      kiki: true
    },
    {
      skill: "Persuasion, Negotiation & Assertiveness Skills",
      harvard: true,
      kiki: true
    },
    {
      skill: "Articulation",
      harvard: false,
      kiki: true
    },
    {
      skill: "Receiving & Giving Feedback",
      harvard: false,
      kiki: true
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose KIKI's Learning Hub?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how we compare with leading institutions and why we're the perfect choice for comprehensive skill development
          </p>
        </div>

        <Card className="max-w-4xl mx-auto card-shadow rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-kiki-purple-600 to-kiki-blue-600 text-white p-6">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-lg font-semibold">Focus on Skills</div>
                <div className="text-center text-lg font-semibold">Harvard</div>
                <div className="text-center text-lg font-semibold flex items-center justify-center gap-2">
                  <div className="h-6 w-6 rounded bg-white flex items-center justify-center">
                    <div className="h-3 w-3 rounded bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500"></div>
                  </div>
                  KIKI's
                </div>
              </div>
            </div>

            {/* Comparison rows */}
            <div className="divide-y divide-gray-200">
              {comparisonData.map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900 text-sm md:text-base">
                    {item.skill}
                  </div>
                  <div className="flex justify-center">
                    {item.harvard ? (
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {item.kiki ? (
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-kiki-purple-50 to-kiki-blue-50 p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Reasons Why KIKI's Is Suitable For You!
              </h3>
              <p className="text-gray-600">
                Comprehensive skill development with personalized attention and practical application
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ComparisonSection;
