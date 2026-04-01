import type { GameStatusType, PieceColor, GameMode } from '../types/chess';

interface GameStatusProps {
  status: GameStatusType;
  turn: PieceColor;
  cpuThinking?: boolean;
  mode?: GameMode;
}

export default function GameStatus({ status, turn, cpuThinking, mode }: GameStatusProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className={`w-3 h-3 rounded-full ${turn === 'white' ? 'bg-white' : 'bg-gray-800 border border-gray-600'}`} />
      <span className="text-sm text-slate-300 font-medium">
        {status === 'check' ? (
          <span className="text-red-400 font-bold animate-pulse">Check! </span>
        ) : null}
        {cpuThinking ? (
          <span className="text-amber-400 animate-pulse">CPU thinking...</span>
        ) : (
          <>
            {mode === 'cpu' && turn === 'black' ? 'CPU' : turn === 'white' ? 'White' : 'Black'}&apos;s turn
          </>
        )}
      </span>
    </div>
  );
}
