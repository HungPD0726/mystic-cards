import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TarotCard as TarotCardType, Orientation } from '@/data/types';

interface TarotCardProps {
  card: TarotCardType;
  revealed: boolean;
  orientation?: Orientation;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TarotCard({ card, revealed, orientation = 'upright', onClick, className, size = 'md' }: TarotCardProps) {
  const sizeClasses = {
    sm: 'w-20 h-32',
    md: 'w-28 h-44 sm:w-32 sm:h-52',
    lg: 'w-40 h-64 sm:w-48 sm:h-72',
  };

  return (
    <div
      className={cn('perspective-1000 cursor-pointer', sizeClasses[size], className)}
      onClick={onClick}
    >
      <motion.div
        className="relative h-full w-full preserve-3d"
        initial={false}
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Card Back */}
        <div className="absolute inset-0 backface-hidden rounded-xl border-2 border-gold card-back-pattern flex items-center justify-center glow-gold">
          <div className="text-3xl opacity-60">✦</div>
        </div>

        {/* Card Face */}
        <div className={cn(
          'absolute inset-0 backface-hidden rotate-y-180 rounded-xl border-2 border-gold overflow-hidden flex flex-col items-center justify-center bg-card',
          orientation === 'reversed' && 'rotate-180'
        )}>
          <div className="relative h-full w-full flex flex-col items-center justify-center p-2">
            <img
              src={card.imagePath}
              alt={card.name}
              className="h-3/4 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <p className="mt-1 text-center text-xs font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
              {card.name}
            </p>
            {orientation === 'reversed' && (
              <span className="absolute top-1 right-1 rounded bg-destructive/80 px-1 text-[10px] text-destructive-foreground">
                Ngược
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
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
        'w-20 h-32 sm:w-24 sm:h-36 rounded-xl border-2 border-gold card-back-pattern flex items-center justify-center',
        className
      )}
      animate={animate ? {
        x: [0, Math.random() * 10 - 5, 0],
        y: [0, Math.random() * 8 - 4, 0],
        rotate: [0, Math.random() * 6 - 3, 0],
      } : {}}
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
