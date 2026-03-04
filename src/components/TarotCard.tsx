import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Orientation, TarotCard as TarotCardType } from '@/data/types';

interface TarotCardProps {
  card: TarotCardType;
  revealed: boolean;
  orientation?: Orientation;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-32 w-20',
  md: 'h-44 w-28 sm:h-52 sm:w-32',
  lg: 'h-64 w-40 sm:h-72 sm:w-48',
};

export function TarotCard({
  card,
  revealed,
  orientation = 'upright',
  onClick,
  className,
  size = 'md',
}: TarotCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!revealed}
      className={cn(
        'perspective-1000 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:cursor-default',
        revealed ? 'cursor-pointer' : 'cursor-default',
        sizeClasses[size],
        className,
      )}
    >
      <motion.div
        className="relative h-full w-full preserve-3d"
        initial={false}
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <div className="card-back-pattern absolute inset-0 flex items-center justify-center rounded-xl border-2 border-gold glow-gold backface-hidden">
          <div className="text-3xl opacity-60">✦</div>
        </div>

        <div
          className={cn(
            'absolute inset-0 flex rotate-y-180 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-gold bg-card backface-hidden',
            orientation === 'reversed' && 'rotate-180',
          )}
        >
          <div className="relative flex h-full w-full flex-col items-center justify-center p-2">
            <img
              src={card.imagePath}
              alt={card.name}
              className="h-3/4 w-auto object-contain"
              onError={(event) => {
                (event.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <p className="mt-1 text-center text-xs font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
              {card.name}
            </p>
            {orientation === 'reversed' && (
              <span className="absolute right-1 top-1 rounded bg-destructive/80 px-1 text-[10px] text-destructive-foreground">
                Ngược
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </button>
  );
}

interface CardBackProps {
  className?: string;
  animate?: boolean;
  delay?: number;
}

export function CardBack({ className, animate = false, delay = 0 }: CardBackProps) {
  return (
    <motion.div
      className={cn(
        'card-back-pattern flex h-32 w-20 items-center justify-center rounded-xl border-2 border-gold sm:h-36 sm:w-24',
        className,
      )}
      animate={
        animate
          ? {
              x: [0, Math.random() * 10 - 5, 0],
              y: [0, Math.random() * 8 - 4, 0],
              rotate: [0, Math.random() * 6 - 3, 0],
            }
          : {}
      }
      transition={{
        duration: 0.4,
        delay,
        ease: 'easeInOut',
      }}
    >
      <div className="text-xl opacity-40">✦</div>
    </motion.div>
  );
}
