import { motion } from 'framer-motion';
import { TarotCard } from '@/components/TarotCard';
import { DrawnCard, SpreadType } from '@/data/types';
import { cn } from '@/lib/utils';

interface SpreadLayoutProps {
  spreadType: SpreadType;
  drawnCards: DrawnCard[];
  onCardClick?: (index: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function SpreadLayout({ spreadType, drawnCards, onCardClick, size = 'md' }: SpreadLayoutProps) {
  const layoutClass = spreadType === 'three-card'
    ? 'flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8'
    : 'flex items-center justify-center';

  return (
    <div className={cn(layoutClass)}>
      {drawnCards.map((dc, i) => (
        <motion.div
          key={i}
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15 }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {dc.position}
          </span>
          <TarotCard
            card={dc.card}
            revealed={dc.revealed}
            orientation={dc.orientation}
            onClick={() => dc.revealed && onCardClick?.(i)}
            size={size}
          />
        </motion.div>
      ))}
    </div>
  );
}
