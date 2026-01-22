
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameState, GameStatus, Card, FruitType } from './types';
import { LEVELS, FRUITS, FRUIT_ICONS, INITIAL_HIGH_SCORE_KEY, getTargetsForLevel } from './constants';
import { getLevelDescription } from './services/geminiService';
import CardDisplay from './components/CardDisplay';
import { Button, Modal } from './components/GameUI';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    level: 1,
    score: 0,
    highScore: Number(localStorage.getItem(INITIAL_HIGH_SCORE_KEY)) || 0,
    playerDeckCount: 28,
    aiDeckCount: 28,
    playerActiveCard: null,
    aiActiveCard: null,
    status: 'START',
    message: '준비되셨나요?',
  });

  const [levelTip, setLevelTip] = useState("");
  const [isBellRinging, setIsBellRinging] = useState(false);
  const aiIntervalRef = useRef<any>(null);

  // Memoize targets to prevent unnecessary re-renders of dependent hooks
  const targets = useMemo(() => getTargetsForLevel(state.level), [state.level]);

  // Load level tip from Gemini
  useEffect(() => {
    if (state.status === 'START' || state.status === 'LEVEL_CLEAR') {
      getLevelDescription(state.level).then(setLevelTip);
    }
  }, [state.level, state.status]);

  const generateCard = (): Card => {
    const type = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    const count = Math.floor(Math.random() * 5) + 1;
    return { id: Math.random().toString(36).substr(2, 9), type, count };
  };

  const startGame = () => {
    setState(prev => ({
      ...prev,
      playerDeckCount: 28,
      aiDeckCount: 28,
      playerActiveCard: null,
      aiActiveCard: null,
      status: 'PLAYING',
      message: '과일을 잘 보세요!',
    }));
  };

  // Improved check logic with feedback summary
  const getGameSummary = useCallback(() => {
    const counts: Record<FruitType, number> = {
      STRAWBERRY: 0,
      BANANA: 0,
      LIME: 0,
      PLUM: 0,
    };
    if (state.playerActiveCard) counts[state.playerActiveCard.type] += state.playerActiveCard.count;
    if (state.aiActiveCard) counts[state.aiActiveCard.type] += state.aiActiveCard.count;

    const activeCounts = Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => `${FRUIT_ICONS[type as FruitType]} ${count}개`);

    const summaryStr = activeCounts.length > 0 ? activeCounts.join(', ') : "바닥에 과일이 없습니다.";
    const isSuccess = Object.values(counts).some(count => targets.includes(count));

    return { isSuccess, summaryStr };
  }, [state.playerActiveCard, state.aiActiveCard, targets]);

  const handleFlip = useCallback(() => {
    if (state.status !== 'PLAYING') return;

    setState(prev => {
      const isPlayerTurn = (prev.playerDeckCount + prev.aiDeckCount) % 2 === 0;
      
      if (isPlayerTurn) {
        if (prev.playerDeckCount <= 0) return { ...prev, status: 'GAME_OVER', message: '플레이어의 카드가 다 떨어졌습니다!' };
        return {
          ...prev,
          playerActiveCard: generateCard(),
          playerDeckCount: prev.playerDeckCount - 1
        };
      } else {
        if (prev.aiDeckCount <= 0) return { ...prev, status: 'GAME_OVER', message: '컴퓨터의 카드가 다 떨어졌습니다!' };
        return {
          ...prev,
          aiActiveCard: generateCard(),
          aiDeckCount: prev.aiDeckCount - 1
        };
      }
    });
  }, [state.status]);

  // AI Logic
  useEffect(() => {
    if (state.status === 'PLAYING') {
      const config = LEVELS[state.level - 1];
      aiIntervalRef.current = setInterval(() => {
        handleFlip();
      }, config.aiSpeed);
    } else {
      if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    }
    return () => {
      if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    };
  }, [state.status, state.level, handleFlip]);

  const ringBell = () => {
    if (state.status !== 'PLAYING') return;
    
    setIsBellRinging(true);
    setTimeout(() => setIsBellRinging(false), 200);

    const { isSuccess, summaryStr } = getGameSummary();
    
    if (isSuccess) {
      const reward = LEVELS[state.level - 1].reward;
      const newScore = state.score + reward;
      
      if (newScore > state.highScore) {
        localStorage.setItem(INITIAL_HIGH_SCORE_KEY, newScore.toString());
      }

      if (state.level === 50) {
        setState(prev => ({ ...prev, status: 'VICTORY', score: newScore, highScore: Math.max(newScore, prev.highScore) }));
      } else {
        setState(prev => ({
          ...prev,
          status: 'LEVEL_CLEAR',
          score: newScore,
          highScore: Math.max(newScore, prev.highScore),
          message: `성공! 현재 바닥: ${summaryStr}`
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        status: 'GAME_OVER',
        message: `목표 숫자가 아닙니다! (현재 바닥: ${summaryStr}) 목표: ${targets.join(', ')}개`
      }));
    }
  };

  const nextLevel = () => {
    setState(prev => ({
      ...prev,
      level: prev.level + 1,
      status: 'PLAYING',
      playerDeckCount: 28,
      aiDeckCount: 28,
      playerActiveCard: null,
      aiActiveCard: null,
    }));
  };

  const restartGame = () => {
    setState({
      level: 1,
      score: 0,
      highScore: Number(localStorage.getItem(INITIAL_HIGH_SCORE_KEY)) || 0,
      playerDeckCount: 28,
      aiDeckCount: 28,
      playerActiveCard: null,
      aiActiveCard: null,
      status: 'START',
      message: '다시 도전해 보세요!',
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 bg-gradient-to-b from-green-50 to-emerald-100">
      {/* Header Info */}
      <div className="w-full max-w-2xl flex justify-between items-center bg-white/80 p-4 rounded-2xl shadow-sm backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">High Score</span>
          <span className="text-2xl font-black text-orange-500">🏆 {state.highScore}</span>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-green-700">LEVEL {state.level}</div>
          <div className="flex gap-2 justify-center mt-1">
            {targets.map(t => (
              <span key={t} className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm animate-pulse">
                Target: {t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">Score</span>
          <span className="text-2xl font-black text-blue-600">{state.score}</span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center gap-8 relative">
        <div className="flex w-full justify-around items-center">
          {/* AI Side */}
          <CardDisplay 
            card={state.aiActiveCard} 
            label="컴퓨터" 
            count={state.aiDeckCount}
            side="left"
          />

          {/* Bell Container */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer z-10" onClick={ringBell}>
              <div className={`w-36 h-36 bg-yellow-400 rounded-full border-8 border-yellow-600 shadow-[0_12px_0_0_rgba(180,83,9,1)] flex items-center justify-center transition-all active:translate-y-2 active:shadow-none ${isBellRinging ? 'bell-shake scale-110' : ''}`}>
                 <i className="fas fa-bell text-white text-6xl drop-shadow-md"></i>
              </div>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg text-sm font-black text-red-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                🔔 한 종류가 {targets.join(' 또는 ')}개일 때!
              </div>
            </div>
            <div className="text-xs text-gray-400 font-bold">중앙의 종을 클릭하세요</div>
          </div>

          {/* Player Side */}
          <CardDisplay 
            card={state.playerActiveCard} 
            label="플레이어" 
            count={state.playerDeckCount}
            side="right"
          />
        </div>

        {/* Tip / Message */}
        <div className="bg-white/60 p-4 rounded-2xl max-w-xl text-center shadow-inner border border-white/40">
          <p className="text-lg text-green-800 italic font-medium">"{levelTip || "과일을 주시하세요!"}"</p>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="w-full max-w-2xl flex justify-center pb-8">
        <Button 
          onClick={handleFlip} 
          className="bg-emerald-500 hover:bg-emerald-600 px-16 py-5 text-2xl group border-b-4 border-emerald-700"
          disabled={state.status !== 'PLAYING'}
        >
          카드 뒤집기 <i className="fas fa-hand-pointer ml-3 group-active:translate-y-1 transition-transform"></i>
        </Button>
      </div>

      {/* Game Modals */}
      {state.status === 'START' && (
        <Modal 
          title="할리갈리 챔피언십" 
          description="바닥에 깔린 카드 중 '한 종류의 과일'의 합이 목표 숫자가 되는 순간 종을 치세요! 10단계마다 목표 숫자가 추가됩니다." 
          confirmText="도전 시작!" 
          onConfirm={startGame}
          icon="🍓"
        />
      )}

      {state.status === 'LEVEL_CLEAR' && (
        <Modal 
          title="Level Clear!" 
          description={`${state.message}\n잘하셨습니다! 다음 단계로 갑니다.`}
          confirmText="다음 레벨" 
          onConfirm={nextLevel}
          icon="⭐"
        />
      )}

      {state.status === 'GAME_OVER' && (
        <Modal 
          title="앗, 아쉬워요!" 
          description={state.message} 
          confirmText="다시 도전" 
          onConfirm={restartGame}
          icon="😵"
        />
      )}

      {state.status === 'VICTORY' && (
        <Modal 
          title="전설의 챔피언!" 
          description={`50단계를 모두 정복하셨습니다! 당신은 진정한 할리갈리의 신입니다. 최종 점수: ${state.score}`} 
          confirmText="처음부터 다시" 
          onConfirm={restartGame}
          icon="👑"
        />
      )}
    </div>
  );
};

export default App;
