import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, X } from "lucide-react";

type QuizQuestion = {
  id: number;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
};

type Quiz = {
  title: string;
  description: string;
  questions: QuizQuestion[];
};

interface QuizModalProps {
  quiz: Quiz | null;
  isOpen: boolean;
  onClose: () => void;
}

type ScoreResult = {
  score: number;
  total: number;
  percentage: number;
};

export function QuizModal({ quiz, isOpen, onClose }: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleOptionSelect = (questionId: number, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleCloseModal = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    onClose();
  };

  const calculateScore = (): ScoreResult => {
    if (!quiz) return { score: 0, total: 0, percentage: 0 };
    
    let correctCount = 0;
    quiz.questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    return {
      score: correctCount,
      total: quiz.questions.length,
      percentage: Math.round((correctCount / quiz.questions.length) * 100),
    };
  };

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const score = calculateScore();

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>{quiz.title}</DialogTitle>
            <DialogDescription>{quiz.description}</DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={handleCloseModal}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        {showResults ? (
          <div className="py-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            <h3 className="text-xl font-semibold text-center mb-4">Quiz Results</h3>
            <div className="text-center mb-6">
              <p className="text-4xl font-bold">{score.percentage}%</p>
              <p className="text-muted-foreground">
                You scored {score.score} out of {score.total}
              </p>
            </div>

            <div className="space-y-4 mt-8 px-2">
              {quiz.questions.map((question) => {
                const isCorrect = selectedAnswers[question.id] === question.correctAnswer;
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                      )}
                      <div>
                        <h4 className="font-medium">{question.question}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your answer: {selectedAnswers[question.id] || "Not answered"}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          Correct answer: {question.correctAnswer}
                        </p>
                        <p className="text-sm mt-2 p-2 bg-gray-50 rounded">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            <div className="mb-4">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
            </div>

            <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center border rounded-md p-3 cursor-pointer transition-colors ${
                    selectedAnswers[currentQuestion.id] === option.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      selectedAnswers[currentQuestion.id] === option.id
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-muted-foreground'
                    }`}
                  >
                    {option.id}
                  </div>
                  <span>{option.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="mt-auto pt-4 border-t">
          {!showResults ? (
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button onClick={handleNext}>
                {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          ) : (
            <Button onClick={handleCloseModal}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 