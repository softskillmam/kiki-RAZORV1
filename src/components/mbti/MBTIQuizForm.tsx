
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Question {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  aValue: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  bValue: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
}

interface MBTIQuizFormProps {
  questions: Question[];
  onComplete: (answers: Record<number, 'A' | 'B'>) => void;
}

const MBTIQuizForm: React.FC<MBTIQuizFormProps> = ({ questions, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});

  const handleAnswer = (answer: 'A' | 'B') => {
    const newAnswers = { ...answers, [currentQuestion]: answer };
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAnswer('A')}
              className="p-6 h-auto text-left justify-start hover:bg-kiki-purple-50 hover:border-kiki-purple-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-kiki-purple-100 flex items-center justify-center text-kiki-purple-600 font-semibold">
                  A
                </div>
                <span className="text-base">{question.optionA}</span>
              </div>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAnswer('B')}
              className="p-6 h-auto text-left justify-start hover:bg-kiki-blue-50 hover:border-kiki-blue-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-kiki-blue-100 flex items-center justify-center text-kiki-blue-600 font-semibold">
                  B
                </div>
                <span className="text-base">{question.optionB}</span>
              </div>
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              variant="ghost"
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
            >
              ← Previous
            </Button>
            <div className="text-sm text-gray-500">
              {Object.keys(answers).length} of {questions.length} answered
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MBTIQuizForm;
