'use client';

import type { GameMode, Difficulty, GameAction } from '../types/chess';

interface ModeSelectProps {
  mode: GameMode;
  difficulty: Difficulty;
  dispatch: React.Dispatch<GameAction>;
}

export default function ModeSelect({ mode, difficulty, dispatch }: ModeSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Mode toggle */}
      <div className="flex rounded-lg overflow-hidden border border-slate-600">
        <button
          onClick={() => dispatch({ type: 'NEW_GAME', mode: 'local', difficulty })}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            mode === 'local'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          2 Player
        </button>
        <button
          onClick={() => dispatch({ type: 'NEW_GAME', mode: 'cpu', difficulty })}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            mode === 'cpu'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          vs CPU
        </button>
      </div>

      {/* Difficulty selector — only visible in CPU mode */}
      {mode === 'cpu' && (
        <div className="flex rounded-lg overflow-hidden border border-slate-600">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => dispatch({ type: 'NEW_GAME', mode: 'cpu', difficulty: d })}
              className={`flex-1 px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                difficulty === d
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
