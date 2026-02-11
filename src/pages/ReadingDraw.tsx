import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SpreadLayout } from '@/components/SpreadLayout';
import { MeaningDialog } from '@/components/MeaningDialog';
import { CardBack } from '@/components/TarotCard';
import { useTarotReading } from '@/hooks/useTarotReading';
import { SpreadType, DrawnCard } from '@/data/types';
import { Shuffle, Layers, RotateCcw, ArrowRight } from 'lucide-react';

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

  const handleCardClick = (index: number) => {
    setSelectedCard(reading.drawnCards[index]);
    setDialogOpen(true);
  };

  const handleViewResult = () => {
    // Store drawn cards in sessionStorage for result page
    sessionStorage.setItem('tarot-current-reading', JSON.stringify({
      spreadType: spreadId,
      spreadName: reading.spread?.name,
      drawnCards: reading.drawnCards.map(dc => ({
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
    }));
    navigate(`/reading/${spreadId}/result`);
  };

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl font-bold text-gold sm:text-3xl" style={{ fontFamily: 'Cinzel, serif' }}>
          {reading.spread.icon} {reading.spread.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{reading.spread.description}</p>
      </motion.div>

      {/* Shuffle deck visual */}
      {!reading.isShuffled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-10 flex flex-wrap justify-center gap-2"
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <CardBack
              key={i}
              animate={reading.isShuffling}
              delay={i * 0.05}
            />
          ))}
        </motion.div>
      )}

      {/* Drawn cards layout */}
      <AnimatePresence>
        {reading.isShuffled && reading.drawnCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10"
          >
            <SpreadLayout
              spreadType={spreadId as SpreadType}
              drawnCards={reading.drawnCards}
              onCardClick={handleCardClick}
              size="lg"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {!reading.isShuffled && (
          <Button
            onClick={reading.shuffle}
            disabled={reading.isShuffling}
            className="gap-2 glow-gold"
            size="lg"
          >
            <Shuffle className="h-4 w-4" />
            {reading.isShuffling ? 'Đang xáo bài...' : 'Xáo bài'}
          </Button>
        )}

        {reading.isShuffled && !reading.allDrawn && (
          <Button
            onClick={reading.drawNext}
            className="gap-2 glow-gold"
            size="lg"
          >
            <Layers className="h-4 w-4" />
            Rút lá ({reading.drawIndex}/{reading.spread.cardCount})
          </Button>
        )}

        {reading.allRevealed && (
          <Button
            onClick={handleViewResult}
            className="gap-2 glow-gold"
            size="lg"
          >
            <ArrowRight className="h-4 w-4" />
            Xem kết quả
          </Button>
        )}

        {reading.isShuffled && (
          <Button onClick={reading.reset} variant="outline" className="gap-2 border-gold/30 text-gold hover:bg-secondary">
            <RotateCcw className="h-4 w-4" />
            Bắt đầu lại
          </Button>
        )}
      </div>

      {/* Hint */}
      {reading.allRevealed && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          💡 Click vào lá bài để xem ý nghĩa chi tiết
        </p>
      )}

      <MeaningDialog
        drawnCard={selectedCard}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default ReadingDraw;
