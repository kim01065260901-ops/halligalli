
export type FruitType = 'STRAWBERRY' | 'BANANA' | 'LIME' | 'PLUM';

export interface Card {
  id: string;
  type: FruitType;
  count: number;
}

export type GameStatus = 'START' | 'PLAYING' | 'LEVEL_CLEAR' | 'GAME_OVER' | 'VICTORY';

export interface GameState {
  level: number;
  score: number;
  highScore: number;
  playerDeckCount: number;
  aiDeckCount: number;
  playerActiveCard: Card | null;
  aiActiveCard: Card | null;
  status: GameStatus;
  message: string;
}

export interface LevelConfig {
  aiSpeed: number; // ms between flips
  maxCards: number; // total cards in game
  reward: number; // score per win
}
