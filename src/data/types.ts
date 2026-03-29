export type CardGroup = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';

export interface TarotCard {
  id: number;
  name: string;
  slug: string;
  imagePath: string;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  description: string;
  group: CardGroup;
}

export type Orientation = 'upright' | 'reversed';

export interface DrawnCard {
  card: TarotCard;
  orientation: Orientation;
  position: string;
  revealed: boolean;
}

export type SpreadType =
  | 'one-card'
  | 'three-card'
  | 'yes-no'
  | 'love'
  | 'career'
  | 'daily'
  | 'celtic-cross'
  | 'horseshoe';

export type SpreadCategory = 'quick-guidance' | 'classic' | 'theme' | 'deep-dive';

export interface SpreadPosition {
  id: string;
  label: string;
  description: string;
}

export interface SpreadConfig {
  id: SpreadType;
  name: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
  icon: string;
  category: SpreadCategory;
  duration: string;
  intensity: 'Nhẹ' | 'Vừa' | 'Sâu';
  idealFor: string;
  bestFor: string[];
}

export interface ReadingHistory {
  id: string;
  date: string;
  spreadType: SpreadType;
  spreadName: string;
  aiInterpretation?: string | null;
  notes?: string | null;
  drawnCards: {
    cardId: number;
    cardName: string;
    cardSlug?: string;
    orientation: Orientation;
    position: string;
  }[];
}
