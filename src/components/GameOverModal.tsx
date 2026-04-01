'use client';

import type { GameStatusType, PieceColor, GameAction } from '../types/chess';

interface GameOverModalProps {
  status: GameStatusType;
  winner: PieceColor | null;
  dispatch: React.Dispatch<GameAction>;
}

export default function GameOverModal({ status, winner, dispatch }: GameOverModalProps) {
  if (status !== 'checkmate' && status !== 'stalemate') return null;

  const title = status === 'checkmate' ? 'Checkmate!' : 'Stalemate!';
  const subtitle = status === 'checkmate'
    ? `${winner === 'white' ? 'White' : 'Black'} wins!`
    : 'The game is a draw.';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-600 p-8 shadow-2xl text-center max-w-sm mx-4">
        <div className="text-5xl mb-4">
          {status === 'checkmate' ? (winner === 'white' ? '♔' : '♚') : '½'}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-300 mb-6">{subtitle}</p>
        <button
          onClick={() => dispatch({ type: 'NEW_GAME' })}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors active:scale-95"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
