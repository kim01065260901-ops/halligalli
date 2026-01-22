
import React, { useEffect, useState } from 'react';
import { Card } from '../types';
import { FRUIT_ICONS, FRUIT_COLORS } from '../constants';

interface CardDisplayProps {
  card: Card | null;
  label: string;
  count: number;
  side: 'left' | 'right';
}

const CardDisplay: React.FC<CardDisplayProps> = ({ card, label, count, side }) => {
  const [prevCount, setPrevCount] = useState(count);
  const [isPopping, setIsPopping] = useState(false);

  useEffect(() => {
    if (count !== prevCount) {
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 300);
      setPrevCount(count);
      return () => clearTimeout(timer);
    }
  }, [count, prevCount]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Deck Visual */}
      <div className="flex flex-col items-center gap-2">
        <div className={`relative w-20 h-28 bg-white border-2 border-gray-300 rounded-xl shadow-md flex items-center justify-center card-stack`}>
            <span className={`text-xl font-black transition-all ${isPopping ? 'animate-pop text-red-500 scale-125' : 'text-gray-700'}`}>
              {count}
            </span>
        </div>
        <div className="text-gray-500 text-sm font-bold mt-2">{label}의 덱</div>
      </div>

      {/* Active Card Area with Flying Animation */}
      <div className="h-48 w-32 flex items-center justify-center relative">
        {card ? (
          <div 
            key={card.id} // Key re-triggers animation on new card
            className={`w-32 h-48 rounded-xl border-4 flex flex-col items-center justify-center shadow-xl transition-all duration-300 ${FRUIT_COLORS[card.type]} ${side === 'left' ? 'animate-fly-left' : 'animate-fly-right'}`}
          >
            <div className="grid grid-cols-2 gap-2 p-2">
              {Array.from({ length: card.count }).map((_, i) => (
                <span key={i} className="text-4xl drop-shadow-sm">{FRUIT_ICONS[card.type]}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-32 h-48 rounded-xl border-4 border-dashed border-gray-200 flex items-center justify-center bg-gray-50/50">
             <span className="text-gray-300 text-xs text-center px-2">카드가 여기에 놓입니다</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardDisplay;
