import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import MBTIPersonalityCard from './mbti/MBTIPersonalityCard';
import MBTIRecommendations from './mbti/MBTIRecommendations';
import MBTIQuizForm from './mbti/MBTIQuizForm';
import { PERSONALITY_DESCRIPTIONS } from './mbti/personalityDescriptions';
import { MBTI_COURSE_MAPPING } from './mbti/mbtiCourseMapping';

interface Question {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  aValue: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  bValue: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
}

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

type MBTIType = 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP' | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP' | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ' | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

const questions: Question[] = [
  { id: 1, question: "At a party, you would rather:", optionA: "Interact with many people", optionB: "Talk to a few close friends", dimension: 'EI', aValue: 'E', bValue: 'I' },
  { id: 2, question: "You feel more energized by:", optionA: "Being around people", optionB: "Spending time alone", dimension: 'EI', aValue: 'E', bValue: 'I' },
  { id: 3, question: "When making decisions, you:", optionA: "Talk it through with others", optionB: "Think it through privately", dimension: 'EI', aValue: 'E', bValue: 'I' },
  { id: 4, question: "In group projects, you prefer to:", optionA: "Lead discussions", optionB: "Work independently first", dimension: 'EI', aValue: 'E', bValue: 'I' },
  { id: 5, question: "You are more comfortable with:", optionA: "Speaking in public", optionB: "Writing your thoughts", dimension: 'EI', aValue: 'E', bValue: 'I' },
  { id: 6, question: "After a long day, you prefer to:", optionA: "Go out with friends", optionB: "Stay home and relax", dimension: 'EI', aValue: 'E', bValue: 'I' },
  { id: 7, question: "You tend to:", optionA: "Think out loud", optionB: "Think before speaking", dimension: 'EI', aValue: 'E', bValue: 'I' },
  { id: 8, question: "In conversations, you:", optionA: "Share personal details easily", optionB: "Keep personal matters private", dimension: 'EI', aValue: 'E', bValue: 'I' },
  { id: 9, question: "You work better:", optionA: "With background noise", optionB: "In complete silence", dimension: 'EI', aValue: 'E', bValue: 'I' },
  { id: 10, question: "When stressed, you:", optionA: "Seek support from others", optionB: "Deal with it alone", dimension: 'EI', aValue: 'E', bValue: 'I' },
  { id: 11, question: "You prefer to:", optionA: "Have many acquaintances", optionB: "Have few close friends", dimension: 'EI', aValue: 'E', bValue: 'I' },
  { id: 12, question: "In meetings, you:", optionA: "Speak up frequently", optionB: "Listen more than talk", dimension: 'EI', aValue: 'E', bValue: 'I' },

  { id: 13, question: "You prefer information that is:", optionA: "Concrete and factual", optionB: "Abstract and theoretical", dimension: 'SN', aValue: 'S', bValue: 'N' },
  { id: 14, question: "You focus more on:", optionA: "Present realities", optionB: "Future possibilities", dimension: 'SN', aValue: 'S', bValue: 'N' },
  { id: 15, question: "You trust more in:", optionA: "Experience", optionB: "Intuition", dimension: 'SN', aValue: 'S', bValue: 'N' },
  { id: 16, question: "You prefer to work with:", optionA: "Proven methods", optionB: "New approaches", dimension: 'SN', aValue: 'S', bValue: 'N' },
  { id: 17, question: "You are more interested in:", optionA: "Details and specifics", optionB: "The big picture", dimension: 'SN', aValue: 'S', bValue: 'N' },
  { id: 18, question: "You prefer instructions that are:", optionA: "Step-by-step", optionB: "General guidelines", dimension: 'SN', aValue: 'S', bValue: 'N' },
  { id: 19, question: "You are more drawn to:", optionA: "Practical applications", optionB: "Theoretical concepts", dimension: 'SN', aValue: 'S', bValue: 'N' },
  { id: 20, question: "When learning, you prefer:", optionA: "Hands-on experience", optionB: "Conceptual understanding", dimension: 'SN', aValue: 'S', bValue: 'N' },
  { id: 21, question: "You notice more:", optionA: "What is actually there", optionB: "What could be there", dimension: 'SN', aValue: 'S', bValue: 'N' },
  { id: 22, question: "You value more:", optionA: "Common sense", optionB: "Innovation", dimension: 'SN', aValue: 'S', bValue: 'N' },
  { id: 23, question: "You prefer to:", optionA: "Follow established procedures", optionB: "Explore new possibilities", dimension: 'SN', aValue: 'S', bValue: 'N' },
  { id: 24, question: "You are more likely to:", optionA: "Remember facts and details", optionB: "Remember impressions and meanings", dimension: 'SN', aValue: 'S', bValue: 'N' },

  { id: 25, question: "When making decisions, you rely more on:", optionA: "Logic and analysis", optionB: "Personal values and feelings", dimension: 'TF', aValue: 'T', bValue: 'F' },
  { id: 26, question: "You are more concerned with:", optionA: "Being right", optionB: "Being tactful", dimension: 'TF', aValue: 'T', bValue: 'F' },
  { id: 27, question: "You value more:", optionA: "Justice and fairness", optionB: "Mercy and compassion", dimension: 'TF', aValue: 'T', bValue: 'F' },
  { id: 28, question: "In conflicts, you focus on:", optionA: "The issues at hand", optionB: "The people involved", dimension: 'TF', aValue: 'T', bValue: 'F' },
  { id: 29, question: "You prefer to be seen as:", optionA: "Competent", optionB: "Caring", dimension: 'TF', aValue: 'T', bValue: 'F' },
  { id: 30, question: "When giving feedback, you:", optionA: "Focus on improvement areas", optionB: "Consider the person's feelings", dimension: 'TF', aValue: 'T', bValue: 'F' },
  { id: 31, question: "You make decisions based on:", optionA: "Objective criteria", optionB: "Personal impact", dimension: 'TF', aValue: 'T', bValue: 'F' },
  { id: 32, question: "You are more motivated by:", optionA: "Achievement", optionB: "Appreciation", dimension: 'TF', aValue: 'T', bValue: 'F' },
  { id: 33, question: "In debates, you:", optionA: "Argue the facts", optionB: "Consider all viewpoints", dimension: 'TF', aValue: 'T', bValue: 'F' },
  { id: 34, question: "You prefer to:", optionA: "Be firm and tough-minded", optionB: "Be gentle and tender-hearted", dimension: 'TF', aValue: 'T', bValue: 'F' },
  { id: 35, question: "You are more interested in:", optionA: "Principles and laws", optionB: "People and their stories", dimension: 'TF', aValue: 'T', bValue: 'F' },
  { id: 36, question: "When criticized, you:", optionA: "Focus on the validity", optionB: "Feel personally affected", dimension: 'TF', aValue: 'T', bValue: 'F' },

  { id: 37, question: "You prefer to:", optionA: "Plan ahead", optionB: "Be spontaneous", dimension: 'JP', aValue: 'J', bValue: 'P' },
  { id: 38, question: "You work better with:", optionA: "Deadlines", optionB: "Open-ended timeframes", dimension: 'JP', aValue: 'J', bValue: 'P' },
  { id: 39, question: "You prefer your life to be:", optionA: "Structured and organized", optionB: "Flexible and adaptable", dimension: 'JP', aValue: 'J', bValue: 'P' },
  { id: 40, question: "When starting a project, you:", optionA: "Make a detailed plan", optionB: "Jump right in", dimension: 'JP', aValue: 'J', bValue: 'P' },
  { id: 41, question: "You prefer to:", optionA: "Settle matters quickly", optionB: "Keep options open", dimension: 'JP', aValue: 'J', bValue: 'P' },
  { id: 42, question: "Your workspace tends to be:", optionA: "Neat and organized", optionB: "Flexible and varied", dimension: 'JP', aValue: 'J', bValue: 'P' },
  { id: 43, question: "You prefer to:", optionA: "Follow a schedule", optionB: "Go with the flow", dimension: 'JP', aValue: 'J', bValue: 'P' },
  { id: 44, question: "When making plans, you:", optionA: "Stick to them", optionB: "Change as needed", dimension: 'JP', aValue: 'J', bValue: 'P' },
  { id: 45, question: "You feel better when things are:", optionA: "Decided and settled", optionB: "Open to change", dimension: 'JP', aValue: 'J', bValue: 'P' },
  { id: 46, question: "You prefer assignments that are:", optionA: "Clear and specific", optionB: "Open to interpretation", dimension: 'JP', aValue: 'J', bValue: 'P' },
  { id: 47, question: "In your daily routine, you:", optionA: "Follow a set pattern", optionB: "Vary your activities", dimension: 'JP', aValue: 'J', bValue: 'P' },
  { id: 48, question: "You are more comfortable with:", optionA: "Having everything planned", optionB: "Leaving room for surprises", dimension: 'JP', aValue: 'J', bValue: 'P' }
];

interface MBTIQuizProps {
  onComplete: (result: MBTIResult) => void;
  isRetake?: boolean;
  existingResult?: any;
}

const MBTIQuiz: React.FC<MBTIQuizProps> = ({ onComplete, isRetake = false, existingResult = null }) => {
  const [showQuiz, setShowQuiz] = useState(!existingResult);
  const [showResult, setShowResult] = useState(!!existingResult);
  const [mbtiResult, setMbtiResult] = useState<MBTIResult | null>(
    existingResult ? {
      type: existingResult.mbti_type,
      scores: {
        E: existingResult.extraversion_score,
        I: 12 - existingResult.extraversion_score,
        S: existingResult.sensing_score,
        N: 12 - existingResult.sensing_score,
        T: existingResult.thinking_score,
        F: 12 - existingResult.thinking_score,
        J: existingResult.judging_score,
        P: 12 - existingResult.judging_score
      }
    } : null
  );
  const [careers, setCareers] = useState<Career[]>([]);
  const [courses, setCourses] = useState<CourseRecommendation[]>([]);
  const [matchingCourses, setMatchingCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (existingResult && existingResult.mbti_type) {
      fetchRecommendations(existingResult.mbti_type);
    }
  }, [existingResult]);

  const handleQuizComplete = async (answers: Record<number, 'A' | 'B'>) => {
    setLoading(true);
    
    const scores = {
      E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
    };

    questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer === 'A') {
        scores[question.aValue]++;
      } else if (answer === 'B') {
        scores[question.bValue]++;
      }
    });

    const type = 
      (scores.E > scores.I ? 'E' : 'I') +
      (scores.S > scores.N ? 'S' : 'N') +
      (scores.T > scores.F ? 'T' : 'F') +
      (scores.J > scores.P ? 'J' : 'P');

    const result: MBTIResult = { type, scores };
    setMbtiResult(result);

    if (user) {
      try {
        if (isRetake || existingResult) {
          const { error: updateError } = await supabase
            .from('mbti_results')
            .update({
              mbti_type: type as MBTIType,
              extraversion_score: scores.E,
              sensing_score: scores.S,
              thinking_score: scores.T,
              judging_score: scores.J,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Error updating MBTI result:', updateError);
            toast({
              title: "Update Error",
              description: "Failed to update your test results. Please try again.",
              variant: "destructive"
            });
          }
        } else {
          const { error: insertError } = await supabase
            .from('mbti_results')
            .insert({
              user_id: user.id,
              mbti_type: type as MBTIType,
              extraversion_score: scores.E,
              sensing_score: scores.S,
              thinking_score: scores.T,
              judging_score: scores.J,
              completed_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error saving MBTI result:', insertError);
            toast({
              title: "Save Error",
              description: "Failed to save your test results. Please try again.",
              variant: "destructive"
            });
          }
        }

        await supabase
          .from('profiles')
          .update({ 
            mbti_quiz_completed: true,
            show_mbti_reminder: false 
          })
          .eq('id', user.id);

      } catch (error) {
        console.error('Error saving result:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      }
    }

    await fetchRecommendations(type as MBTIType);
    
    setShowQuiz(false);
    setShowResult(true);
    setLoading(false);
    onComplete(result);
  };

  const fetchRecommendations = async (mbtiType: MBTIType) => {
    console.log('Fetching recommendations for MBTI type:', mbtiType);
    setLoadingRecommendations(true);
    
    try {
      const { data: careerData, error: careerError } = await supabase
        .from('career_recommendations')
        .select('career_title, description, industry')
        .eq('mbti_type', mbtiType)
        .limit(6);

      if (careerError) {
        console.error('Error fetching careers:', careerError);
      } else {
        setCareers(careerData || []);
      }

      const { data: courseData, error: courseError } = await supabase
        .from('course_recommendations')
        .select('skill_title, description, category')
        .eq('mbti_type', mbtiType);

      if (courseError) {
        console.error('Error fetching courses:', courseError);
      } else {
        setCourses(courseData || []);
      }

      const relevantCategories = MBTI_COURSE_MAPPING[mbtiType] || [];
      console.log('Relevant categories for', mbtiType, ':', relevantCategories);
      
      if (relevantCategories.length > 0) {
        let query = supabase
          .from('courses')
          .select('id, title, description, category, price, original_price, duration, image_url')
          .eq('status', 'active');

        const conditions = relevantCategories.map(cat => 
          `title.ilike.%${cat}%,category.ilike.%${cat}%,description.ilike.%${cat}%`
        ).join(',');

        const { data: matchingCoursesData, error: coursesError } = await query
          .or(conditions)
          .limit(6);

        if (coursesError) {
          console.error('Error fetching matching courses:', coursesError);
          const { data: fallbackCourses } = await supabase
            .from('courses')
            .select('id, title, description, category, price, original_price, duration, image_url')
            .eq('status', 'active')
            .limit(3);
          setMatchingCourses(fallbackCourses || []);
        } else {
          console.log('Matching courses fetched:', matchingCoursesData);
          setMatchingCourses(matchingCoursesData || []);
        }
      } else {
        const { data: fallbackCourses } = await supabase
          .from('courses')
          .select('id, title, description, category, price, original_price, duration, image_url')
          .eq('status', 'active')
          .limit(3);
        setMatchingCourses(fallbackCourses || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleRetakeTest = () => {
    setShowQuiz(true);
    setShowResult(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kiki-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isRetake ? 'Updating your personality analysis...' : 'Analyzing your personality...'}
          </p>
        </div>
      </div>
    );
  }

  if (showQuiz) {
    return <MBTIQuizForm questions={questions} onComplete={handleQuizComplete} />;
  }

  if (showResult && mbtiResult) {
    const personalityInfo = PERSONALITY_DESCRIPTIONS[mbtiResult.type as keyof typeof PERSONALITY_DESCRIPTIONS];
    
    return (
      <div className="space-y-8">
        <MBTIPersonalityCard 
          result={mbtiResult} 
          personalityInfo={personalityInfo} 
          isRetake={isRetake || !!existingResult} 
        />

        <MBTIRecommendations
          mbtiType={mbtiResult.type}
          careers={careers}
          courses={courses}
          matchingCourses={matchingCourses}
          loadingRecommendations={loadingRecommendations}
        />

        <div className="flex justify-center mt-8">
          <Button 
            onClick={handleRetakeTest}
            variant="outline"
            className="bg-kiki-purple-50 hover:bg-kiki-purple-100 border-kiki-purple-300"
          >
            Retake Test & Update Results
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default MBTIQuiz;
