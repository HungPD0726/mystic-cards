import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SpreadLayout } from '@/components/SpreadLayout';
import { MeaningDialog } from '@/components/MeaningDialog';
import { CardBack } from '@/components/TarotCard';
import { useTarotReading } from '@/hooks/useTarotReading';
import { SpreadType, DrawnCard } from '@/data/types';
import { Shuffle, Layers, RotateCcw, ArrowRight, Sparkles, Eye, Stars } from 'lucide-react';

const ReadingDraw = () => {
  const { spread: spreadId } = useParams<{ spread: string }>();
  const navigate = useNavigate();
  const reading = useTarotReading(spreadId as SpreadType);
  const [selectedCard, setSelectedCard] = useState<DrawnCard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!reading.spread) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Kiểu trải bài không hợp lệ.</p>
      </div>
    );
  }

  const totalCards = reading.spread.cardCount;
  const progress = Math.round((reading.drawIndex / totalCards) * 100);
  const stageText = !reading.isShuffled
    ? reading.isShuffling
      ? 'Đang xáo bài'
      : 'Sẵn sàng bắt đầu'
    : reading.allRevealed
      ? 'Hoàn tất trải bài'
      : `Đã rút ${reading.drawIndex}/${totalCards} lá`;

  const handleCardClick = (index: number) => {
    setSelectedCard(reading.drawnCards[index]);
    setDialogOpen(true);
  };

  const storeReadingData = () => {
    sessionStorage.setItem(
      'tarot-current-reading',
      JSON.stringify({
        spreadType: spreadId,
        spreadName: reading.spread?.name,
        drawnCards: reading.drawnCards.map((dc) => ({
          cardId: dc.card.id,
          cardName: dc.card.name,
          cardSlug: dc.card.slug,
          orientation: dc.orientation,
          position: dc.position,
          imagePath: dc.card.imagePath,
          keywords: dc.card.keywords,
          uprightMeaning: dc.card.uprightMeaning,
          reversedMeaning: dc.card.reversedMeaning,
          description: dc.card.description,
        })),
      }),
    );
  };

  const handleViewResult = () => {
    storeReadingData();
    sessionStorage.removeItem('tarot-auto-ai');
    navigate(`/reading/${spreadId}/result`);
  };

  const handleAIInterpret = () => {
    storeReadingData();
    sessionStorage.setItem('tarot-auto-ai', 'true');
    navigate(`/reading/${spreadId}/result`);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.14),transparent_70%)]" />

      <div className="container relative mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 max-w-6xl rounded-3xl border border-border/60 bg-card/45 p-5 backdrop-blur md:p-7"
        >
          <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/40 px-4 py-1.5">
                <Stars className="h-4 w-4 text-gold" />
                <span className="text-xs uppercase tracking-[0.2em] text-gold/90">Tarot Session</span>
              </div>
              <h1 className="text-3xl font-bold text-gold sm:text-4xl" style={{ fontFamily: 'Cinzel, serif' }}>
                {reading.spread.icon} {reading.spread.name}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">{reading.spread.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Trạng thái</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{stageText}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tiến độ</p>
                <p className="mt-1 text-sm font-semibold text-gold">
                  {reading.drawIndex}/{totalCards} lá
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Mẹo nhanh</p>
                <p className="mt-1 text-sm font-semibold text-foreground">Giữ một câu hỏi cụ thể trước khi rút.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="mx-auto max-w-6xl rounded-3xl border border-border/60 bg-card/40 p-4 md:p-6"
        >
          <AnimatePresence mode="wait">
            {!reading.isShuffled ? (
              <motion.div
                key="deck"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="py-2"
              >
                <p className="text-center text-sm text-muted-foreground">
                  Xáo bộ bài để bắt đầu. Sau đó bạn sẽ rút từng lá theo đúng vị trí của trải bài.
                </p>

                <div className="mt-6 flex justify-center overflow-x-auto pb-2 md:overflow-visible md:pb-0">
                  <div className="flex min-w-max items-end justify-center gap-1 px-3 sm:gap-2 md:min-w-0 md:gap-3 md:px-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className="origin-bottom"
                        style={{ transform: `rotate(${(i - 3) * 7}deg) translateY(${Math.abs(i - 3) * 3}px)` }}
                      >
                        <CardBack animate={reading.isShuffling} delay={i * 0.04} className="h-36 w-24 sm:h-44 sm:w-28" />
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
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Tiến trình mở bài</p>
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
                  spreadType={spreadId as SpreadType}
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
                {reading.isShuffling ? 'Đang xáo bài...' : 'Xáo bài'}
              </Button>
            )}

            {reading.isShuffled && !reading.allDrawn && (
              <Button onClick={reading.drawNext} className="gap-2 glow-gold" size="lg">
                <Layers className="h-4 w-4" />
                Rút lá ({reading.drawIndex}/{reading.spread.cardCount})
              </Button>
            )}

            {reading.allRevealed && (
              <>
                <Button onClick={handleAIInterpret} className="gap-2 glow-gold" size="lg">
                  <Sparkles className="h-4 w-4" />
                  🤖 AI Luận Giải
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
              <Button onClick={reading.reset} variant="outline" className="gap-2 border-gold/30 text-gold hover:bg-secondary">
                <RotateCcw className="h-4 w-4" />
                Bắt đầu lại
              </Button>
            )}
          </div>

          {reading.allRevealed && (
            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4 text-gold" />
              <p>Nhấn vào từng lá bài để xem ý nghĩa chi tiết trước khi qua màn kết quả.</p>
            </div>
          )}
        </motion.div>
      </div>

      <MeaningDialog drawnCard={selectedCard} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default ReadingDraw;
