import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ClarificationAnswer,
  ClarifyAnswerChoice,
  ClarifyQuestion,
  pickRandomClarifyQuestions,
} from '@/data/clarifyQuestions';

interface ClarifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (answers: ClarificationAnswer[]) => void;
}

export function ClarifyModal({ open, onOpenChange, onComplete }: ClarifyModalProps) {
  const [questions, setQuestions] = useState<ClarifyQuestion[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ClarificationAnswer[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuestions(pickRandomClarifyQuestions(3));
    setStep(0);
    setAnswers([]);
  }, [open]);

  const currentQuestion = questions[step];
  const progress = questions.length > 0 ? ((step + 1) / questions.length) * 100 : 0;

  const handleAnswer = (choice: ClarifyAnswerChoice) => {
    if (!currentQuestion) {
      return;
    }

    const nextAnswers = [
      ...answers,
      {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        category: currentQuestion.category,
        answer: choice,
      },
    ];

    if (step >= questions.length - 1) {
      onComplete(nextAnswers);
      onOpenChange(false);
      return;
    }

    setAnswers(nextAnswers);
    setStep((current) => current + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-gold/20 bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.1),transparent_34%),rgba(11,5,28,0.98)] p-0 text-foreground sm:max-w-xl">
        <div className="p-6 md:p-7">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">Clarify Before AI</p>
          <h2 className="mt-3 text-2xl text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
            Vũ trụ cần thêm một chút tín hiệu
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Trả lời nhanh 3 câu hỏi ngắn để phần luận giải AI bám sát hoàn cảnh của bạn hơn.
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span>Tiến độ</span>
              <span>
                {Math.min(step + 1, questions.length || 1)}/{questions.length || 3}
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-secondary/70" />
          </div>

          <div className="mt-6 min-h-[220px] rounded-[24px] border border-border/60 bg-background/45 p-5">
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex min-h-[180px] flex-col"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-gold/80">
                    {currentQuestion.category === 'emotion'
                      ? 'Cảm xúc'
                      : currentQuestion.category === 'context'
                        ? 'Bối cảnh'
                        : 'Hành động'}
                  </p>
                  <p className="mt-4 flex-1 text-lg leading-relaxed text-foreground/95">{currentQuestion.text}</p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <Button onClick={() => handleAnswer('yes')} className="glow-gold">
                      Có
                    </Button>
                    <Button onClick={() => handleAnswer('no')} variant="secondary">
                      Không
                    </Button>
                    <Button onClick={() => handleAnswer('skip')} variant="outline" className="border-gold/30 text-gold hover:bg-secondary">
                      Bỏ qua
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

