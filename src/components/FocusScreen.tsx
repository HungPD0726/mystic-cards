import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface FocusScreenProps {
  question: string;
  onComplete: () => void;
  duration?: number;
}

export function FocusScreen({ question, onComplete, duration = 10 }: FocusScreenProps) {
  const [remainingMs, setRemainingMs] = useState(duration * 1000);
  const circumference = 2 * Math.PI * 44;

  useEffect(() => {
    const startedAt = window.performance.now();

    const timer = window.setInterval(() => {
      const elapsed = window.performance.now() - startedAt;
      const nextRemaining = Math.max(duration * 1000 - elapsed, 0);
      setRemainingMs(nextRemaining);

      if (nextRemaining <= 0) {
        window.clearInterval(timer);
        onComplete();
      }
    }, 100);

    return () => {
      window.clearInterval(timer);
    };
  }, [duration, onComplete]);

  const countdown = Math.ceil(remainingMs / 1000);
  const progress = useMemo(() => 1 - remainingMs / (duration * 1000), [duration, remainingMs]);
  const dashOffset = circumference * progress;

  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.12),transparent_35%),linear-gradient(180deg,rgba(6,3,18,0.96),rgba(8,4,22,0.98))] px-4"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(247,209,114,0.08),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(87,43,150,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(64,105,210,0.14),transparent_24%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center rounded-[32px] border border-gold/20 bg-background/55 px-6 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:px-10"
      >
        <p className="text-xs uppercase tracking-[0.34em] text-gold/80">Focus Ritual</p>
        <h2 className="mt-3 text-2xl italic text-gold md:text-4xl" style={{ fontFamily: 'Cinzel, serif' }}>
          Hít thở sâu... tập trung vào câu hỏi của bạn
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/90 md:text-xl">
          "{question}"
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Hãy để tâm trí lắng xuống, giữ câu hỏi ở trung tâm và cho phép trực giác dẫn lối trước khi bạn mở lá bài đầu tiên.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="relative h-28 w-28">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="url(#focus-ring)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
              <defs>
                <linearGradient id="focus-ring" x1="0%" x2="100%">
                  <stop offset="0%" stopColor="rgba(255,214,102,1)" />
                  <stop offset="100%" stopColor="rgba(126,97,255,1)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <p className="text-3xl font-semibold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                  {countdown}
                </p>
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">giây</p>
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={onComplete} className="border-gold/30 text-gold hover:bg-secondary">
            Bỏ qua
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

