import { useState, useCallback, useEffect, useRef } from 'react';
import { allCards } from '@/data/cards';
import { getSpread } from '@/data/spreads';
import { DrawnCard, ReadingHistory, SpreadType, Orientation } from '@/data/types';

function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomOrientation(): Orientation {
  return Math.random() < 0.5 ? 'upright' : 'reversed';
}

export function useTarotReading(spreadType: SpreadType) {
  const spread = getSpread(spreadType);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [drawIndex, setDrawIndex] = useState(0);
  const shuffleTimerRef = useRef<number | null>(null);

  const cardCount = spread?.cardCount ?? 1;
  const allDrawn = drawIndex >= cardCount;
  const allRevealed = drawnCards.length === cardCount && drawnCards.every((card) => card.revealed);

  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current !== null) {
        window.clearTimeout(shuffleTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (shuffleTimerRef.current !== null) {
      window.clearTimeout(shuffleTimerRef.current);
      shuffleTimerRef.current = null;
    }

    setDrawnCards([]);
    setIsShuffling(false);
    setIsShuffled(false);
    setDrawIndex(0);
  }, [spreadType]);

  const shuffle = useCallback(() => {
    if (shuffleTimerRef.current !== null) {
      window.clearTimeout(shuffleTimerRef.current);
    }

    setIsShuffling(true);
    setDrawnCards([]);
    setDrawIndex(0);

    shuffleTimerRef.current = window.setTimeout(() => {
      const shuffled = fisherYatesShuffle(allCards);
      shuffleTimerRef.current = null;
      setIsShuffling(false);
      setIsShuffled(true);

      // Pre-select cards
      if (spread) {
        const selected = shuffled.slice(0, cardCount).map((card, i) => ({
          card,
          orientation: randomOrientation(),
          position: spread.positions[i]?.label ?? '',
          revealed: false,
        }));
        setDrawnCards(selected);
      }
    }, 1200);
  }, [spread, cardCount]);

  const drawNext = useCallback(() => {
    setDrawIndex((currentIndex) => {
      if (currentIndex >= cardCount) return currentIndex;
      setDrawnCards((prev) =>
        prev.map((dc, i) => (i === currentIndex ? { ...dc, revealed: true } : dc))
      );
      return currentIndex + 1;
    });
  }, [cardCount]);

  const reset = useCallback(() => {
    if (shuffleTimerRef.current !== null) {
      window.clearTimeout(shuffleTimerRef.current);
      shuffleTimerRef.current = null;
    }
    setDrawnCards([]);
    setIsShuffled(false);
    setIsShuffling(false);
    setDrawIndex(0);
  }, []);

  return {
    spread,
    drawnCards,
    isShuffling,
    isShuffled,
    allDrawn,
    allRevealed,
    drawIndex,
    shuffle,
    drawNext,
    reset,
  };
}

const HISTORY_KEY = 'tarot-reading-history';

export function saveReadingHistory(reading: ReadingHistory) {
  const history = getReadingHistory();
  history.unshift(reading);
  if (history.length > 50) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getReadingHistory(): ReadingHistory[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
