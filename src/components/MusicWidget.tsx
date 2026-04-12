import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Music4, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useAudioManager } from '@/hooks/useAudioManager';

export function MusicWidget() {
  const [panelOpen, setPanelOpen] = useState(false);
  const clickTimerRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { isPlaying, isMuted, volume, toggle, toggleMute, setVolume } = useAudioManager();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };

    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      if (clickTimerRef.current !== null) {
        window.clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const handlePrimaryClick = () => {
    if (clickTimerRef.current !== null) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      setPanelOpen((current) => !current);
      return;
    }

    clickTimerRef.current = window.setTimeout(() => {
      toggle();
      clickTimerRef.current = null;
    }, 220);
  };

  return (
    <div ref={rootRef} className="fixed bottom-4 left-4 z-[9999] flex items-end gap-3">
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="mb-3 w-72 rounded-[26px] border border-purple-400/25 bg-[rgba(14,0,36,0.92)] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <p className="text-[11px] uppercase tracking-[0.26em] text-gold/80">Mystic Soundscape</p>
            <div className="mt-3 rounded-2xl border border-gold/10 bg-white/[0.03] p-3">
              <p className="text-sm font-semibold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                Mystic Mystical
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Ambient loop cho phiên rút bài và các hiệu ứng tương tác.</p>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMute}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold transition hover:bg-gold/15"
                aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <div className="flex-1">
                <Slider
                  value={[Math.round(volume * 100)]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(values) => setVolume((values[0] ?? 45) / 100)}
                />
              </div>

              <span className="w-10 text-right text-xs font-semibold text-gold">{Math.round(volume * 100)}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={handlePrimaryClick}
          onContextMenu={(event) => {
            event.preventDefault();
            setPanelOpen((current) => !current);
          }}
          className={cn(
            'relative flex h-16 w-16 items-center justify-center rounded-full border border-gold/25 bg-[rgba(14,0,36,0.92)] text-gold shadow-[0_18px_44px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-gold/45',
            isPlaying && !isMuted && 'shadow-[0_0_0_10px_rgba(255,214,102,0.05),0_18px_44px_rgba(0,0,0,0.35)]',
          )}
          aria-label={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
        >
          {isPlaying && !isMuted && (
            <span className="absolute inset-0 rounded-full border border-gold/30 animate-[music-pulse_2.2s_ease-out_infinite]" />
          )}
          <span className="absolute inset-[7px] rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,214,102,0.15),rgba(42,17,73,0.92))]" />
          <Music4 className="relative z-10 h-6 w-6" />
        </button>

        <div className={cn('mt-2 flex items-end gap-1', isPlaying && !isMuted ? 'opacity-100' : 'opacity-45')}>
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className="w-1 rounded-full bg-gradient-to-t from-amber-500 via-yellow-300 to-white"
              style={{
                height: `${12 + index * 3}px`,
                animation: isPlaying && !isMuted ? `music-bar ${0.75 + index * 0.08}s ease-in-out infinite` : 'none',
                animationDelay: `${index * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

