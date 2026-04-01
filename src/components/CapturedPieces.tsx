import type { Piece, PieceColor } from '../types/chess';
import { getPieceUnicode } from '../lib/chess';

interface CapturedPiecesProps {
  pieces: Piece[];
  color: PieceColor;
}

const PIECE_ORDER: Record<string, number> = {
  queen: 0, rook: 1, bishop: 2, knight: 3, pawn: 4,
};

export default function CapturedPieces({ pieces, color }: CapturedPiecesProps) {
  const sorted = [...pieces].sort((a, b) => PIECE_ORDER[a.type] - PIECE_ORDER[b.type]);

  return (
    <div className="flex items-center gap-0.5 min-h-[28px] px-2">
      <span className="text-xs text-slate-500 mr-1">
        {color === 'white' ? 'White' : 'Black'} captured:
      </span>
      {sorted.map((piece, i) => (
        <span
          key={i}
          className={`text-lg leading-none ${piece.color === 'white' ? 'text-white/80' : 'text-gray-800'}`}
          style={{
            filter: piece.color === 'white'
              ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))'
              : 'drop-shadow(0 1px 1px rgba(255,255,255,0.1))',
          }}
        >
          {getPieceUnicode(piece)}
        </span>
      ))}
    </div>
  );
}
