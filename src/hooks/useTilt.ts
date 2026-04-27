import { useEffect, useRef } from 'react';
import VanillaTilt, { type HTMLVanillaTiltElement, type TiltOptions } from 'vanilla-tilt';

export function useTilt<T extends HTMLElement = HTMLElement>(options: TiltOptions = {}, enabled = true) {
  const ref = useRef<T | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    const element = ref.current as (T & Partial<HTMLVanillaTiltElement>) | null;
    if (!element || !enabled) {
      return;
    }

    VanillaTilt.init(element as unknown as HTMLVanillaTiltElement, {
      max: 15,
      speed: 400,
      glare: true,
      'max-glare': 0.28,
      scale: 1.02,
      perspective: 1200,
      ...optionsRef.current,
    });

    return () => {
      (element as Partial<HTMLVanillaTiltElement>).vanillaTilt?.destroy();
    };
  }, [enabled, optionsKey]);

  return ref;
}
