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

export type SpreadType = 'one-card' | 'three-card' | 'yes-no';

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
}

export interface ReadingHistory {
  id: string;
  date: string;
  spreadType: SpreadType;
  spreadName: string;
  drawnCards: {
    cardId: number;
    cardName: string;
    orientation: Orientation;
    position: string;
  }[];
}
