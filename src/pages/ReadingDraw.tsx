import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  Layers,
  RotateCcw,
  Shuffle,
  Sparkles,
  Stars,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MeaningDialog } from '@/components/MeaningDialog';
import { SpreadLayout } from '@/components/SpreadLayout';
import { CardBack } from '@/components/TarotCard';
import { DrawnCard, SpreadType } from '@/data/types';
import { useTarotReading } from '@/hooks/useTarotReading';
import { createStoredReading, saveCurrentReading, setAutoAI } from '@/lib/readingSession';

const ReadingDraw = () => {
  const { spread: spreadId } = useParams<{ spread: string }>();
  const navigate = useNavigate();
  const reading = useTarotReading(spreadId as SpreadType);
  const [selectedCard, setSelectedCard] = useState<DrawnCard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!reading.spread) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-foreground">Không tìm thấy kiểu trải bài này.</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Hãy quay lại trang chọn trải bài và bắt đầu với một layout hợp lệ.
        </p>
        <Button onClick={() => navigate('/reading')}>Quay lại /reading</Button>
      </div>
    );
  }

  const totalCards = reading.spread.cardCount;
  const progress = Math.round((reading.drawIndex / totalCards) * 100);
  const nextPosition = reading.spread.positions[reading.drawIndex];
  const stageText = !reading.isShuffled
    ? reading.isShuffling
      ? 'Đang xáo bộ bài'
      : 'Sẵn sàng bắt đầu'
    : reading.allRevealed
      ? 'Đã hoàn tất trải bài'
      : `Đang mở vị trí ${reading.drawIndex + 1}/${totalCards}`;

  const handleCardClick = (index: number) => {
    setSelectedCard(reading.drawnCards[index]);
    setDialogOpen(true);
  };

  const persistCurrentReading = () => {
    const storedReading = createStoredReading(reading.spread.id, reading.spread.name, reading.drawnCards);
    saveCurrentReading(storedReading);
  };

  const handleViewResult = () => {
    persistCurrentReading();
    setAutoAI(false);
    navigate(`/reading/${reading.spread.id}/result`);
  };

  const handleAIInterpret = () => {
    persistCurrentReading();
    setAutoAI(true);
    navigate(`/reading/${reading.spread.id}/result`);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.14),transparent_40%),radial-gradient(circle_at_85%_20%,hsl(var(--primary)/0.18),transparent_30%),radial-gradient(circle_at_10%_90%,hsl(var(--accent)/0.16),transparent_28%)]" />

      <div className="container relative mx-auto px-4 py-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 max-w-6xl overflow-hidden rounded-[30px] border border-border/60 bg-card/45 p-5 backdrop-blur md:p-7"
        >
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-background/40 px-4 py-1.5">
                <Stars className="h-4 w-4 text-gold" />
                <span className="text-xs uppercase tracking-[0.22em] text-gold/90">Reading Session</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl" style={{ fontFamily: 'Cinzel, serif' }}>
                <span className="mr-2">{reading.spread.icon}</span>
                {reading.spread.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {reading.spread.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Trạng thái</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{stageText}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tiến độ</p>
                <p className="mt-2 text-sm font-semibold text-gold">
                  {reading.drawIndex}/{totalCards} lá
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Gợi ý</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  Giữ một câu hỏi cụ thể trong đầu trước mỗi lần rút.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="rounded-[30px] border border-border/60 bg-card/40 p-4 md:p-6"
          >
            <AnimatePresence mode="wait">
              {!reading.isShuffled ? (
                <motion.div
                  key="deck"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="py-4"
                >
                  <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
                    Xáo bộ bài để bắt đầu. Sau đó bạn sẽ mở từng lá theo đúng vị trí của spread, giúp mạch luận giải
                    rõ ràng và không bị nhảy ý.
                  </p>

                  <div className="mt-8 flex justify-center overflow-x-auto pb-2 md:overflow-visible md:pb-0">
                    <div className="flex min-w-max items-end justify-center gap-1 px-3 sm:gap-2 md:min-w-0 md:gap-3 md:px-1">
                      {Array.from({ length: 7 }).map((_, index) => (
                        <div
                          key={index}
                          className="origin-bottom"
                          style={{ transform: `rotate(${(index - 3) * 7}deg) translateY(${Math.abs(index - 3) * 3}px)` }}
                        >
                          <CardBack animate={reading.isShuffling} delay={index * 0.04} className="h-36 w-24 sm:h-44 sm:w-28" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="spread"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="mb-6 rounded-2xl border border-border/60 bg-background/40 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Tiến trình mở bài</p>
                        <p className="text-xs text-muted-foreground">
                          {nextPosition
                            ? `Tiếp theo: ${nextPosition.label}`
                            : 'Bạn đã mở đủ tất cả vị trí của trải bài.'}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gold">{progress}%</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary/70">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  <SpreadLayout
                    spreadType={reading.spread.id}
                    drawnCards={reading.drawnCards}
                    onCardClick={handleCardClick}
                    size="lg"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!reading.isShuffled && (
                <Button onClick={reading.shuffle} disabled={reading.isShuffling} className="gap-2 glow-gold" size="lg">
                  <Shuffle className="h-4 w-4" />
                  {reading.isShuffling ? 'Đang xáo bài...' : 'Xáo bộ bài'}
                </Button>
              )}

              {reading.isShuffled && !reading.allDrawn && (
                <Button onClick={reading.drawNext} className="gap-2 glow-gold" size="lg">
                  <Layers className="h-4 w-4" />
                  {nextPosition ? `Mở: ${nextPosition.label}` : `Rút lá ${reading.drawIndex + 1}`}
                </Button>
              )}

              {reading.allRevealed && (
                <>
                  <Button onClick={handleAIInterpret} className="gap-2 glow-gold" size="lg">
                    <Sparkles className="h-4 w-4" />
                    Tạo luận giải AI
                  </Button>
                  <Button
                    onClick={handleViewResult}
                    variant="outline"
                    className="gap-2 border-gold/30 text-gold hover:bg-secondary"
                    size="lg"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Xem kết quả
                  </Button>
                </>
              )}

              {reading.isShuffled && (
                <Button
                  onClick={reading.reset}
                  variant="outline"
                  className="gap-2 border-gold/30 text-gold hover:bg-secondary"
                >
                  <RotateCcw className="h-4 w-4" />
                  Bắt đầu lại
                </Button>
              )}
            </div>

            {reading.allRevealed && (
              <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4 text-gold" />
                <p>Nhấn vào từng lá bài để xem nghĩa chi tiết trước khi chuyển sang màn kết quả.</p>
              </div>
            )}
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="h-fit rounded-[30px] border border-border/60 bg-card/40 p-5 backdrop-blur lg:sticky lg:top-24"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl border border-gold/30 bg-gold/10 p-2 text-gold">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                  Hướng dẫn phiên đọc
                </h2>
                <p className="text-sm text-muted-foreground">Theo dõi từng vị trí để không bị rối mạch.</p>
              </div>
            </div>

            <div className="space-y-3">
              {reading.spread.positions.map((position, index) => {
                const isRevealed = index < reading.drawIndex;
                const isCurrent = index === reading.drawIndex && reading.isShuffled && !reading.allRevealed;

                return (
                  <div
                    key={position.id}
                    className={`rounded-2xl border p-4 transition-colors ${
                      isCurrent
                        ? 'border-gold/35 bg-gold/10'
                        : isRevealed
                          ? 'border-border/60 bg-background/50'
                          : 'border-border/50 bg-background/35'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          isCurrent
                            ? 'bg-gold text-background'
                            : isRevealed
                              ? 'bg-secondary text-foreground'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{position.label}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{position.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.aside>
        </div>
      </div>

      <MeaningDialog drawnCard={selectedCard} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default ReadingDraw;
