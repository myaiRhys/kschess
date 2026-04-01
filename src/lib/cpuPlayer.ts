import type {
  Board,
  PieceColor,
  PieceType,
  Position,
  CastlingRights,
  Difficulty,
} from '../types/chess';
import {
  getLegalMoves,
  executeMove,
  isInCheck,
  opponent,
} from './chess';

// ─── Piece Values ─────────────────────────────────────────────

const PIECE_VALUE: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

// ─── Piece-Square Tables (from white's perspective) ───────────

const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0,
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
  0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
];

const KING_MIDDLEGAME_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20,
];

const PST: Record<PieceType, number[]> = {
  pawn: PAWN_TABLE,
  knight: KNIGHT_TABLE,
  bishop: BISHOP_TABLE,
  rook: ROOK_TABLE,
  queen: QUEEN_TABLE,
  king: KING_MIDDLEGAME_TABLE,
};

function getPstValue(type: PieceType, color: PieceColor, row: number, col: number): number {
  // Tables are from white's perspective; mirror for black
  const r = color === 'white' ? row : 7 - row;
  return PST[type][r * 8 + col];
}

// ─── Board Evaluation ─────────────────────────────────────────

function evaluateBoard(board: Board, color: PieceColor): number {
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const value = PIECE_VALUE[piece.type] + getPstValue(piece.type, piece.color, r, c);
      score += piece.color === color ? value : -value;
    }
  }

  return score;
}

// ─── Move Ordering (improves alpha-beta pruning) ──────────────

interface ScoredMove {
  from: Position;
  to: Position;
  score: number;
}

function orderMoves(
  board: Board,
  moves: { from: Position; to: Position }[],
): { from: Position; to: Position }[] {
  const scored: ScoredMove[] = moves.map(({ from, to }) => {
    let score = 0;
    const target = board[to[0]][to[1]];
    const attacker = board[from[0]][from[1]];
    // MVV-LVA: capture high-value pieces with low-value ones first
    if (target && attacker) {
      score = PIECE_VALUE[target.type] * 10 - PIECE_VALUE[attacker.type];
    }
    // Promote pawns
    if (attacker?.type === 'pawn' && (to[0] === 0 || to[0] === 7)) {
      score += 800;
    }
    return { from, to, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

// ─── Minimax with Alpha-Beta Pruning ──────────────────────────

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiColor: PieceColor,
  enPassantTarget: Position | null,
  castlingRights: CastlingRights,
): number {
  if (depth === 0) {
    return evaluateBoard(board, aiColor);
  }

  const currentColor = isMaximizing ? aiColor : opponent(aiColor);
  const allMoves: { from: Position; to: Position }[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== currentColor) continue;
      const moves = getLegalMoves(board, [r, c], enPassantTarget, castlingRights);
      for (const to of moves) {
        allMoves.push({ from: [r, c], to });
      }
    }
  }

  // No legal moves: checkmate or stalemate
  if (allMoves.length === 0) {
    if (isInCheck(board, currentColor)) {
      // Checkmate — worse the deeper it is (prefer quicker mates)
      return isMaximizing ? -100000 + (10 - depth) : 100000 - (10 - depth);
    }
    return 0; // stalemate
  }

  const ordered = orderMoves(board, allMoves);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const { from, to } of ordered) {
      const piece = board[from[0]][from[1]]!;
      const promoRow = piece.color === 'white' ? 0 : 7;
      const isPromo = piece.type === 'pawn' && to[0] === promoRow;

      const result = executeMove(board, from, to, enPassantTarget, castlingRights, isPromo ? 'queen' : undefined);
      const evalScore = minimax(result.board, depth - 1, alpha, beta, false, aiColor, result.enPassantTarget, result.castlingRights);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const { from, to } of ordered) {
      const piece = board[from[0]][from[1]]!;
      const promoRow = piece.color === 'white' ? 0 : 7;
      const isPromo = piece.type === 'pawn' && to[0] === promoRow;

      const result = executeMove(board, from, to, enPassantTarget, castlingRights, isPromo ? 'queen' : undefined);
      const evalScore = minimax(result.board, depth - 1, alpha, beta, true, aiColor, result.enPassantTarget, result.castlingRights);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// ─── Difficulty Settings ──────────────────────────────────────

function getDepth(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 1;
    case 'medium': return 2;
    case 'hard': return 3;
  }
}

// ─── Public API ───────────────────────────────────────────────

export interface CpuMove {
  from: Position;
  to: Position;
  promotion?: PieceType;
}

export function findBestMove(
  board: Board,
  color: PieceColor,
  enPassantTarget: Position | null,
  castlingRights: CastlingRights,
  difficulty: Difficulty,
): CpuMove | null {
  const depth = getDepth(difficulty);

  const allMoves: { from: Position; to: Position }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== color) continue;
      const moves = getLegalMoves(board, [r, c], enPassantTarget, castlingRights);
      for (const to of moves) {
        allMoves.push({ from: [r, c], to });
      }
    }
  }

  if (allMoves.length === 0) return null;

  // For easy mode, add some randomness
  if (difficulty === 'easy' && Math.random() < 0.3) {
    const idx = Math.floor(Math.random() * allMoves.length);
    const move = allMoves[idx];
    const piece = board[move.from[0]][move.from[1]]!;
    const promoRow = piece.color === 'white' ? 0 : 7;
    const isPromo = piece.type === 'pawn' && move.to[0] === promoRow;
    return { ...move, promotion: isPromo ? 'queen' : undefined };
  }

  const ordered = orderMoves(board, allMoves);
  let bestScore = -Infinity;
  let bestMove = ordered[0];

  for (const move of ordered) {
    const piece = board[move.from[0]][move.from[1]]!;
    const promoRow = piece.color === 'white' ? 0 : 7;
    const isPromo = piece.type === 'pawn' && move.to[0] === promoRow;

    const result = executeMove(board, move.from, move.to, enPassantTarget, castlingRights, isPromo ? 'queen' : undefined);
    const score = minimax(result.board, depth - 1, -Infinity, Infinity, false, color, result.enPassantTarget, result.castlingRights);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  const selectedPiece = board[bestMove.from[0]][bestMove.from[1]]!;
  const promoRow = selectedPiece.color === 'white' ? 0 : 7;
  const isPromo = selectedPiece.type === 'pawn' && bestMove.to[0] === promoRow;

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: isPromo ? 'queen' : undefined,
  };
}
