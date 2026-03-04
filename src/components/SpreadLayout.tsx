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

const layoutClassBySpread: Record<SpreadType, string> = {
  'one-card': 'mx-auto flex w-full max-w-sm items-center justify-center',
  'three-card': 'mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5',
  'yes-no': 'mx-auto flex w-full max-w-sm items-center justify-center',
  love: 'mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5',
  career: 'mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4',
  daily: 'mx-auto flex w-full max-w-sm items-center justify-center',
  'celtic-cross': 'mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5',
  horseshoe: 'mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4',
};

export function SpreadLayout({ spreadType, drawnCards, onCardClick, size = 'md' }: SpreadLayoutProps) {
  return (
    <div className={layoutClassBySpread[spreadType]}>
      {drawnCards.map((drawnCard, index) => (
        <motion.div
          key={`${drawnCard.position}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className={cn(
            'group rounded-[26px] border bg-card/50 p-3 transition-all duration-300 sm:p-4',
            drawnCard.revealed
              ? 'border-gold/45 shadow-[0_16px_40px_hsl(var(--gold)/0.12)]'
              : 'border-border/65 hover:border-gold/30',
          )}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-gold/75">Vị trí {index + 1}</p>
              <p className="mt-1 text-sm font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                {drawnCard.position}
              </p>
            </div>
            <span
              className={cn(
                'rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
                drawnCard.revealed
                  ? 'border-gold/35 bg-gold/10 text-gold'
                  : 'border-border bg-background/60 text-muted-foreground',
              )}
            >
              {drawnCard.revealed ? 'Đã mở' : 'Chờ mở'}
            </span>
          </div>

          <div className="flex justify-center">
            <TarotCard
              card={drawnCard.card}
              revealed={drawnCard.revealed}
              orientation={drawnCard.orientation}
              onClick={() => drawnCard.revealed && onCardClick?.(index)}
              size={size}
            />
          </div>

          <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
            {drawnCard.revealed
              ? 'Nhấn vào lá bài để xem ý nghĩa chi tiết trước khi chuyển sang phần luận giải.'
              : 'Tiếp tục rút bài để mở thông điệp tại vị trí này.'}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
