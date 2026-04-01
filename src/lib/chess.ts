import type {
  Piece,
  PieceColor,
  PieceType,
  Position,
  Board,
  CastlingRights,
} from '../types/chess';

// ─── Board Setup ──────────────────────────────────────────────

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));

  const backRank: PieceType[] = [
    'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook',
  ];

  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRank[col], color: 'black' };
    board[1][col] = { type: 'pawn', color: 'black' };
    board[6][col] = { type: 'pawn', color: 'white' };
    board[7][col] = { type: backRank[col], color: 'white' };
  }

  return board;
}

// ─── Helpers ──────────────────────────────────────────────────

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

function findKing(board: Board, color: PieceColor): Position {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'king' && p.color === color) {
        return [r, c];
      }
    }
  }
  // Should never happen in a valid game
  return [-1, -1];
}

export function opponent(color: PieceColor): PieceColor {
  return color === 'white' ? 'black' : 'white';
}

// ─── Attack Detection ─────────────────────────────────────────

/**
 * Returns true if any piece of `attackerColor` attacks `[tr, tc]`.
 */
export function isSquareAttacked(
  board: Board,
  tr: number,
  tc: number,
  attackerColor: PieceColor,
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== attackerColor) continue;
      if (canPieceAttack(board, piece, r, c, tr, tc)) return true;
    }
  }
  return false;
}

/**
 * Checks if a specific piece at [sr,sc] attacks [tr,tc] (pseudo-legal).
 * Does NOT include castling – castling is not an "attack".
 */
function canPieceAttack(
  board: Board,
  piece: Piece,
  sr: number,
  sc: number,
  tr: number,
  tc: number,
): boolean {
  const dr = tr - sr;
  const dc = tc - sc;

  switch (piece.type) {
    case 'pawn': {
      const dir = piece.color === 'white' ? -1 : 1;
      return dr === dir && Math.abs(dc) === 1;
    }
    case 'knight':
      return (
        (Math.abs(dr) === 2 && Math.abs(dc) === 1) ||
        (Math.abs(dr) === 1 && Math.abs(dc) === 2)
      );
    case 'bishop':
      return isDiagonalClear(board, sr, sc, tr, tc);
    case 'rook':
      return isStraightClear(board, sr, sc, tr, tc);
    case 'queen':
      return isDiagonalClear(board, sr, sc, tr, tc) || isStraightClear(board, sr, sc, tr, tc);
    case 'king':
      return Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0);
  }
}

function isDiagonalClear(board: Board, sr: number, sc: number, tr: number, tc: number): boolean {
  const dr = tr - sr;
  const dc = tc - sc;
  if (Math.abs(dr) !== Math.abs(dc) || dr === 0) return false;
  const stepR = dr > 0 ? 1 : -1;
  const stepC = dc > 0 ? 1 : -1;
  let r = sr + stepR;
  let c = sc + stepC;
  while (r !== tr || c !== tc) {
    if (board[r][c]) return false;
    r += stepR;
    c += stepC;
  }
  return true;
}

function isStraightClear(board: Board, sr: number, sc: number, tr: number, tc: number): boolean {
  const dr = tr - sr;
  const dc = tc - sc;
  if (dr !== 0 && dc !== 0) return false;
  if (dr === 0 && dc === 0) return false;
  const stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
  const stepC = dc === 0 ? 0 : dc > 0 ? 1 : -1;
  let r = sr + stepR;
  let c = sc + stepC;
  while (r !== tr || c !== tc) {
    if (board[r][c]) return false;
    r += stepR;
    c += stepC;
  }
  return true;
}

// ─── Check / Checkmate / Stalemate ───────────────────────────

export function isInCheck(board: Board, color: PieceColor): boolean {
  const [kr, kc] = findKing(board, color);
  return isSquareAttacked(board, kr, kc, opponent(color));
}

export function isCheckmate(
  board: Board,
  color: PieceColor,
  enPassantTarget: Position | null,
  castlingRights: CastlingRights,
): boolean {
  if (!isInCheck(board, color)) return false;
  return !hasAnyLegalMove(board, color, enPassantTarget, castlingRights);
}

export function isStalemate(
  board: Board,
  color: PieceColor,
  enPassantTarget: Position | null,
  castlingRights: CastlingRights,
): boolean {
  if (isInCheck(board, color)) return false;
  return !hasAnyLegalMove(board, color, enPassantTarget, castlingRights);
}

function hasAnyLegalMove(
  board: Board,
  color: PieceColor,
  enPassantTarget: Position | null,
  castlingRights: CastlingRights,
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== color) continue;
      const moves = getLegalMoves(board, [r, c], enPassantTarget, castlingRights);
      if (moves.length > 0) return true;
    }
  }
  return false;
}

// ─── Pseudo-Legal Move Generation ─────────────────────────────

function getPseudoLegalMoves(
  board: Board,
  pos: Position,
  enPassantTarget: Position | null,
  castlingRights: CastlingRights,
): Position[] {
  const [r, c] = pos;
  const piece = board[r][c];
  if (!piece) return [];

  const moves: Position[] = [];
  const color = piece.color;

  switch (piece.type) {
    case 'pawn':
      addPawnMoves(board, r, c, color, enPassantTarget, moves);
      break;
    case 'knight':
      addKnightMoves(board, r, c, color, moves);
      break;
    case 'bishop':
      addSlidingMoves(board, r, c, color, [[-1,-1],[-1,1],[1,-1],[1,1]], moves);
      break;
    case 'rook':
      addSlidingMoves(board, r, c, color, [[-1,0],[1,0],[0,-1],[0,1]], moves);
      break;
    case 'queen':
      addSlidingMoves(board, r, c, color, [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]], moves);
      break;
    case 'king':
      addKingMoves(board, r, c, color, castlingRights, moves);
      break;
  }

  return moves;
}

function addPawnMoves(
  board: Board,
  r: number,
  c: number,
  color: PieceColor,
  enPassantTarget: Position | null,
  moves: Position[],
): void {
  const dir = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;

  // Single push
  const nr = r + dir;
  if (inBounds(nr, c) && !board[nr][c]) {
    moves.push([nr, c]);
    // Double push
    const nr2 = r + dir * 2;
    if (r === startRow && !board[nr2][c]) {
      moves.push([nr2, c]);
    }
  }

  // Captures
  for (const dc of [-1, 1]) {
    const nc = c + dc;
    if (!inBounds(nr, nc)) continue;
    const target = board[nr][nc];
    if (target && target.color !== color) {
      moves.push([nr, nc]);
    }
    // En passant
    if (enPassantTarget && enPassantTarget[0] === nr && enPassantTarget[1] === nc) {
      moves.push([nr, nc]);
    }
  }
}

function addKnightMoves(
  board: Board,
  r: number,
  c: number,
  color: PieceColor,
  moves: Position[],
): void {
  const offsets: [number, number][] = [
    [-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1],
  ];
  for (const [dr, dc] of offsets) {
    const nr = r + dr;
    const nc = c + dc;
    if (!inBounds(nr, nc)) continue;
    const target = board[nr][nc];
    if (!target || target.color !== color) {
      moves.push([nr, nc]);
    }
  }
}

function addSlidingMoves(
  board: Board,
  r: number,
  c: number,
  color: PieceColor,
  directions: [number, number][],
  moves: Position[],
): void {
  for (const [dr, dc] of directions) {
    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc)) {
      const target = board[nr][nc];
      if (target) {
        if (target.color !== color) moves.push([nr, nc]);
        break;
      }
      moves.push([nr, nc]);
      nr += dr;
      nc += dc;
    }
  }
}

function addKingMoves(
  board: Board,
  r: number,
  c: number,
  color: PieceColor,
  castlingRights: CastlingRights,
  moves: Position[],
): void {
  // Normal king moves
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      const target = board[nr][nc];
      if (!target || target.color !== color) {
        moves.push([nr, nc]);
      }
    }
  }

  // Castling
  const enemyColor = opponent(color);
  if (isSquareAttacked(board, r, c, enemyColor)) return; // can't castle while in check

  if (color === 'white') {
    // Kingside
    if (castlingRights.wK && r === 7 && c === 4) {
      if (
        !board[7][5] && !board[7][6] &&
        board[7][7]?.type === 'rook' && board[7][7]?.color === 'white' &&
        !isSquareAttacked(board, 7, 5, enemyColor) &&
        !isSquareAttacked(board, 7, 6, enemyColor)
      ) {
        moves.push([7, 6]);
      }
    }
    // Queenside
    if (castlingRights.wQ && r === 7 && c === 4) {
      if (
        !board[7][3] && !board[7][2] && !board[7][1] &&
        board[7][0]?.type === 'rook' && board[7][0]?.color === 'white' &&
        !isSquareAttacked(board, 7, 3, enemyColor) &&
        !isSquareAttacked(board, 7, 2, enemyColor)
      ) {
        moves.push([7, 2]);
      }
    }
  } else {
    // Kingside
    if (castlingRights.bK && r === 0 && c === 4) {
      if (
        !board[0][5] && !board[0][6] &&
        board[0][7]?.type === 'rook' && board[0][7]?.color === 'black' &&
        !isSquareAttacked(board, 0, 5, enemyColor) &&
        !isSquareAttacked(board, 0, 6, enemyColor)
      ) {
        moves.push([0, 6]);
      }
    }
    // Queenside
    if (castlingRights.bQ && r === 0 && c === 4) {
      if (
        !board[0][3] && !board[0][2] && !board[0][1] &&
        board[0][0]?.type === 'rook' && board[0][0]?.color === 'black' &&
        !isSquareAttacked(board, 0, 3, enemyColor) &&
        !isSquareAttacked(board, 0, 2, enemyColor)
      ) {
        moves.push([0, 2]);
      }
    }
  }
}

// ─── Legal Move Generation ────────────────────────────────────

export function getLegalMoves(
  board: Board,
  pos: Position,
  enPassantTarget: Position | null,
  castlingRights: CastlingRights,
): Position[] {
  const piece = board[pos[0]][pos[1]];
  if (!piece) return [];

  const pseudoMoves = getPseudoLegalMoves(board, pos, enPassantTarget, castlingRights);
  const legalMoves: Position[] = [];

  for (const move of pseudoMoves) {
    const testBoard = cloneBoard(board);
    applyMoveOnBoard(testBoard, pos, move, enPassantTarget);
    if (!isInCheck(testBoard, piece.color)) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
}

/**
 * Applies a move on a board clone (for testing legality). No state tracking.
 */
function applyMoveOnBoard(
  board: Board,
  from: Position,
  to: Position,
  enPassantTarget: Position | null,
): void {
  const [fr, fc] = from;
  const [tr, tc] = to;
  const piece = board[fr][fc];
  if (!piece) return;

  // En passant capture
  if (piece.type === 'pawn' && enPassantTarget && tr === enPassantTarget[0] && tc === enPassantTarget[1]) {
    board[fr][tc] = null; // remove captured pawn
  }

  // Castling — move rook
  if (piece.type === 'king' && Math.abs(tc - fc) === 2) {
    if (tc === 6) {
      // Kingside
      board[fr][5] = board[fr][7];
      board[fr][7] = null;
    } else if (tc === 2) {
      // Queenside
      board[fr][3] = board[fr][0];
      board[fr][0] = null;
    }
  }

  board[tr][tc] = piece;
  board[fr][fc] = null;
}

// ─── Move Execution (full, with state updates) ───────────────

export interface MoveResult {
  board: Board;
  captured: Piece | null;
  enPassantTarget: Position | null;
  castlingRights: CastlingRights;
  isPromotion: boolean;
  notation: string;
}

export function executeMove(
  board: Board,
  from: Position,
  to: Position,
  enPassantTarget: Position | null,
  castlingRights: CastlingRights,
  promotionChoice?: PieceType,
): MoveResult {
  const newBoard = cloneBoard(board);
  const [fr, fc] = from;
  const [tr, tc] = to;
  const piece = newBoard[fr][fc]!;
  const targetPiece = newBoard[tr][tc];
  let captured: Piece | null = targetPiece;

  const newCastling = { ...castlingRights };

  // En passant capture
  const isEnPassant = piece.type === 'pawn' && enPassantTarget &&
    tr === enPassantTarget[0] && tc === enPassantTarget[1] && !targetPiece;

  if (isEnPassant) {
    captured = newBoard[fr][tc];
    newBoard[fr][tc] = null;
  }

  // Castling
  const isCastle = piece.type === 'king' && Math.abs(tc - fc) === 2;
  if (isCastle) {
    if (tc === 6) {
      newBoard[fr][5] = newBoard[fr][7];
      newBoard[fr][7] = null;
    } else if (tc === 2) {
      newBoard[fr][3] = newBoard[fr][0];
      newBoard[fr][0] = null;
    }
  }

  // Move piece
  newBoard[tr][tc] = piece;
  newBoard[fr][fc] = null;

  // Pawn promotion
  const promoRow = piece.color === 'white' ? 0 : 7;
  const isPromotion = piece.type === 'pawn' && tr === promoRow;
  if (isPromotion && promotionChoice) {
    newBoard[tr][tc] = { type: promotionChoice, color: piece.color };
  }

  // Update en passant target
  let newEnPassant: Position | null = null;
  if (piece.type === 'pawn' && Math.abs(tr - fr) === 2) {
    newEnPassant = [(fr + tr) / 2, fc];
  }

  // Update castling rights
  if (piece.type === 'king') {
    if (piece.color === 'white') {
      newCastling.wK = false;
      newCastling.wQ = false;
    } else {
      newCastling.bK = false;
      newCastling.bQ = false;
    }
  }
  if (piece.type === 'rook') {
    if (piece.color === 'white') {
      if (fr === 7 && fc === 0) newCastling.wQ = false;
      if (fr === 7 && fc === 7) newCastling.wK = false;
    } else {
      if (fr === 0 && fc === 0) newCastling.bQ = false;
      if (fr === 0 && fc === 7) newCastling.bK = false;
    }
  }
  // If rook is captured on its starting square
  if (tr === 7 && tc === 0) newCastling.wQ = false;
  if (tr === 7 && tc === 7) newCastling.wK = false;
  if (tr === 0 && tc === 0) newCastling.bQ = false;
  if (tr === 0 && tc === 7) newCastling.bK = false;

  // Generate algebraic notation
  const notation = generateNotation(
    board, piece, from, to, captured, isCastle, isEnPassant ?? false, isPromotion, promotionChoice,
    newBoard,
  );

  return {
    board: newBoard,
    captured,
    enPassantTarget: newEnPassant,
    castlingRights: newCastling,
    isPromotion: isPromotion && !promotionChoice,
    notation,
  };
}

// ─── Algebraic Notation ───────────────────────────────────────

const COL_LETTERS = 'abcdefgh';

function squareName(r: number, c: number): string {
  return `${COL_LETTERS[c]}${8 - r}`;
}

function pieceSymbol(type: PieceType): string {
  switch (type) {
    case 'king': return 'K';
    case 'queen': return 'Q';
    case 'rook': return 'R';
    case 'bishop': return 'B';
    case 'knight': return 'N';
    case 'pawn': return '';
  }
}

function generateNotation(
  oldBoard: Board,
  piece: Piece,
  from: Position,
  to: Position,
  captured: Piece | null,
  isCastle: boolean,
  isEnPassant: boolean,
  isPromotion: boolean,
  promotionChoice: PieceType | undefined,
  newBoard: Board,
): string {
  if (isCastle) {
    const enemyColor = opponent(piece.color);
    const checkSuffix = isInCheck(newBoard, enemyColor) ? '+' : '';
    return (to[1] === 6 ? 'O-O' : 'O-O-O') + checkSuffix;
  }

  let notation = '';
  const sym = pieceSymbol(piece.type);
  const isCapture = !!captured || isEnPassant;

  if (piece.type === 'pawn') {
    if (isCapture) {
      notation += COL_LETTERS[from[1]];
    }
  } else {
    notation += sym;
    // Disambiguation for non-pawn pieces
    const disambig = getDisambiguation(oldBoard, piece, from, to);
    notation += disambig;
  }

  if (isCapture) notation += 'x';
  notation += squareName(to[0], to[1]);

  if (isPromotion && promotionChoice) {
    notation += '=' + pieceSymbol(promotionChoice);
  }

  // Check / checkmate
  const enemyColor = opponent(piece.color);
  if (isInCheck(newBoard, enemyColor)) {
    notation += '+';
  }

  return notation;
}

function getDisambiguation(board: Board, piece: Piece, from: Position, to: Position): string {
  // Find other pieces of same type and color that can also reach target
  const others: Position[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (r === from[0] && c === from[1]) continue;
      const p = board[r][c];
      if (!p || p.type !== piece.type || p.color !== piece.color) continue;
      if (canPieceAttack(board, p, r, c, to[0], to[1])) {
        others.push([r, c]);
      }
    }
  }

  if (others.length === 0) return '';

  const sameCol = others.some(([, c]) => c === from[1]);
  const sameRow = others.some(([r]) => r === from[0]);

  if (!sameCol) return COL_LETTERS[from[1]];
  if (!sameRow) return String(8 - from[0]);
  return COL_LETTERS[from[1]] + String(8 - from[0]);
}

// ─── Piece Unicode Symbols ────────────────────────────────────

export function getPieceUnicode(piece: Piece): string {
  const symbols: Record<PieceColor, Record<PieceType, string>> = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
  };
  return symbols[piece.color][piece.type];
}
