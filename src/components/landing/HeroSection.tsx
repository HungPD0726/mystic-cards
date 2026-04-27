import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackgroundParticles from '@/components/BackgroundParticles';
import { FloatingCards } from '@/components/FloatingCards';
import { spreads } from '@/data/spreads';
import { zodiacSigns } from '@/data/zodiac';

interface HeroSectionProps {
  warpMode: boolean;
  onStartReading: (path: string) => void;
  userZodiac: ReturnType<typeof zodiacSigns.find> | null | undefined;
}

export const HeroSection = ({ warpMode, onStartReading, userZodiac }: HeroSectionProps) => {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/40">
      <BackgroundParticles warp={warpMode} />
      <FloatingCards />
      <div className="mystic-grid absolute inset-0 opacity-30" />

      {/* Layered aurora */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 18% 22%, hsl(285 65% 30% / 0.55), transparent 48%), radial-gradient(ellipse at 82% 12%, hsl(220 70% 32% / 0.45), transparent 42%), radial-gradient(circle at 50% 105%, hsl(35 90% 48% / 0.28), transparent 48%)',
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gold/8 blur-3xl"
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container relative z-10 mx-auto px-4 pb-16 pt-12 md:pt-16 lg:pb-24">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/40 px-4 py-1.5 backdrop-blur"
          >
            <Sparkles className="h-4 w-4 text-gold animate-pulse" />
            <span className="text-xs tracking-[0.22em] uppercase text-gold/90">
              Astral Arcana • Tarot &amp; Zodiac
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="text-4xl font-bold leading-[1.05] md:text-6xl lg:text-7xl"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Giải Mã Trải Bài
            </span>
            <br />
            <span className="text-foreground">Khai Mở Trực Giác</span>
          </motion.h1>

          {/* Decorative divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-3"
          >
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/60 to-gold/30" />
            <span className="text-gold/80 text-sm">✦</span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/60 to-gold/30" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-2xl"
          >
            78 lá bài không nói trước tương lai, nhưng soi sáng lựa chọn hiện tại. Hãy bắt đầu với câu hỏi bạn đang
            thật sự băn khoăn.
          </motion.p>

          <AnimatePresence>
            {userZodiac && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-gold/20 bg-gold/5 px-6 py-3 backdrop-blur-sm shadow-lg shadow-gold/5"
              >
                <div className="text-3xl">{userZodiac.symbol}</div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-widest text-gold">
                    Tử vi hằng ngày • {userZodiac.name}
                  </p>
                  <p className="max-w-xs truncate text-sm italic text-foreground/90">
                    "{userZodiac.advice}"
                  </p>
                </div>
                <Button variant="ghost" size="icon" asChild className="text-gold hover:bg-gold/10">
                  <Link to="/zodiac">
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              className="min-w-[220px] gap-2 px-8 py-6 text-base glow-gold"
              onClick={() => onStartReading('/reading')}
            >
              <Sparkles className="h-5 w-5" />
              Bắt đầu xem bài
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Link to="/cards">
              <Button
                variant="outline"
                size="lg"
                className="min-w-[220px] gap-2 border-gold/40 px-8 py-6 text-base text-gold hover:bg-secondary"
              >
                <BookOpen className="h-4 w-4" />
                Thư viện lá bài
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.45 }}
          className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-3"
        >
          {[
            { label: 'Trải bài phổ biến', value: 'Quá khứ - Hiện tại - Tương lai' },
            { label: 'Mục tiêu', value: 'Rõ câu hỏi, rõ hướng đi' },
            { label: 'Kèm AI diễn giải', value: 'Nhanh, sâu sắc, dễ hiểu' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-left backdrop-blur transition-colors hover:border-gold/40"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.4 }}
          className="relative mx-auto mt-10 w-full max-w-4xl"
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-blue-300/15 blur-3xl" />
          <div className="relative rounded-3xl border border-gold/25 bg-card/70 p-5 shadow-[0_24px_80px_hsl(var(--mystic-purple)/0.22)] backdrop-blur-md sm:p-6">
            <p className="text-center text-xs uppercase tracking-[0.2em] text-gold/90">Phiên xem bài gợi ý</p>
            <h2
              className="mt-2 text-center text-2xl font-semibold leading-tight text-foreground md:text-3xl"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Trải Ba Lá: Quá khứ, hiện tại, tương lai
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">
              Một bố cục dễ bắt đầu để bạn nhìn tổng thể tình huống và nhận ra hướng đi phù hợp nhất lúc này.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {['Quá khứ', 'Hiện tại', 'Tương lai'].map((slot, idx) => (
                <Button
                  key={slot}
                  variant="outline"
                  className="h-auto w-full justify-between rounded-xl border-gold/25 bg-background/45 px-4 py-3 text-left hover:border-gold/45 hover:bg-secondary/40"
                  onClick={() => onStartReading('/reading/three-card')}
                >
                  <span className="inline-flex w-full items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span className="text-base text-gold">{spreads[1].icon}</span>
                      {slot}
                    </span>
                    <span className="text-xs text-muted-foreground">Lá {idx + 1}</span>
                  </span>
                </Button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-border/60 bg-background/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Câu hỏi mẫu</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                "Mình cần tập trung điều gì trong 30 ngày tới để cải thiện công việc và sự cân bằng cá nhân?"
              </p>
            </div>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => onStartReading('/reading/three-card')}
                className="inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-amber-300"
              >
                Chọn trải bài này <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
