import type { Piece as PieceType } from '../types/chess';
import { getPieceUnicode } from '../lib/chess';

interface PieceProps {
  piece: PieceType;
}

export default function Piece({ piece }: PieceProps) {
  return (
    <span
      className={`text-4xl sm:text-5xl select-none leading-none drop-shadow-md ${
        piece.color === 'white' ? 'text-white' : 'text-gray-900'
      }`}
      style={{ filter: piece.color === 'white' ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' : 'drop-shadow(0 1px 2px rgba(255,255,255,0.15))' }}
    >
      {getPieceUnicode(piece)}
    </span>
  );
}
