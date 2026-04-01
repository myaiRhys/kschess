export type PieceColor = 'white' | 'black';
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type Position = [number, number]; // [row, col]

export type Board = (Piece | null)[][];

export type GameStatusType = 'playing' | 'check' | 'checkmate' | 'stalemate';

export interface CastlingRights {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export interface CapturedPieces {
  white: Piece[];
  black: Piece[];
}

export interface PromotionPending {
  from: Position;
  to: Position;
}

export interface GameState {
  board: Board;
  turn: PieceColor;
  selected: Position | null;
  validMoves: Position[];
  status: GameStatusType;
  winner: PieceColor | null;
  moves: string[];
  capturedPieces: CapturedPieces;
  enPassantTarget: Position | null;
  castlingRights: CastlingRights;
  boardFlipped: boolean;
  promotionPending: PromotionPending | null;
}

export type GameAction =
  | { type: 'SELECT_SQUARE'; position: Position }
  | { type: 'PROMOTE'; pieceType: PieceType }
  | { type: 'NEW_GAME' };
