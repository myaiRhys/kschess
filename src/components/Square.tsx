import type { Piece as PieceData, Position } from '../types/chess';
import Piece from './Piece';

interface SquareProps {
  row: number;
  col: number;
  piece: PieceData | null;
  isSelected: boolean;
  isValidMove: boolean;
  isCheck: boolean;
  onClick: (pos: Position) => void;
}

export default function Square({
  row, col, piece, isSelected, isValidMove, isCheck, onClick,
}: SquareProps) {
  const isLight = (row + col) % 2 === 0;

  let bgClass = isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]';
  if (isSelected) bgClass = 'bg-blue-500/70';
  if (isCheck) bgClass = 'bg-red-500/70';

  return (
    <button
      className={`relative aspect-square flex items-center justify-center ${bgClass} transition-colors duration-150`}
      onClick={() => onClick([row, col])}
      aria-label={`Square ${String.fromCharCode(97 + col)}${8 - row}`}
    >
      {piece && <Piece piece={piece} />}
      {isValidMove && !piece && (
        <div className="absolute w-[28%] h-[28%] rounded-full bg-green-600/40" />
      )}
      {isValidMove && piece && (
        <div className="absolute inset-[6%] rounded-full border-[3px] border-green-500/60" />
      )}
    </button>
  );
}
