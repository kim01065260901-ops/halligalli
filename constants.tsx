
import React from 'react';
import { FruitType, LevelConfig } from './types';

export const FRUITS: FruitType[] = ['STRAWBERRY', 'BANANA', 'LIME', 'PLUM'];

export const FRUIT_ICONS: Record<FruitType, string> = {
  STRAWBERRY: '🍓',
  BANANA: '🍌',
  LIME: '🍏',
  PLUM: '🍇',
};

export const FRUIT_COLORS: Record<FruitType, string> = {
  STRAWBERRY: 'bg-red-100 border-red-500 text-red-600',
  BANANA: 'bg-yellow-100 border-yellow-500 text-yellow-600',
  LIME: 'bg-green-100 border-green-500 text-green-600',
  PLUM: 'bg-purple-100 border-purple-500 text-purple-600',
};

// 50 levels with a smoother difficulty curve
export const LEVELS: LevelConfig[] = Array.from({ length: 50 }, (_, i) => ({
  aiSpeed: Math.max(450, 3000 - i * 50), // Reaches floor near level 50
  maxCards: 56,
  reward: 100 + i * 20,
}));

export const getTargetsForLevel = (level: number): number[] => {
  const extraCount = Math.floor((level - 1) / 10);
  const baseTargets = [5];
  // Successive targets to add: 6, 4, 7, 3, 8, 2...
  const additionalPool = [6, 4, 7, 3, 8]; 
  const targets = [...baseTargets];
  for (let i = 0; i < extraCount; i++) {
    if (additionalPool[i]) {
      targets.push(additionalPool[i]);
    }
  }
  return targets.sort((a, b) => a - b);
};

export const INITIAL_HIGH_SCORE_KEY = 'HALLI_GALLI_HIGH_SCORE';
