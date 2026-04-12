import { useMemo } from 'react';
import { allCards } from '@/data/cards';

const positions = [
  { top: '8%', left: '6%', duration: '11s', delay: '0s', rotate: '-8deg', width: '96px' },
  { top: '18%', left: '24%', duration: '13s', delay: '1.3s', rotate: '5deg', width: '88px' },
  { top: '10%', right: '10%', duration: '15s', delay: '0.6s', rotate: '-4deg', width: '104px' },
  { top: '45%', left: '8%', duration: '12s', delay: '2.1s', rotate: '9deg', width: '92px' },
  { top: '55%', right: '16%', duration: '14s', delay: '1.5s', rotate: '-10deg', width: '100px' },
  { bottom: '9%', left: '20%', duration: '16s', delay: '0.8s', rotate: '6deg', width: '90px' },
  { bottom: '12%', right: '6%', duration: '12.5s', delay: '2.6s', rotate: '-6deg', width: '86px' },
];

export function FloatingCards() {
  const cards = useMemo(() => {
    return [...allCards].sort(() => Math.random() - 0.5).slice(0, positions.length);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {cards.map((card, index) => {
        const position = positions[index];
        const { duration, delay, rotate, width, ...placement } = position;

        return (
          <div
            key={card.slug}
            className="absolute hidden lg:block"
            style={{
              ...placement,
              animation: `floating-card ${duration} ease-in-out infinite`,
              animationDelay: delay,
            }}
          >
            <div
              className="rounded-[20px] border border-gold/15 bg-card/25 p-2 shadow-[0_24px_50px_rgba(0,0,0,0.24)] backdrop-blur-sm"
              style={{ transform: `rotate(${rotate}) perspective(1000px) rotateX(7deg) rotateY(-4deg)` }}
            >
              <img
                src={card.imagePath}
                alt={card.name}
                className="h-auto rounded-[14px] object-cover opacity-20 saturate-[0.85]"
                style={{ width }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
