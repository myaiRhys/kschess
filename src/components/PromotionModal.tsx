'use client';

import type { PieceType, PieceColor, GameAction } from '../types/chess';
import { getPieceUnicode } from '../lib/chess';

interface PromotionModalProps {
  color: PieceColor;
  dispatch: React.Dispatch<GameAction>;
}

const PROMOTION_CHOICES: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

export default function PromotionModal({ color, dispatch }: PromotionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-600 p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white text-center mb-4">Promote Pawn</h2>
        <div className="flex gap-3">
          {PROMOTION_CHOICES.map((type) => (
            <button
              key={type}
              onClick={() => dispatch({ type: 'PROMOTE', pieceType: type })}
              className="w-16 h-16 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-500 hover:border-slate-400 transition-all hover:scale-110 active:scale-95"
              aria-label={`Promote to ${type}`}
            >
              <span className={`text-4xl ${color === 'white' ? 'text-white' : 'text-gray-900'}`}
                style={{ filter: color === 'white' ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' : 'drop-shadow(0 1px 2px rgba(255,255,255,0.15))' }}
              >
                {getPieceUnicode({ type, color })}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 text-center mt-3">Choose a piece for promotion</p>
      </div>
    </div>
  );
}
