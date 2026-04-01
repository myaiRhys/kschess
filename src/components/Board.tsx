'use client';

import type { GameState, GameAction, Position } from '../types/chess';
import Square from './Square';

interface BoardProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export default function Board({ state, dispatch }: BoardProps) {
  const { board, selected, validMoves, turn, status, boardFlipped } = state;

  const handleClick = (pos: Position) => {
    dispatch({ type: 'SELECT_SQUARE', position: pos });
  };

  // Find king position for check highlight
  let checkKingPos: Position | null = null;
  if (status === 'check' || status === 'checkmate') {
    const checkColor = status === 'checkmate'
      ? turn // The current turn's king is in checkmate
      : turn; // The current turn's king is in check
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'king' && p.color === checkColor) {
          checkKingPos = [r, c];
        }
      }
    }
  }

  // Build row/col indices — flipped when black's turn
  const rowIndices = boardFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colIndices = boardFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const fileLabels = boardFlipped ? ['h','g','f','e','d','c','b','a'] : ['a','b','c','d','e','f','g','h'];
  const rankLabels = boardFlipped ? ['1','2','3','4','5','6','7','8'] : ['8','7','6','5','4','3','2','1'];

  return (
    <div
      className="transition-transform duration-500 ease-in-out"
    >
      <div className="relative">
        {/* File labels (top) */}
        <div className="flex ml-6 sm:ml-8 mr-0">
          {fileLabels.map((f) => (
            <div key={`ft-${f}`} className="flex-1 text-center text-xs text-slate-400 pb-1">{f}</div>
          ))}
        </div>

        <div className="flex">
          {/* Rank labels (left) */}
          <div className="flex flex-col w-6 sm:w-8">
            {rankLabels.map((rl) => (
              <div key={`rl-${rl}`} className="flex-1 flex items-center justify-center text-xs text-slate-400">{rl}</div>
            ))}
          </div>

          {/* Board grid */}
          <div className="grid grid-cols-8 border-2 border-[#7a5a3a] rounded-sm overflow-hidden shadow-2xl flex-1 aspect-square">
            {rowIndices.map((r) =>
              colIndices.map((c) => {
                const piece = board[r][c];
                const isSelected = selected !== null && selected[0] === r && selected[1] === c;
                const isValidMove = validMoves.some(([mr, mc]) => mr === r && mc === c);
                const isCheckSquare = checkKingPos !== null && checkKingPos[0] === r && checkKingPos[1] === c;

                return (
                  <Square
                    key={`${r}-${c}`}
                    row={r}
                    col={c}
                    piece={piece}
                    isSelected={isSelected}
                    isValidMove={isValidMove}
                    isCheck={isCheckSquare}
                    onClick={handleClick}
                  />
                );
              }),
            )}
          </div>
        </div>

        {/* File labels (bottom) */}
        <div className="flex ml-6 sm:ml-8 mr-0">
          {fileLabels.map((f) => (
            <div key={`fb-${f}`} className="flex-1 text-center text-xs text-slate-400 pt-1">{f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
