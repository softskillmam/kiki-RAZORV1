
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Star, Target, Shield, Zap, TrendingUp } from 'lucide-react';

interface MBTIResult {
  type: string;
  scores: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
}

interface PersonalityInfo {
  title: string;
  description: string;
  traits: string[];
  strengths: string[];
  challenges: string[];
  workStyle: string;
}

interface MBTIPersonalityCardProps {
  result: MBTIResult;
  personalityInfo: PersonalityInfo;
  isRetake?: boolean;
}

const MBTIPersonalityCard: React.FC<MBTIPersonalityCardProps> = ({ 
  result, 
  personalityInfo, 
  isRetake = false 
}) => {
  return (
    <div className="space-y-8">
      {/* Result Header */}
      <div className="text-center bg-gradient-to-r from-kiki-purple-50 to-kiki-blue-50 rounded-2xl p-8">
        <div className="w-20 h-20 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="text-white w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Personality Type</h2>
        <div className="text-6xl font-bold bg-gradient-to-r from-kiki-purple-600 to-kiki-blue-600 bg-clip-text text-transparent mb-2">
          {result.type}
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">{personalityInfo.title}</h3>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          {personalityInfo.description}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          {isRetake 
            ? 'Your personality analysis has been updated with your latest responses.'
            : 'Based on your responses, here\'s your comprehensive personality profile.'
          }
        </p>
      </div>

      {/* Personality Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Key Traits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Key Traits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {personalityInfo.traits.map((trait, index) => (
                <Badge key={index} variant="outline" className="bg-kiki-purple-50 text-kiki-purple-700 border-kiki-purple-200">
                  {trait}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Work Style */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Work Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{personalityInfo.workStyle}</p>
          </CardContent>
        </Card>
      </div>

      {/* Strengths and Challenges */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {personalityInfo.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Areas for Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {personalityInfo.challenges.map((challenge, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{challenge}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Personality Dimensions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <span className="font-medium">Extraversion vs Introversion</span>
              <Badge variant="outline" className="font-semibold bg-white">
                {result.scores.E > result.scores.I ? `E (${result.scores.E}/12)` : `I (${result.scores.I}/12)`}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <span className="font-medium">Sensing vs Intuition</span>
              <Badge variant="outline" className="font-semibold bg-white">
                {result.scores.S > result.scores.N ? `S (${result.scores.S}/12)` : `N (${result.scores.N}/12)`}
              </Badge>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <span className="font-medium">Thinking vs Feeling</span>
              <Badge variant="outline" className="font-semibold bg-white">
                {result.scores.T > result.scores.F ? `T (${result.scores.T}/12)` : `F (${result.scores.F}/12)`}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
              <span className="font-medium">Judging vs Perceiving</span>
              <Badge variant="outline" className="font-semibold bg-white">
                {result.scores.J > result.scores.P ? `J (${result.scores.J}/12)` : `P (${result.scores.P}/12)`}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MBTIPersonalityCard;
