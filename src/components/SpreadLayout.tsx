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
  const layoutClass =
    spreadType === 'three-card'
      ? 'mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5'
      : 'mx-auto flex w-full max-w-sm items-center justify-center';

  return (
    <div className={cn(layoutClass)}>
      {drawnCards.map((dc, i) => (
        <motion.div
          key={i}
          className={cn(
            'group rounded-2xl border bg-card/45 p-3 transition-all duration-300 sm:p-4',
            dc.revealed
              ? 'border-gold/45 shadow-[0_14px_34px_hsl(var(--gold)/0.12)]'
              : 'border-border/65 hover:border-gold/30',
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15 }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
              {dc.position}
            </span>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                dc.revealed
                  ? 'border-gold/35 bg-gold/10 text-gold'
                  : 'border-border bg-background/60 text-muted-foreground',
              )}
            >
              {dc.revealed ? 'Đã mở' : `Lá ${i + 1}`}
            </span>
          </div>

          <div className="flex justify-center">
            <TarotCard
              card={dc.card}
              revealed={dc.revealed}
              orientation={dc.orientation}
              onClick={() => dc.revealed && onCardClick?.(i)}
              size={size}
            />
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            {dc.revealed ? 'Nhấn vào lá bài để xem nghĩa chi tiết.' : 'Rút lá để mở thông điệp tại vị trí này.'}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
