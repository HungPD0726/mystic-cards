import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
  id: number;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface ShootingStar {
  id: number;
  top: number;
  left: number;
  delay: number;
}

interface BackgroundParticlesProps {
  warp?: boolean;
  className?: string;
}

const STAR_COUNT = 92;
const DUST_COUNT = 30;

const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({ warp = false, className }) => {
  const stars = useMemo<Particle[]>(
    () =>
      Array.from({ length: STAR_COUNT }, (_, index) => ({
        id: index,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2.3 + 0.8,
        duration: Math.random() * 3.2 + 2.4,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.55 + 0.2,
      })),
    [],
  );

  const dust = useMemo<Particle[]>(
    () =>
      Array.from({ length: DUST_COUNT }, (_, index) => ({
        id: index,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 1.2 + 0.35,
        duration: Math.random() * 5 + 4,
        delay: Math.random() * 6,
        opacity: Math.random() * 0.22 + 0.08,
      })),
    [],
  );

  const shootingStars = useMemo<ShootingStar[]>(
    () =>
      Array.from({ length: 4 }, (_, index) => ({
        id: index,
        top: Math.random() * 42,
        left: Math.random() * 38 + 56,
        delay: Math.random() * 8 + 1.5,
      })),
    [],
  );

  return (
    <div className={cn('pointer-events-none absolute inset-0 z-0 overflow-hidden select-none', className)}>
      <div
        className="absolute -left-[18%] -top-[22%] h-[72vw] w-[72vw] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, hsl(var(--mystic-purple) / 0.18), transparent 62%)' }}
      />
      <div
        className="absolute right-[-14%] top-[8%] h-[38vw] w-[38vw] rounded-full blur-[90px] animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, hsl(220 85% 62% / 0.12), transparent 68%)' }}
      />
      <div
        className="absolute bottom-[-16%] left-[18%] h-[34vw] w-[34vw] rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(circle, hsl(var(--gold) / 0.08), transparent 66%)' }}
      />

      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full will-change-[transform,opacity]"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: warp ? Math.min(1, star.opacity + 0.2) : star.opacity,
            background: 'hsl(var(--gold) / 0.9)',
            boxShadow: `0 0 ${warp ? 14 : 6}px hsl(var(--star-glow) / 0.65)`,
            transform: warp
              ? `translate(calc(50vw - ${star.left}vw), calc(50vh - ${star.top}vh)) scale(${1.9 + star.size / 2.4})`
              : 'translate3d(0, 0, 0)',
            transition: `transform 680ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease, box-shadow 400ms ease`,
            animation: warp ? 'none' : `twinkle ${star.duration}s ease-in-out infinite alternate`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {dust.map((particle) => (
        <span
          key={`dust-${particle.id}`}
          className="absolute rounded-full"
          style={{
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: warp ? 0 : particle.opacity,
            background: 'rgba(255, 244, 220, 0.8)',
            animation: `dust-drift ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            transition: 'opacity 260ms ease',
          }}
        />
      ))}

      {!warp &&
        shootingStars.map((star) => (
          <span
            key={star.id}
            className="absolute h-[2px] rounded-full animate-shooting-star opacity-0"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: '108px',
              background: 'linear-gradient(to left, transparent, hsl(var(--gold) / 0.88), transparent)',
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
    </div>
  );
};

export default React.memo(BackgroundParticles);

