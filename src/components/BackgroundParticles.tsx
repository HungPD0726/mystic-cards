import React, { useMemo } from 'react';

interface Star {
  id: number;
  top: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
}

interface ShootingStar {
  id: number;
  top: string;
  left: string;
  delay: string;
}

const BackgroundParticles: React.FC = () => {
  const stars = useMemo<Star[]>(() => {
    return [...Array(50)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 5}s`,
    }));
  }, []);

  const shootingStars = useMemo<ShootingStar[]>(() => {
    return [...Array(3)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 40}%`,
      left: `${Math.random() * 40 + 60}%`,
      delay: `${Math.random() * 10 + 2}s`,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 transform-gpu">
      {/* Deep Atmospheric Glow */}
      <div
        className="absolute top-[-20%] left-[-20%] w-[70vw] h-[70vw] rounded-full blur-[80px] mix-blend-screen animate-pulse-slow will-change-[opacity]"
        style={{ background: 'hsl(var(--mystic-purple) / 0.15)' }}
      />

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full will-change-[transform,opacity]"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            background: 'hsl(var(--gold) / 0.6)',
            animation: `twinkle ${star.duration} ease-in-out infinite alternate`,
            animationDelay: star.delay,
          }}
        />
      ))}

      {/* Shooting Stars */}
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="absolute h-[2px] rounded-full animate-shooting-star will-change-transform opacity-0"
          style={{
            top: star.top,
            left: star.left,
            width: '100px',
            background: 'linear-gradient(to left, transparent, hsl(var(--gold) / 0.8), transparent)',
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
};

export default React.memo(BackgroundParticles);
