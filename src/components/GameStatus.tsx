import type { GameStatusType, PieceColor } from '../types/chess';

interface GameStatusProps {
  status: GameStatusType;
  turn: PieceColor;
}

export default function GameStatus({ status, turn }: GameStatusProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className={`w-3 h-3 rounded-full ${turn === 'white' ? 'bg-white' : 'bg-gray-800 border border-gray-600'}`} />
      <span className="text-sm text-slate-300 font-medium">
        {status === 'check' ? (
          <span className="text-red-400 font-bold animate-pulse">Check! </span>
        ) : null}
        {turn === 'white' ? 'White' : 'Black'}&apos;s turn
      </span>
    </div>
  );
}
