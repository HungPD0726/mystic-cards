import { useEffect, useRef } from 'react';
import VanillaTilt, { type HTMLVanillaTiltElement, type TiltOptions } from 'vanilla-tilt';

type TiltElement = HTMLVanillaTiltElement;

export function useTilt(options: TiltOptions = {}, enabled = true) {
  const ref = useRef<TiltElement | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) {
      return;
    }

    VanillaTilt.init(element, {
      max: 15,
      speed: 400,
      glare: true,
      'max-glare': 0.28,
      scale: 1.02,
      perspective: 1200,
      ...optionsRef.current,
    });

    return () => {
      element.vanillaTilt?.destroy();
    };
  }, [enabled, optionsKey]);

  return ref;
}
